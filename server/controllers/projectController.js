const { Project, User } = require("../models");

async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({
      message: "Failed to fetch project",
    });
  }
}

async function getProjects(req, res) {
  try {
    const projects = await Project.findAll();
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);

    res.status(500).json({
      message: "Failed to fetch projects",
    });
  }
}

async function createProject(req, res) {
  try {
    const { name, description, priority, status } = req.body;
    let { manager_id } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    if (!priority) {
      return res.status(400).json({
        message: "Priority is required",
      });
    }

    const allowedPriorities = ["Low", "Medium", "High"];
    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority",
      });
    }

    if (req.user.role === "admin" && !manager_id) {
      return res.status(400).json({
        message: "Manager is required",
      });
    }

    if (req.user.role === "manager") {
      manager_id = req.user.id;
    }

    const user = await User.findByPk(manager_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "manager") {
      return res.status(400).json({
        message: "Selected user must have the manager role",
      });
    }

    const project = await Project.create({
      name,
      description,
      priority,
      status,
      manager_id,
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);

    res.status(500).json({
      message: "Failed to create project",
    });
  }
}

async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const { name, description, priority, status } = req.body;
    let { manager_id } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    if (!priority) {
      return res.status(400).json({
        message: "Priority is required",
      });
    }

    const allowedPriorities = ["Low", "Medium", "High"];
    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority",
      });
    }

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Manager can edit only their own project
    if (req.user.role === "manager") {
      if (Number(project.manager_id) !== Number(req.user.id)) {
        return res.status(403).json({
          message: "You can only manage your own projects",
        });
      }

      // Manager cannot change the manager
      manager_id = project.manager_id;
    }

    // Admin must provide a manager
    if (req.user.role === "admin" && !manager_id) {
      return res.status(400).json({
        message: "Manager is required",
      });
    }

    // Validate selected manager
    const manager = await User.findByPk(manager_id);

    if (!manager) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (manager.role !== "manager") {
      return res.status(400).json({
        message: "Selected user must have the manager role",
      });
    }

    await project.update({
      name,
      description,
      priority,
      status,
      manager_id,
    });

    return res.status(200).json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({
      message: "Failed to update project",
    });
  }
}

async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    await project.destroy();

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);

    res.status(500).json({
      message: "Failed to delete project",
    });
  }
}

module.exports = {
  getProjectById,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};
