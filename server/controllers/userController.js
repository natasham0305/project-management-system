const { User } = require("../models");

async function getUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email", "role"],
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
}

async function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;
  const allowedRoles = ["admin", "manager", "member", "viewer"];

  try {
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({
      role,
    });

    return res.status(200).json({
      message: "User role updated successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error updating role" + error);

    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getUsers,
  updateUserRole,
};
