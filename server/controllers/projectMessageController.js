const fs = require("fs/promises");
const path = require("path");

const {
  Project,
  User,
  ProjectMessage,
  MessageAttachment,
} = require("../models");

async function getProjectMessages(req, res) {
  try {
    const { projectId } = req.params;

    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: "members",
          attributes: ["id"],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Authorization

    const isManager = Number(project.manager_id) === Number(req.user.id);

    const isMember = project.members.some(
      (member) => Number(member.id) === Number(req.user.id),
    );

    if (req.user.role !== "admin" && !isManager && !isMember) {
      return res.status(403).json({
        message: "You can only read chats of your own projects",
      });
    }

    const messages = await ProjectMessage.findAll({
      where: {
        project_id: projectId,
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "role"],
        },
        {
          model: MessageAttachment,
          as: "attachments",
        },
      ],
      order: [["created_at", "ASC"]],
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching project messages:", error);

    return res.status(500).json({
      message: "Failed to fetch project messages",
    });
  }
}

async function createProjectMessage(req, res) {
  console.log("CONTENT-TYPE:", req.headers["content-type"]);
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);
  try {
    const { projectId } = req.params;
    const message = req.body?.message || "";

    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: "members",
          attributes: ["id"],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    //AUTHORIZATION
    const isManager = Number(project.manager_id) === Number(req.user.id);

    const isMember = project.members.some(
      (member) => Number(member.id) === Number(req.user.id),
    );

    if (req.user.role !== "admin" && !isManager && !isMember) {
      return res.status(403).json({
        message: "You can only send messages in your own projects",
      });
    }

    // Require either text or a file
    if (!message?.trim() && !req.file) {
      return res.status(400).json({
        message: "Message or attachment is required",
      });
    }

    // Create message
    const newMessage = await ProjectMessage.create({
      project_id: projectId,
      sender_id: req.user.id,
      message: message?.trim() || "",
    });

    // Create attachment record when file exists
    if (req.file) {
      await MessageAttachment.create({
        message_id: newMessage.id,
        file_name: req.file.originalname,
        file_url: `/uploads/chat/${req.file.filename}`,
        file_type: req.file.mimetype,
        file_size: req.file.size,
      });
    }

    // Fetch complete message
    const messageWithSender = await ProjectMessage.findByPk(newMessage.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "role"],
        },
        {
          model: MessageAttachment,
          as: "attachments",
        },
      ],
    });

    // Real-time event
    const io = req.app.get("io");

    io.to(`project-${projectId}`).emit("newProjectMessage", messageWithSender);

    return res.status(201).json(messageWithSender);
  } catch (error) {
    console.error("Error creating project message:", error);

    return res.status(500).json({
      message: "Failed to create project message",
    });
  }
}

async function deleteProjectMessage(req, res) {
  try {
    console.log("DELETE params:", req.params);
    const { projectId, messageId } = req.params;

    const message = await ProjectMessage.findOne({
      where: {
        id: messageId,
        project_id: projectId,
      },
      include: [
        {
          model: MessageAttachment,
          as: "attachments",
        },
      ],
    });

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    const isSender = Number(message.sender_id) === Number(req.user.id);

    const isAdmin = req.user.role === "admin";

    if (!isAdmin && !isSender) {
      return res.status(403).json({
        message: "You cannot delete this message",
      });
    }

    // Delete physical attachment files
    for (const attachments of message.attachments || []) {
      const filename = path.basename(attachments.file_url);
      const filePath = path.join(__dirname, "../uploads/chat", filename);

      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error("Failed to delete attachment file:", error);
        }
      }
    }

    // delete the record from the database
    await MessageAttachment.destroy({
      where: {
        message_id: messageId,
      },
    });

    //  delete the actuall message
    await message.destroy();

    return res.status(200).json({
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project message:", error);

    return res.status(500).json({
      message: "Failed to delete project message",
    });
  }
}

async function downloadProjectAttachment(req, res) {
  try {
    const { projectId, attachmentId } = req.params;

    // Find the project and its members
    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: "members",
          attributes: ["id"],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check project access
    const isManager = Number(project.manager_id) === Number(req.user.id);

    const isMember = project.members.some(
      (member) => Number(member.id) === Number(req.user.id),
    );

    const isAdmin = req.user.role === "admin";

    if (!isAdmin && !isManager && !isMember) {
      return res.status(403).json({
        message: "You cannot access this attachment",
      });
    }

    // Find attachment and its related message
    const attachment = await MessageAttachment.findByPk(attachmentId, {
      include: [
        {
          model: ProjectMessage,
          as: "message",
          attributes: ["id", "project_id"],
        },
      ],
    });

    if (!attachment) {
      return res.status(404).json({
        message: "Attachment not found",
      });
    }

    // Ensure the attachment belongs to the requested project
    if (Number(attachment.message.project_id) !== Number(projectId)) {
      return res.status(404).json({
        message: "Attachment not found in this project",
      });
    }

    // Extract only the generated filename
    const filename = path.basename(attachment.file_url);

    const filePath = path.join(__dirname, "../uploads/chat", filename);

    // Check whether the physical file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        message: "Physical attachment file not found",
      });
    }

    return res.sendFile(filePath, {
      headers: {
        "Content-Disposition": `inline; filename="${attachment.file_name}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading project attachment:", error);

    return res.status(500).json({
      message: "Failed to download attachment",
    });
  }
}

module.exports = {
  getProjectMessages,
  createProjectMessage,
  deleteProjectMessage,
  downloadProjectAttachment,
};
