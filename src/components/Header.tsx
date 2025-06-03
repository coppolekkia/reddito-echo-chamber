
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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">C</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 hidden xs:block">coppolek</span>
            </div>
          </div>

          {/* Search Bar - responsivo */}
          <div className="flex-1 max-w-xs sm:max-w-md lg:max-w-2xl mx-2 sm:mx-4 lg:mx-8">
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <Input 
                placeholder="Cerca..." 
                className="pl-8 sm:pl-10 bg-gray-50 border-gray-200 focus:bg-white text-sm h-8 sm:h-10"
              />
            </div>
          </div>

          {/* Actions - responsive */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {user && (
              <>
                {/* Mobile: solo icone essenziali */}
                <div className="hidden sm:flex items-center space-x-1 lg:space-x-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 lg:h-10 lg:w-10">
                    <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 lg:h-10 lg:w-10">
                    <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 lg:h-10 lg:w-10">
                    <MessageSquare className="h-4 w-4 lg:h-5 lg:w-5" />
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm" className="h-8 w-8 lg:h-10 lg:w-10">
                  <User className="h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
                
                {isAdmin && (
                  <div className="hidden lg:flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Amministratore"
                      onClick={() => navigate('/admin')}
                      className="h-8 w-8 lg:h-10 lg:w-10"
                    >
                      <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-red-500" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Pannello Admin"
                      onClick={() => navigate('/admin')}
                      className="h-8 w-8 lg:h-10 lg:w-10"
                    >
                      <Settings className="h-4 w-4 lg:h-5 lg:w-5" />
                    </Button>
                  </div>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleAuthAction}
                  className="hidden sm:flex h-8 w-8 lg:h-10 lg:w-10"
                >
                  <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
              </>
            )}
            
            <Button 
              className={`${user ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"} text-white text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4`}
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
