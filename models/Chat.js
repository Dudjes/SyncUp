import mongoose, { Schema } from "mongoose";

const lastMessageSchema = new Schema(
  {
    messageId: { type: Schema.Types.ObjectId },
    text: { type: String },
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    sentAt: { type: Date },
  },
  { _id: false },
);

const chatSchema = new Schema(
  {
    chatName: { type: String, default: "" },
    chatImage: { type: String, default: "" },
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    chatType: {
      type: String,
      required: true,
      enum: ["private", "group"],
      default: "private",
    },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    lastMessage: { type: lastMessageSchema, default: null },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "chats" },
);

export const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
