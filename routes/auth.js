const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth"); // Import authentication middleware

const router = express.Router();

// Register User (with Role Selection)
router.post("/register", async (req, res) => {
  try {
    console.log("Register endpoint hit");
    console.log("Received data:", req.body); // Log received fata *debug*

    const { username, email, password, role } = req.body;

    // Validate role
    if (!["creator", "customer"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role selected." });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to database with role
    user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    console.log("User registered successfully as", role);

    res.status(201).json({ msg: `User registered successfully as ${role}`, user: { username, email, role } });
  } catch (err) {
    console.error("Error in register route:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login User (Return Role)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Delete User by ID (Requires Authentication)
router.delete("/delete/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.params.id;
  
      // Ensure the logged-in user is deleting their own account OR an admin is performing the action
      if (req.user.id !== userId && req.user.role !== "admin") {
        return res.status(403).json({ msg: "Unauthorized: You can only delete your own account unless you are an admin" });
      }
  
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
  
      // Delete user
      await User.findByIdAndDelete(userId);
  
      res.json({ msg: "User deleted successfully" });
    } catch (err) {
      console.error("Error in delete route:", err);
      res.status(500).json({ msg: "Server error" });
    }
  });
  
  // Delete by Username (Requires Authentication)
  router.delete("/delete/username/:username", authMiddleware, async (req, res) => {
    try {
      const username = req.params.username;
  
      // Check if user exists
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
  
      // Ensure the logged-in user is deleting their own account OR an admin is performing the action
      if (req.user.username !== username && req.user.role !== "admin") {
        return res.status(403).json({ msg: "Unauthorized: You can only delete your own account unless you are an admin" });
      }
  
      // Delete user
      await User.findOneAndDelete({ username });
  
      res.json({ msg: "User deleted successfully" });
    } catch (err) {
      console.error("Error in delete route:", err);
      res.status(500).json({ msg: "Server error" });
    }
  });
  

module.exports = router;
