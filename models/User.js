import mongoose, { Schema } from "mongoose";

const userSettingsSchema = new Schema(
  {
    darkmode: { type: Boolean, required: true, default: false },
    language: { type: String, required: true, default: "en" },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    userName: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    image: { type: String, default: "" },
    created_at: { type: Date, default: Date.now },
    lastSeen: { type: Date, required: true, default: Date.now },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendcode: { type: Number, required: true },
    settings: { type: userSettingsSchema, required: true },
  },
  { collection: "users" },
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
