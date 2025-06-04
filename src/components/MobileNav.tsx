
import { Home, Plus, User, Search, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

export const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  const handleCreateClick = () => {
    if (user) {
      navigate('/create');
    } else {
      navigate('/auth');
    }
  };

  const handleSearchClick = () => {
    // Implementa la funzionalità di ricerca
    console.log('Search clicked - implementare ricerca');
    // Per ora torna alla home e focusa sulla barra di ricerca
    navigate('/');
    setTimeout(() => {
      const searchInput = document.querySelector('input[placeholder="Cerca..."]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  };

  const handleProfileClick = () => {
    if (user) {
      // Navigare al profilo utente o mostrare menu profilo
      console.log('Profile clicked for user:', user.email);
      // Per ora mostra un menu o naviga a una pagina profilo
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin');
    }
  };

  const navItems = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/", 
      onClick: () => navigate("/"),
      isActive: location.pathname === "/"
    },
    { 
      icon: Search, 
      label: "Cerca", 
      path: "/search", 
      onClick: handleSearchClick,
      isActive: location.pathname === "/search"
    },
    { 
      icon: Plus, 
      label: "Crea", 
      path: "/create", 
      onClick: handleCreateClick,
      isActive: location.pathname === "/create"
    },
    { 
      icon: User, 
      label: user ? "Profilo" : "Login", 
      path: user ? "/profile" : "/auth", 
      onClick: handleProfileClick,
      isActive: user ? location.pathname === "/profile" : location.pathname === "/auth"
    },
  ];

  // Aggiungi tasto admin se l'utente è admin
  if (isAdmin) {
    navItems.push({
      icon: Settings,
      label: "Admin",
      path: "/admin",
      onClick: handleAdminClick,
      isActive: location.pathname === "/admin"
    });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-1 md:hidden">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={item.onClick}
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
              item.isActive ? 'text-orange-500' : 'text-gray-600'
            }`}
          >
            <item.icon className={`h-5 w-5 ${item.isActive ? 'text-orange-500' : ''}`} />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
