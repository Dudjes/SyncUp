import cors from "cors";
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { loginUser, registerUser } from "../controllers/authController.js";
import {
  addMemberToChat,
  createChat,
  deleteChat,
  getChatByGroupCode,
  getChatById,
  getChats,
  getTotalUnreadMessages,
  getUnreadMessages,
  removeMemberFromChat,
  updateChat,
} from "../controllers/chatController.js";
import {
  getMessages,
  getMessagesTotalOfToday,
  markAllMessagesRead,
  markRead,
  sendMessage,
} from "../controllers/messageController.js";
import {
  acceptFriendRequest,
  changePassword,
  deleteUser,
  getAllUsersInfo,
  getFriendRequests,
  getFriends,
  getTotalUsers,
  getUserProfile,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
  updateUser,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const app = express();
const httpsServer = createServer(app);
const io = new Server(httpsServer, {
  cors: { origin: "*" },
});

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Make io available to controllers
app.set("io", io);

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
app.post("/chats", authMiddleware, createChat); // Create chat
app.get("/chats", authMiddleware, getChats); // Get all user's chats
app.get("/chats/unread", authMiddleware, getTotalUnreadMessages); // Get total unread messages
app.get("/chats/unread/:chatId", authMiddleware, getUnreadMessages); // Get unread messages per chat
app.get("/chats/:chatId", authMiddleware, getChatById); // Get specific chat
app.get("/chats/groupcode/:groupCode", getChatByGroupCode); // Get chat ID by group code
app.patch("/chats/:chatId", authMiddleware, updateChat); // Update chat
app.delete("/chats/:chatId", authMiddleware, deleteChat); // Delete chat
app.post("/chats/:chatId/members", authMiddleware, addMemberToChat); // Add member
app.delete("/chats/:chatId/members", authMiddleware, removeMemberFromChat); // Remove member

// Message routes
app.post("/messages", authMiddleware, sendMessage);
app.get("/messages/today", authMiddleware, getMessagesTotalOfToday);
app.get("/messages/:chatId", authMiddleware, getMessages);
app.patch("/messages/:messageId/read", authMiddleware, markRead);
app.patch("/messages/:chatId/read-all", authMiddleware, markAllMessagesRead);

//User routes
app.get("/users/me", authMiddleware, getUserProfile); // Get current user profile
app.patch("/users/:userId", authMiddleware, updateUser); // Update user profile
app.delete("/users/:userId", authMiddleware, deleteUser); // Delete user
app.patch("/users/:userId/password", authMiddleware, changePassword); // Update user password
app.get("/users/total", authMiddleware, getTotalUsers); // Get total amount of users
app.get("/users/info/:filter", authMiddleware, getAllUsersInfo); // Get all users there info with or without filter

// Friend request routes
app.post("/friends/requests", authMiddleware, sendFriendRequest); // Send friend request
app.get("/friends/requests", authMiddleware, getFriendRequests); // Get pending requests
app.post(
  "/friends/requests/:requestId/accept",
  authMiddleware,
  acceptFriendRequest,
); // Accept request
app.delete("/friends/requests/:requestId", authMiddleware, rejectFriendRequest); // Reject request

// Friend list routes
app.get("/friends", authMiddleware, getFriends); // Get friends
app.delete("/friends/:friendId", authMiddleware, removeFriend); // Remove friend

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("join-room", (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined room ${chatId}`);
  });

  socket.on("leave-room", (chatId) => {
    socket.leave(chatId);
  });

  socket.on("send_message", async (data) => {
    const { chatId, userId, text } = data;
    io.to(chatId).emit("receive_message", {
      chatId,
      userId,
      text,
      readBy: [],
      created_at: new Date(),
    });
  });

  socket.on("message_read", (data) => {
    const { chatId, messageId, userId } = data;
    io.to(chatId).emit("message_read_update", {
      messageId,
      userId,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

export { io };

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
