import cors from "cors";
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import { registerUser, loginUser } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/register", registerUser);
app.post("/login", loginUser);

// Example protected route
app.get("/me", authMiddleware, async (req, res) => {
  try {
    const User = (await import("../models/User.js")).User;
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  }
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
  });
});
