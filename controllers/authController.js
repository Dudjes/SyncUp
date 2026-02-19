import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const generateFriendCode = () => Math.floor(100000 + Math.random() * 900000);

export const registerUser = async (req, res) => {
  const { fullName, userName, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();

    const user = new User({
      fullName,
      userName,
      email,
      password: hashedPassword,
      role: "user",
      image: "",
      created_at: now,
      lastSeen: now,
      friends: [],
      friendcode: generateFriendCode(),
      friendRequests: [],
      settings: { darkmode: false, language: "en" },
    });
    await user.save();

    // Generate JWT token for auto-login
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        userId: user._id,
        fullName: user.fullName,
        userName: user.userName,
        email: user.email,
        image: user.image,
        friendcode: user.friendcode,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        userId: user._id,
        fullName: user.fullName,
        userName: user.userName,
        email: user.email,
        image: user.image,
        friendcode: user.friendcode,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
