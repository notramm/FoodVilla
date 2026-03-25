// This stores chat history per user
// So AI remembers context of the conversation!

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "tool"],
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed, // can be string or array (for tool results)
      required: true,
    },
    toolCallId: {
      type: String, // only for tool messages
    },
    toolName: {
      type: String, // which tool was called
    },
  },
  { _id: false, timestamps: false }
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
