import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  setCredentials,
  logout as logoutAction,
  selectUser,
  selectIsAuthenticated,
  selectAccessToken,
} from "../features/auth/authSlice.js";
import { authService } from "../services/auth.service.js";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);

  // Register
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success("Account created! Please login.");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error?.message || "Registration failed");
    },
  });

  // Login
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      dispatch(setCredentials({
        user: response.data.user,
        accessToken: response.data.accessToken,
      }));
      toast.success(`Welcome back, ${response.data.user.name}! 🎉`);
      navigate("/");
    },
    onError: (error) => {
      toast.error(error?.message || "Login failed");
    },
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      dispatch(logoutAction());
      queryClient.clear(); // Clear all cached queries!
      toast.success("Logged out successfully");
      navigate("/login");
    },
    onError: () => {
      // Even if API fails — logout locally!
      dispatch(logoutAction());
      queryClient.clear();
      navigate("/login");
    },
  });

  return {
    user,
    isAuthenticated,
    accessToken,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};