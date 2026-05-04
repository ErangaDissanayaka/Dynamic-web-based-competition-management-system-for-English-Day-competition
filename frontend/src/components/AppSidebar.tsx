import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import {
  Trophy,
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getRoleLabel } from "@/lib/role-utils";

const navItems = {
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/events", label: "Events", icon: Trophy },
    { to: "/admin/schools", label: "Schools", icon: Users },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ],
  school: [
    { to: "/school", label: "Dashboard", icon: LayoutDashboard },
    { to: "/school/register", label: "Register Students", icon: Users },
  ],
  student: [{ to: "/student", label: "Results", icon: Trophy }],
  judge: [{ to: "/judge", label: "Scoring", icon: ClipboardCheck }],
  guest: [],
};

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user || user.role === "guest") return null;

  const items = navItems[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-primary text-primary-foreground"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 navy-gradient text-sidebar-foreground transform transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center">
                <Trophy size={20} className="text-secondary-foreground" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-sidebar-primary">
                  English Day Competiition
                </h2>
                <p className="text-xs text-sidebar-foreground/60">
                  {getRoleLabel(user.role)}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {items.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-primary">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-foreground/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
