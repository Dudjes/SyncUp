import mongoose, { Schema } from "mongoose";

const friendRequestSchema = new Schema(
  {
    sentBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    sentTo: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    state: {
      type: String,
      required: true,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    sentAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "friendrequests" },
);

export const FriendRequest =
  mongoose.models.FriendRequest ||
  mongoose.model("FriendRequest", friendRequestSchema);
