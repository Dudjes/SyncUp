import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    text: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    readby: [{ type: Schema.Types.ObjectId, ref: "User" }],
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { collection: "messages" },
);

export const Message =
    mongoose.models.Message || mongoose.model("Message", messageSchema);
