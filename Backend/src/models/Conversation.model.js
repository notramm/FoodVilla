// This stores chat history per user
// So AI remembers context of the conversation!

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"], // ✅ tool hata diya — save hi nahi karenge!
      required: true,
    },
    content: {
      type: String, // ✅ String only — no mixed type needed now!
      required: true,
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [messageSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ user: 1, isActive: 1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
