
import { Search, User, Bell, MessageSquare, Plus, LogOut, Shield, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold text-gray-900">reddit</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Cerca su Reddit" 
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {user && (
              <>
                <Button variant="ghost" size="sm">
                  <Plus className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5" />
                </Button>
                {isAdmin && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Amministratore"
                      onClick={() => navigate('/admin')}
                    >
                      <Shield className="h-5 w-5 text-red-500" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Pannello Admin"
                      onClick={() => navigate('/admin')}
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleAuthAction}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
            <Button 
              className={user ? "bg-red-500 hover:bg-red-600 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}
              onClick={handleAuthAction}
            >
              {user ? 'Logout' : 'Accedi'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
