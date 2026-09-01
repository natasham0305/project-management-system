const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

async function register(req, res) {
  try {
    const { username, email, password, confirmPassword } = req.body;
    console.log("REGISTER BODY:", req.body);
    console.log("USERNAME:", username, typeof username);

    if (!username || !username.trim()) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Validate password
    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // Validate confirm password
    if (!confirmPassword) {
      return res.status(400).json({
        message: "Please confirm your password",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Normalize user data
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existingUser = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create ser

    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Failed to register user",
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate email

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Validate password

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    //
    // Find user
    const user = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Failed to login",
    });
  }
}

module.exports = {
  register,
  login,
};
