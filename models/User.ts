import mongoose, { Schema } from "mongoose";

export type ObjectId = string;

export type FriendRequestState = "pending" | "accepted" | "declined";

export interface IFriendRequest {
  sentBy: ObjectId;
  state: FriendRequestState;
  sentAt: Date;
}

export interface IUserSettings {
  darkmode: boolean;
  language: string;
}

export interface IUser {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  role: string;
  image: string;
  created_at: Date;
  lastSeen: Date;
  friends: ObjectId[];
  friendcode: number;
  friendRequests: IFriendRequest[];
  settings: IUserSettings;
}

const friendRequestSchema = new Schema(
  {
    sentBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    state: {
      type: String,
      required: true,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    sentAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const userSettingsSchema = new Schema(
  {
    darkmode: { type: Boolean, required: true, default: false },
    language: { type: String, required: true, default: "en" },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    userName: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: "user" },
    image: { type: String, required: true, default: "" },
    created_at: { type: Date, required: true, default: Date.now },
    lastSeen: { type: Date, required: true, default: Date.now },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendcode: { type: Number, required: true },
    friendRequests: { type: [friendRequestSchema], default: [] },
    settings: { type: userSettingsSchema, required: true },
  },
  { collection: "users" }
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);