import bcrypt from "bcryptjs";
import { Chat } from "../models/Chat.js";
import { FriendRequest } from "../models/FriendRequest.js";
import { User } from "../models/User.js";

export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { fullName, userName, email, role, image, settings } = req.body;
  const currentUserId = req.user.userId;

  try {
    const currentUser = await User.findById(currentUserId); // The editor
    const targetUser = await User.findById(userId); // The user being edited

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isAdmin = currentUser.role === "admin";
    const isSelf = userId === currentUserId;

    if (!isSelf && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only edit your own account" });
    }

    if (role && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admins can change roles" });
    }

    const allowedFields = [
      "fullName",
      "userName",
      "email",
      "role",
      "image",
      "settings",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        targetUser[field] = req.body[field];
      }
    });

    await targetUser.save();

    const updatedUser = targetUser.toObject();

    return res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Update chat error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getFriends = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId).populate(
      "friends",
      "fullName userName image",
    );

    res.json({
      message: "Friendlist retrieved successfully",
      friends: user.friends,
    });
  } catch (err) {
    console.error("Get friends error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const sendFriendRequest = async (req, res) => {
  const userId = req.user.userId;
  const { friendCode } = req.body;

  try {
    const sender = await User.findById(userId);
    const recipient = await User.findOne({ friendcode: friendCode });

    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    if (recipient._id.toString() === userId) {
      return res
        .status(400)
        .json({ message: "Cannot send request to yourself" });
    }

    if (sender.friends.some((id) => id.toString() === recipient._id.toString())) {
      return res.status(400).json({ message: "User is already a friend" });
    }

    // Check if request already exists
    const requestExists = await FriendRequest.findOne({
      sentBy: userId,
      sentTo: recipient._id,
      state: "pending",
    });

    if (requestExists) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // Create new friend request
    const newRequest = await FriendRequest.create({
      sentBy: userId,
      sentTo: recipient._id,
    });

    // Emit socket event to recipient
    const io = req.app.get("io");
    if (io) {
      io.emit(`friend-request-${recipient._id}`, {
        type: "new_request",
        requestId: newRequest._id,
      });
    }

    res.status(201).json({ message: "Friend request sent" });
  } catch (err) {
    console.error("Send friend request error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getFriendRequests = async (req, res) => {
  const userId = req.user.userId;

  try {
    const requests = await FriendRequest.find({
      sentTo: userId,
      state: "pending",
    }).populate("sentBy", "fullName userName image");

    res.json({
      message: "Friend requests retrieved successfully",
      requests: requests,
    });
  } catch (err) {
    console.error("Get friend requests error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId)
      .select("-password")
      .populate("friends", "fullName userName image lastSeen");

    const friendRequests = await FriendRequest.find({
      sentTo: userId,
      state: "pending",
    }).populate("sentBy", "fullName userName image");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      ...user.toObject(),
      friendRequests,
    });
  } catch (err) {
    console.error("Get user profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const acceptFriendRequest = async (req, res) => {
  const userId = req.user.userId;
  const { requestId } = req.params;

  try {
    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.sentTo.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: Not your request" });
    }

    // Convert to strings to ensure consistency
    const receiverId = userId.toString();
    const senderId = request.sentBy.toString();

    // Add both users to each other's friends list
    const receiverUpdate = await User.findByIdAndUpdate(
      receiverId,
      { $addToSet: { friends: senderId } },
      { new: true },
    );

    const senderUpdate = await User.findByIdAndUpdate(
      senderId,
      { $addToSet: { friends: receiverId } },
      { new: true },
    );

    request.state = "accepted";
    await request.save();

    // Create a private chat between both users with the other person's name
    const generateGroupCode = () => Math.floor(100000 + Math.random() * 900000);
    const senderUser = await User.findById(senderId);
    
    const privateChat = new Chat({
      chatName: senderUser.userName || senderUser.fullName, // Show sender's name to receiver
      description: "",
      chatImage: senderUser.image || "",
      chatType: "private",
      owner: receiverId,
      members: [receiverId, senderId],
      created_at: new Date(),
      groupCode: generateGroupCode(),
    });
    await privateChat.save();

    // Emit socket events to both users
    const io = req.app.get("io");
    if (io) {
      io.emit(`friend-request-${receiverId}`, { type: "request_accepted" });
      io.emit(`friend-request-${senderId}`, { type: "friend_added" });
    }

    res.json({ message: "Friend request accepted", chat: privateChat });
  } catch (err) {
    console.error("Accept friend request error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const rejectFriendRequest = async (req, res) => {
  const userId = req.user.userId;
  const { requestId } = req.params;

  try {
    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.sentTo.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: Not your request" });
    }

    request.state = "declined";
    await request.save();

    // Emit socket event to recipient
    const io = req.app.get("io");
    if (io) {
      io.emit(`friend-request-${userId}`, { type: "request_declined" });
    }

    res.json({ message: "Friend request declined" });
  } catch (err) {
    console.error("Reject friend request error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const removeFriend = async (req, res) => {
  const userId = req.user.userId;
  const { friendId } = req.params;

  try {
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    //delete requests between the two
    await FriendRequest.deleteMany({
      $or: [
        { sender: userId, recipient: friendId },
        { sender: friendId, recipient: userId },
      ],
    });

    res.json({ message: "Friend removed successfully" });
  } catch (err) {
    console.error("Remove friend error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const changePassword = async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if password is valid
    const isPasswordvalid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordvalid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash and save new pass
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password succesfully updated" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getTotalUsers = async (req, res) => {
  try {
    const total = await User.countDocuments();
    res.status(200).json({ total });
  } catch (err) {
    res.status(500).json({ message: "Failed to get total users", err });
  }
};

export const getAllUsersInfo = async (req, res) => {
  try {
    const { filter } = req.params;

    const searchFilter =
      filter && filter !== "all"
        ? {
            $or: [
              { fullName: { $regex: filter, $options: "i" } },
              { userName: { $regex: filter, $options: "i" } },
              { email: { $regex: filter, $options: "i" } },
            ],
          }
        : {};

    const users = await User.find(searchFilter).select("-password");

    res.status(200).json({ users });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get users", error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.userId;

  try {
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Only admins can delete users
    if (currentUser.role !== "owner") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admins can delete users" });
    }

    // Cannot delete yourself
    if (userId === currentUserId) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    // Delete all friend requests involving this user
    await FriendRequest.deleteMany({
      $or: [{ sentBy: userId }, { sentTo: userId }],
    });

    // Remove user from all friends' friend lists
    await User.updateMany({ friends: userId }, { $pull: { friends: userId } });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
