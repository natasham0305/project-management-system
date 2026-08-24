const express = require("express");

const {
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} = require("../controllers/projectMemberController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRole");

const router = express.Router();

router.get(
  "/projects/:projectId/members",
  authenticateToken,
  getProjectMembers,
);

router.post(
  "/projects/:projectId/members",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  addProjectMember,
);

router.delete(
  "/projects/:projectId/members/:userId",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  removeProjectMember,
);

module.exports = router;
