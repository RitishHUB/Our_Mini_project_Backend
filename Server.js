const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(
  "mongodb+srv://loguritish28_db_user:uuZviPoBo1AoxoQ0@cluster0.bi95ca8.mongodb.net/learnx?retryWrites=true&w=majority"
)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(" DB Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

// Register API
app.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const newUser = new User({ email, username, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login API
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (password !== user.password) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, "secretkey", { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: " Server error" });
  }
});

// AI API using Cohere
app.post("/api/ai", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await axios.post(
      "https://api.cohere.ai/v1/chat",   
      {
        model: "command-r",             
        message: prompt                
      },
      {
        headers: {
          Authorization: `Bearer rYeSHXbJmSAQ6pw0KIKextTAWHnB27W8FlOpbKhb`,
          "Content-Type": "application/json"
        },
      }
    );

    res.json({ answer: response.data.text });
  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    res.status(500).json({ message: " AI request failed" });
  }
});


// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
