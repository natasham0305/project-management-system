const { Task, User, Project } = require("../models");

async function isProjectMember(projectId, userId) {
  const project = await Project.findByPk(projectId, {
    include: [
      {
        model: User,
        as: "members",
        attributes: ["id"],
        through: {
          attributes: [],
        },
      },
    ],
  });

  if (!project) {
    return null;
  }

  return project.members.some((member) => member.id === Number(userId));
}

async function getTasksByProject(req, res) {
  try {
    const { projectId } = req.params;

    const tasks = await Task.findAll({
      where: {
        project_id: projectId,
      },
      include: [
        {
          model: User,
          as: "assignee",
          attributes: ["id", "username", "email", "role"],
        },
      ],
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);

    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
}

async function createTask(req, res) {
  try {
    const { projectId } = req.params;

    const { title, description, priority, status, assigned_to } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Manager can manage only their own projects
    if (
      req.user.role === "manager" &&
      Number(project.manager_id) !== Number(req.user.id)
    ) {
      return res.status(403).json({
        message: "You can only manage tasks in your own projects",
      });
    }

    // If assigning a user, make sure they belong to the project
    if (
      assigned_to !== undefined &&
      assigned_to !== null &&
      assigned_to !== ""
    ) {
      const member = await isProjectMember(projectId, assigned_to);

      if (member === null) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      if (!member) {
        return res.status(400).json({
          message: "Assigned user is not a member of this project",
        });
      }
    }

    const task = await Task.create({
      project_id: projectId,
      title,
      description,
      priority,
      status,
      assigned_to: assigned_to || null,
    });

    const createdTask = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: "assignee",
          attributes: ["id", "username", "email", "role"],
        },
      ],
    });

    res.status(201).json(createdTask);
  } catch (error) {
    console.error("Error creating task:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
}
async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, description, priority, status, assigned_to } = req.body;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const { id: userId, role } = req.user;

    // MEMBER
    // Can only update the status of a task assigned to themselves
    if (role === "member") {
      if (Number(task.assigned_to) !== Number(userId)) {
        return res.status(403).json({
          message: "You can only update tasks assigned to you",
        });
      }

      await task.update({
        status,
      });

      const updatedTask = await Task.findByPk(task.id, {
        include: [
          {
            model: User,
            as: "assignee",
            attributes: ["id", "username", "email", "role"],
          },
        ],
      });

      return res.status(200).json(updatedTask);
    }

    // VIEWER
    // Cannot update tasks
    if (role === "viewer") {
      return res.status(403).json({
        message: "You do not have permission to update tasks",
      });
    }

    // ADMIN / MANAGER
    // Find the project this task belongs to
    const project = await Project.findByPk(task.project_id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // MANAGER
    // Can manage tasks only in their own projects
    if (role === "manager" && Number(project.manager_id) !== Number(userId)) {
      return res.status(403).json({
        message: "You can only manage tasks in your own projects",
      });
    }

    // If assigning the task to a user,
    // make sure that user belongs to this project
    if (
      assigned_to !== undefined &&
      assigned_to !== null &&
      assigned_to !== ""
    ) {
      const projectMember = await isProjectMember(task.project_id, assigned_to);

      if (!projectMember) {
        return res.status(400).json({
          message: "Assigned user is not a member of this project",
        });
      }
    }

    // Update task
    await task.update({
      title,
      description,
      priority,
      status,
      assigned_to: assigned_to || null,
    });

    // Fetch updated task together with assignee
    const updatedTask = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: "assignee",
          attributes: ["id", "username", "email", "role"],
        },
      ],
    });

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await task.destroy();

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
}

module.exports = {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
};
