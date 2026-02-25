import { Chat } from "../models/Chat.js";

const generateGroupCode = () => Math.floor(100000 + Math.random() * 900000);

export const createChat = async (req, res) => {
  const {
    chatName,
    description,
    chatImage,
    chatType = "group",
    groupCode = generateGroupCode(),
  } = req.body;
  const userId = req.user.userId;

  try {
    const chat = new Chat({
      chatName,
      description: description || "",
      chatImage: chatImage || "",
      chatType,
      owner: userId,
      members: [userId],
      created_at: new Date(),
      groupCode,
    });
    await chat.save();

    res.status(201).json({
      message: "Chat created successfully",
      chat: {
        _id: chat._id,
        chatName: chat.chatName,
        description: chat.description,
        chatImage: chat.chatImage,
        chatType: chat.chatType,
        members: chat.members,
        owner: chat.owner,
        created_at: chat.created_at,
        groupCode: chat.groupCode,
      },
    });
  } catch (err) {
    console.error("Create chat error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getChats = async (req, res) => {
  const userId = req.user.userId;

  try {
    const chats = await Chat.find({ members: userId })
      .populate("owner", "fullName userName image")
      .populate("members", "fullName userName image")
      .sort({ created_at: -1 }); //newest to oldest

    res.json({
      message: "Chats retrieved successfully",
      chats,
    });
  } catch (err) {
    console.error("Get chats error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getChatById = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.userId;

  try {
    const chat = await Chat.findById(chatId)
      .populate("owner", "fullName userName image")
      .populate("members", "fullName userName image");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is a member
    if (!chat.members.some((member) => member._id.toString() === userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({
      message: "Chat retrieved successfully",
      chat,
    });
  } catch (err) {
    console.error("Get chat error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getChatByGroupCode = async (req, res) => {
  const { groupCode } = req.params;

  try {
    const chat = await Chat.findOne({ groupCode: parseInt(groupCode) });

    if (!chat) {
      return res
        .status(404)
        .json({ message: "Chat not found with this group code" });
    }

    res.json({
      message: "Chat found",
      chatId: chat._id,
    });
  } catch (err) {
    console.error("Get chat by group code error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateChat = async (req, res) => {
  const { chatId } = req.params;
  const { chatName, description, chatImage } = req.body;
  const userId = req.user.userId;

  try {
    console.log("Update chat request:", {
      chatId,
      chatName,
      description,
      userId,
    });
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    console.log("Chat owner:", chat.owner.toString(), "User ID:", userId);

    // Only owner can update
    if (chat.owner.toString() !== userId) {
      return res.status(403).json({ message: "Only owner can update chat" });
    }

    if (chatName !== undefined) chat.chatName = chatName;
    if (description !== undefined) chat.description = description;
    if (chatImage !== undefined) chat.chatImage = chatImage;

    await chat.save();

    res.json({
      message: "Chat updated successfully",
      chat,
    });
  } catch (err) {
    console.error("Update chat error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteChat = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.userId;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Only owner can delete
    if (chat.owner.toString() !== userId) {
      return res.status(403).json({ message: "Only owner can delete chat" });
    }

    await Chat.findByIdAndDelete(chatId);

    res.json({
      message: "Chat deleted successfully",
    });
  } catch (err) {
    console.error("Delete chat error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const addMemberToChat = async (req, res) => {
  const { chatId } = req.params;
  const { userId: newMemberId } = req.body;
  const userId = req.user.userId;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Allow user to add themselves, or owner/members to add others
    if (
      newMemberId !== userId && // User adding themselves is always allowed
      chat.owner.toString() !== userId && // Owner can add anyone
      !chat.members.some((member) => member.toString() === userId) // Members can add others
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check if member already exists
    if (chat.members.some((member) => member.toString() === newMemberId)) {
      return res.status(400).json({ message: "User already in chat" });
    }

    chat.members.push(newMemberId);
    await chat.save();

    res.json({
      message: "Member added successfully",
      chat,
    });
  } catch (err) {
    console.error("Add member error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const removeMemberFromChat = async (req, res) => {
  const { chatId } = req.params;
  const { userId: memberToRemove } = req.body;
  const userId = req.user.userId;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Allow user to remove themselves, or owner to remove any member
    if (
      memberToRemove !== userId && // User removing themselves is always allowed
      chat.owner.toString() !== userId // Only owner can remove others
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    chat.members = chat.members.filter(
      (member) => member.toString() !== memberToRemove,
    );
    await chat.save();

    res.json({
      message: "Member removed successfully",
      chat,
    });
  } catch (err) {
    console.error("Remove member error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getUnreadMessages = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Import Message model
    const { Message } = await import("../models/Message.js");

    // Get all chats where user is a member
    const chats = await Chat.find({ members: userId }).select("_id chatName chatImage");

    // Get unread message count for each chat
    const unreadMessagesPerChat = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          userId: { $ne: userId }, // Exclude messages sent by the user
          readby: { $ne: userId }, // Messages not read by the user
        });

        return {
          chatId: chat._id,
          chatName: chat.chatName,
          chatImage: chat.chatImage,
          unreadCount,
        };
      })
    );

    res.json({
      message: "Unread messages retrieved successfully",
      data: unreadMessagesPerChat,
    });
  } catch (err) {
    console.error("Get unread messages error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
