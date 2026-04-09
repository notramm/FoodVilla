import { NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  CalendarDays,
  IndianRupee,
  Menu,
  X,
  ChevronRight,
  LogOut,
  ShieldCheck, Crown,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import Avatar from "../../components/ui/Avatar.jsx";
import { cn } from "../../utils/cn.js";


const NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, end: true },
  { label: "Owners", href: "/admin/owners", icon: Users },
  { label: "Restaurants", href: "/admin/restaurants", icon: UtensilsCrossed },
  { label: "Reservations", href: "/admin/reservations", icon: CalendarDays },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: Crown }, // ✅ New!
  { label: "Revenue", href: "/admin/commission", icon: IndianRupee },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={cn(
        "flex flex-col bg-gray-900 text-white",
        mobile
          ? "fixed inset-y-0 left-0 z-50 w-72 shadow-2xl"
          : "hidden lg:flex w-64 min-h-screen sticky top-0"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">GoodFoods</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
        {mobile && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            onClick={() => mobile && setIsSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-500 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <Avatar name={user?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          <Sidebar mobile />
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <Avatar name={user?.name} size="sm" />
        </header>

        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;