import cors from "cors";
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { registerUser, loginUser } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createChat,
  getChats,
  getChatById,
  updateChat,
  deleteChat,
  addMemberToChat,
  removeMemberFromChat,
} from "../controllers/chatController.js";
import { sendMessage, getMessages, markRead } from "../controllers/messageController.js";


const app = express();
const httpsServer = createServer(app);
const io = new Server(httpsServer, {
  cors: {origin: "*"}
});

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

// Chat routes (all need authMiddleware)
app.post("/chats", authMiddleware, createChat);           // Create chat
app.get("/chats", authMiddleware, getChats);             // Get all user's chats
app.get("/chats/:chatId", authMiddleware, getChatById);  // Get specific chat
app.patch("/chats/:chatId", authMiddleware, updateChat); // Update chat
app.delete("/chats/:chatId", authMiddleware, deleteChat);  // Delete chat
app.post("/chats/:chatId/members", authMiddleware, addMemberToChat);      // Add member
app.delete("/chats/:chatId/members", authMiddleware, removeMemberFromChat); // Remove member

// Message routes
app.post("/messages", authMiddleware, sendMessage);
app.get("/messages/:chatId", authMiddleware, getMessages);
app.patch("/messages/:messageId/read", authMiddleware, markRead);

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("join-room", (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined room ${chatId}`);
  });

  socket.on("leave-room", (chatId) =>{
    socket.leave(chatId);
  });

  socket.on("send_message", async (data) => {
    const {chatId, userId, text} = data;
    io.to(chatId).emit("receive_message", {
      chatId, 
      userId, 
      text, 
      readBy: [],
      created_at: new Date(),
    });
  });

  socket.on("message_read", (data) => {
    const {chatId, messageId, userId} = data;
    io.to(chatId).emit("message_read_update", {
      messageId,
      userId,
      timestamp: new Date()
    });
  });
  
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
})

export {io};

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
  httpsServer.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
  });
});
