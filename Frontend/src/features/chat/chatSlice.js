import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],       // Local messages shown in UI
  isTyping: false,    // AI typing indicator
  isOpen: false,      // Chat window open/close
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },

    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },

    openChat: (state) => {
      state.isOpen = true;
    },

    closeChat: (state) => {
      state.isOpen = false;
    },

    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const {
  addMessage,
  setMessages,
  setTyping,
  toggleChat,
  openChat,
  closeChat,
  clearMessages,
} = chatSlice.actions;

// Selectors
export const selectMessages = (state) => state.chat.messages;
export const selectIsTyping = (state) => state.chat.isTyping;
export const selectIsChatOpen = (state) => state.chat.isOpen;

export default chatSlice.reducer;