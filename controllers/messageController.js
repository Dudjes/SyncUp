import { Chat } from "../models/Chat.js";
import { Message } from "../models/Message.js";
import { io } from "../SyncUpServer/server.js";

export const sendMessage = async (req, res) => {
  const { text, chatId } = req.body;
  const userId = req.user.userId;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is member of chat
    if (!chat.members.some((member) => member.toString() === userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const message = new Message({
      text,
      chatId,
      userId,
      created_at: new Date(),
      readby: [userId],
    });
    await message.save();

    // Update last message in chat
    chat.lastMessage = {
      messageId: message._id,
      text: message.text,
      senderId: message.userId,
      sentAt: message.created_at,
    };
    await chat.save();

    // Emit socket event for real-time message delivery
    io.to(chatId).emit("receive_message", {
      _id: message._id,
      text: message.text,
      userId: message.userId,
      chatId: message.chatId,
      created_at: message.created_at,
      readby: message.readby,
    });

    res.status(201).json({
      message: "Message sent successfully",
      data: {
        _id: message._id,
        text: message.text,
        userId: message.userId,
        chatId: message.chatId,
        created_at: message.created_at,
        readby: message.readby,
      },
    });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.userId;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is member
    if (!chat.members.some((member) => member.toString() === userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const messages = await Message.find({ chatId })
      .populate("userId", "fullName userName image")
      .sort({ created_at: 1 });

    res.json({
      message: "Messages retrieved successfully",
      messages,
    });
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const markRead = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.userId;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user already read
    if (message.readby.some((id) => id.toString() === userId)) {
      return res.status(400).json({ message: "Already marked as read" });
    }

    message.readby.push(userId);
    await message.save();

    // Emit socket event for real-time read receipt
    io.to(message.chatId.toString()).emit("message_read_update", {
      messageId: message._id,
      userId,
      timestamp: new Date(),
    });

    res.json({
      message: "Message marked as read",
      readby: message.readby,
    });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
