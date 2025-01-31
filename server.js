require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// CORS Configuration
const corsOptions = {
  origin: ["http://10.0.0.178:8000", "http://localhost:3000"], // Replace with your frontend URL in production
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions)); // Apply CORS globally
app.options("*", cors(corsOptions)); // Handle preflight requests

// Force CORS Headers (Ensures they are included in every response)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://10.0.0.178:8000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  console.log("CORS Headers Set:", res.getHeaders()); // Debugging
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Middleware for JSON & URL-encoded Data Parsing
app.use(express.json()); // Parses JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded form data

// Route Imports
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Test Route to Ensure Server is Running
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
