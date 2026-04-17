import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { selectUser, setCredentials } from "../features/auth/authSlice.js";
import { authService } from "../services/auth.service.js";

// ✅ Auto refresh user data every 30 seconds
// Handles: admin approval, subscription changes etc
export const useAuthRefresh = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const queryClient = useQueryClient();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const shouldPoll =
      user.role === "owner" || user.ownerStatus === "pending_approval";

    if (!shouldPoll) return;

    const refreshUser = async () => {
      try {
        const result = await authService.getMe();
        const freshUser = result.data;
        const currentToken = localStorage.getItem("accessToken");

        if (
          freshUser.ownerStatus !== user.ownerStatus ||
          freshUser.currentPlan !== user.currentPlan ||
          freshUser.role !== user.role
        ) {
          dispatch(
            setCredentials({
              user: freshUser,
              accessToken: currentToken,
            }),
          );

          queryClient.invalidateQueries({ queryKey: ["subscription"] });
          queryClient.invalidateQueries({ queryKey: ["owner"] });

          console.log("User state refreshed:", freshUser.ownerStatus);
        }
      } catch (err) {
        console.error("Auth refresh failed:", err.message);
      }
    };

    // ✅ ADD THIS HERE
    const handleFocus = async () => {
      await refreshUser();
    };

    window.addEventListener("focus", handleFocus);

    // Poll every 30 seconds
    intervalRef.current = setInterval(refreshUser, 30000);

    // Immediate call
    refreshUser();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // ✅ CLEANUP
      window.removeEventListener("focus", handleFocus);
    };
  }, [user?.ownerStatus, user?.role]);
};
