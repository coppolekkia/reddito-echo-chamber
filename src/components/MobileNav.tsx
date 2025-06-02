
import { Home, Plus, User, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Cerca", path: "/search" },
    { icon: Plus, label: "Crea", path: "/create" },
    { icon: User, label: user ? "Profilo" : "Login", path: user ? "/profile" : "/auth" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-1 md:hidden">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : ''}`} />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
