const jwt = require("jsonwebtoken");
const { User } = require("../models");

async function authenticateToken(req, res, next) {
  let decoded;

  try {
    const token = req.cookies?.project_management_token;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  try {
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "username", "email", "role"],
    });

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user.get({ plain: true });
    next();
  } catch (error) {
    console.error("Failed to load authenticated user:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
}

module.exports = authenticateToken;
