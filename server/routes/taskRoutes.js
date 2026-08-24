const express = require("express");

const {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRole");

const router = express.Router();

router.get("/projects/:projectId/tasks", authenticateToken, getTasksByProject);

router.post(
  "/projects/:projectId/tasks",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  createTask,
);

router.put("/tasks/:id", authenticateToken, updateTask);

router.delete(
  "/tasks/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteTask,
);

module.exports = router;
