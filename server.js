const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);



//express json middleware
app.use(express.json());



// mongoose schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  //resetPasswordToken: { type: String }, 
  //resetPasswordExpires: { type: Date }, 
});
const User = mongoose.model("User", userSchema);




// register route
app.post("/auth/v1/register", async (req, res) => {
  try {
    const { name = '', email, password } = req.body;
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// login route with database check and edge cases
app.post("/auth/v1/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
      }

      // validation
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Check if password matches
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }
    // Success response
    res.status(200).json({ message: "Logged in" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post("/auth/v1/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    console.log(`Password reset link sent to ${email}: ${resetUrl}`);

    res.status(200).json({
      message: "Password reset link generated successfully",
      token: resetToken, // Sending token back for testing/development
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



//user searching
app.get("/auth/v1/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



//port and mongo connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI).then(() => {
    console.log("Connected to MongoDB successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
