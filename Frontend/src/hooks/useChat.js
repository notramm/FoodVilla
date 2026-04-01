import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addMessage,
  setMessages,
  setTyping,
  clearMessages,
  selectMessages,
  selectIsTyping,
} from "../features/chat/chatSlice.js";
import { chatService } from "../services/chat.service.js";
import toast from "react-hot-toast";

export const useChat = () => {
  const dispatch = useDispatch();
  const messages = useSelector(selectMessages);
  const isTyping = useSelector(selectIsTyping);

  // Load chat history on mount
  const { isLoading: isLoadingHistory } = useQuery({
    queryKey: ["chat", "history"],
    queryFn: chatService.getHistory,
    onSuccess: (data) => {
      // Map backend messages to UI format
      const formattedMessages = data.data.messages.map((msg) => ({
        id: Date.now() + Math.random(),
        role: msg.role,
        content: msg.content,
      }));
      dispatch(setMessages(formattedMessages));
    },
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: chatService.sendMessage,
    onSuccess: (data) => {
      dispatch(setTyping(false));
      dispatch(
        addMessage({
          id: Date.now(),
          role: "assistant",
          content: data.data.message,
        })
      );
    },
    onError: (error) => {
      dispatch(setTyping(false));
      toast.error(error?.message || "Failed to send message");
    },
  });

  // Clear chat mutation
  const clearMutation = useMutation({
    mutationFn: chatService.clearChat,
    onSuccess: () => {
      dispatch(clearMessages());
      toast.success("Chat cleared!");
    },
  });

  const sendMessage = (content) => {
    if (!content.trim()) return;

    // Add user message immediately — optimistic update!
    dispatch(
      addMessage({
        id: Date.now(),
        role: "user",
        content,
      })
    );

    // Show typing indicator
    dispatch(setTyping(true));

    // Send to API
    sendMutation.mutate(content);
  };

  return {
    messages,
    isTyping,
    isLoadingHistory,
    sendMessage,
    clearChat: clearMutation.mutate,
    isSending: sendMutation.isPending,
  };
};