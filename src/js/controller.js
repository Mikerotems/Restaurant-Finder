const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./userModel");

const createUser = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "User accounts are temporarily unavailable." });
  }

  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = req.body?.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({ error: "Password must be at least 8 characters and no more than 72 UTF-8 bytes." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, password: passwordHash });
    return res.status(201).json({ message: "Registration successful." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }
    console.error("User registration failed:", error);
    return res.status(500).json({ error: "Unable to register right now. Please try again." });
  }
};

const loginUser = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "User accounts are temporarily unavailable." });
  }
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured.");
    return res.status(503).json({ error: "Login is temporarily unavailable." });
  }

  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = req.body?.password;
  if (
    !email ||
    typeof password !== "string" ||
    !password ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "45m" }
    );
    return res.status(200).json({ message: "Login successful.", token });
  } catch (error) {
    console.error("User login failed:", error);
    return res.status(500).json({
      error: "Unable to log in right now. Please try again."
    });
  }
};

module.exports = { createUser, loginUser };
