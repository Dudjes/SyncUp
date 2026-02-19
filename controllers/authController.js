import bcrypt from "bcryptjs";
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

    res.status(201).json({ message: "Account created successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
