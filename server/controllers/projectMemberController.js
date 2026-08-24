const { Project, User } = require("../models");

async function getProjectMembers(req, res) {
  try {
    const { projectId } = req.params;

    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: "members",
          attributes: ["id", "username", "email", "role"],
          through: {
            attributes: [],
          },
        },
      ],
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json(project.members);
  } catch (error) {
    console.error("Error fetching project members:", error);

    res.status(500).json({
      message: "Failed to fetch project members",
    });
  }
}

async function addProjectMember(req, res) {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (req.user.role === "manager" && project.manager_id !== req.user.id) {
      return res.status(403).json({
        message: "You can only manage members of your own projects",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await project.addMember(user);

    res.status(201).json({
      message: "User added to project",
    });
  } catch (error) {
    console.error("Error adding project member:", error);

    res.status(500).json({
      message: "Failed to add project member",
    });
  }
}

async function removeProjectMember(req, res) {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (req.user.role === "manager" && project.manager_id !== req.user.id) {
      return res.status(403).json({
        message: "You can only manage members of your own projects",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await project.removeMember(user);

    res.status(200).json({
      message: "User removed from project",
    });
  } catch (error) {
    console.error("Error removing project member:", error);

    res.status(500).json({
      message: "Failed to remove project member",
    });
  }
}

module.exports = {
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
};
