const express = require("express");

const {
  getProjectById,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRole");

const router = express.Router();

router.get("/", authenticateToken, getProjects);

router.get("/:id", authenticateToken, getProjectById);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  createProject,
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  updateProject,
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteProject,
);

module.exports = router;
