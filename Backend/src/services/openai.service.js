import { groq } from "../config/groq.js";
import { Conversation } from "../models/Conversation.model.js";
import { ApiError } from "../utils/ApiError.js";
import { runAgent } from "../ai/agent.js";

// Get or create active conversation for user
export const getOrCreateConversation = async (userId) => {
  let conversation = await Conversation.findOne({
    user: userId,
    isActive: true,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      user: userId,
      messages: [],
      isActive: true,
    });
  }

  return conversation;
};

// Main function — send message and get AI response
export const sendMessage = async (userId, userMessage) => {
  const conversation = await getOrCreateConversation(userId);

  // Add user message
  conversation.messages.push({
    role: "user",
    content: userMessage,
  });

  // Run agent
  const { finalMessage, toolsUsed, iterations } = await runAgent(
    conversation.messages,
    userId
  );

  // ✅ Save ONLY assistant final message
  // Tool call messages are temporary — dont save in DB!
  conversation.messages.push({
    role: "assistant",
    content: finalMessage,
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();

  return {
    message: finalMessage,
    toolsUsed,
    iterations,
  };
};

// Clear conversation — start fresh
export const clearConversation = async (userId) => {
  await Conversation.findOneAndUpdate(
    { user: userId, isActive: true },
    { isActive: false }
  );
};

// Get chat history — only user and assistant messages
// Tool messages filtered — frontend doesnt need them!
export const getConversationHistory = async (userId) => {
  const conversation = await Conversation.findOne({
    user: userId,
    isActive: true,
  });

  if (!conversation) return [];

  return conversation.messages.filter(
    (msg) => msg.role === "user" || msg.role === "assistant"
  );
};