import AppRoutes from "./routes/AppRoutes.jsx";
import ChatWindow from "./components/chat/ChatWindow.jsx";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUser } from "./features/auth/authSlice.js";
import { useAuthRefresh } from "./hooks/useAuthRefresh.js"; // ✅ Add!

const App = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  useAuthRefresh();

  return (
    <>
      <AppRoutes />
      {/* Global floating chat — shown on all pages when logged in! */}
      {isAuthenticated && user?.role !== "admin" && <ChatWindow />}
    </>
  );
};

export default App;