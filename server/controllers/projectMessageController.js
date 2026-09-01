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
module.exports = {
  getProjectMessages,
  createProjectMessage,
  deleteProjectMessage,
};
