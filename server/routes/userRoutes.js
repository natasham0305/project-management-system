const express = require("express");

const { getUsers, updateUserRole } = require("../controllers/userController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRole");

const router = express.Router();

router.get("/", authenticateToken, authorizeRoles("admin"), getUsers);

router.put(
  "/:id/role",
  authenticateToken,
  authorizeRoles("admin"),
  updateUserRole,
);

module.exports = router;
