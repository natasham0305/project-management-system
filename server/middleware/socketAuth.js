const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const { User } = require("../models");

const parseCookieHeader =
  cookie.parse || cookie.parseCookie ||
  (typeof cookie === "function" ? cookie : null);

async function socketAuth(socket, next) {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error("Authentication required"));
    }

    if (typeof parseCookieHeader !== "function") {
      return next(new Error("Cookie parser is unavailable"));
    }

    const cookies = parseCookieHeader(cookieHeader);
    const token = cookies.project_management_token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "username", "email", "role"],
    });

    if (!user) {
      return next(new Error("User no longer exists"));
    }

    socket.user = user.get({ plain: true });
    return next();
  } catch (error) {
    console.error("Socket authentication failed:", error.message);

    next(new Error("Invalid or expired token"));
  }
}

module.exports = socketAuth;
