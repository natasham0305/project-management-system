const express = require("express");

const {
  getProjectById,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const {
  getProjectMessages,
  createProjectMessage,
  deleteProjectMessage,
  downloadProjectAttachment,
} = require("../controllers/projectMessageController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRole");
const upload = require("../middleware/upload");

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

//PROJECT MESSAGE ROUTES

router.get("/:projectId/messages", authenticateToken, getProjectMessages);

router.post(
  "/:projectId/messages",
  authenticateToken,
  upload.single("file"),
  createProjectMessage,
);

router.delete(
  "/:projectId/messages/:messageId",
  authenticateToken,
  deleteProjectMessage,
);

router.get(
  "/:projectId/attachments/:attachmentId",
  authenticateToken,
  downloadProjectAttachment,
);

module.exports = router;
