
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Home, TrendingUp, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubreddits } from "@/hooks/useSubreddits";

export const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: subreddits, isLoading } = useSubreddits();

  const handleCreatePost = () => {
    if (user) {
      navigate('/create');
    } else {
      navigate('/auth');
    }
  };

  const handleCreateCommunity = () => {
    if (user) {
      navigate('/create-community');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="w-full space-y-3 lg:space-y-4">
      {/* Navigation */}
      <Card className="p-3 lg:p-4">
        <div className="space-y-1 lg:space-y-2">
          <Button variant="ghost" className="w-full justify-start text-sm lg:text-base h-8 lg:h-10" onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm lg:text-base h-8 lg:h-10">
            <TrendingUp className="h-4 w-4 mr-2" />
            Popular
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm lg:text-base h-8 lg:h-10">
            <Star className="h-4 w-4 mr-2" />
            All
          </Button>
        </div>
      </Card>

      {/* Create */}
      <Card className="p-3 lg:p-4">
        <h3 className="font-semibold mb-2 lg:mb-3 text-sm lg:text-base">Crea</h3>
        <div className="space-y-2">
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-sm lg:text-base h-8 lg:h-10" onClick={handleCreatePost}>
            <Plus className="h-4 w-4 mr-2" />
            Crea Post
          </Button>
          <Button variant="outline" className="w-full text-sm lg:text-base h-8 lg:h-10" onClick={handleCreateCommunity}>
            <Users className="h-4 w-4 mr-2" />
            Crea Comunità
          </Button>
        </div>
      </Card>

      {/* Communities */}
      <Card className="p-3 lg:p-4">
        <h3 className="font-semibold mb-2 lg:mb-3 text-sm lg:text-base">Community</h3>
        {isLoading ? (
          <p className="text-xs lg:text-sm text-gray-500">Caricamento...</p>
        ) : (
          <div className="space-y-2">
            {subreddits && subreddits.length > 0 ? (
              subreddits.slice(0, 8).map((community, index) => (
                <div 
                  key={community.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
                    <span className="text-xs lg:text-sm font-medium text-gray-400">{index + 1}</span>
                    <span className="text-base lg:text-lg">🏘️</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-xs lg:text-sm truncate">r/{community.name}</div>
                      {community.description && (
                        <div className="text-xs text-gray-500 truncate">
                          {community.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-6 lg:h-8 px-2 lg:px-3 flex-shrink-0">
                    Unisciti
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-3 lg:py-4">
                <p className="text-xs lg:text-sm text-gray-500 mb-2">Nessuna comunità ancora</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCreateCommunity}
                  className="text-xs h-6 lg:h-8"
                >
                  Crea la prima!
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Reddit Premium Ad */}
      <Card className="p-3 lg:p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <div className="text-center">
          <div className="text-xl lg:text-2xl mb-1 lg:mb-2">🏆</div>
          <h3 className="font-semibold text-orange-800 mb-1 text-sm lg:text-base">Coppolek Premium</h3>
          <p className="text-xs lg:text-sm text-orange-700 mb-2 lg:mb-3">
            La migliore esperienza Coppolek, con funzionalità premium
          </p>
          <Button variant="outline" size="sm" className="border-orange-300 text-orange-800 hover:bg-orange-100 text-xs h-6 lg:h-8">
            Prova Ora
          </Button>
        </div>
      </Card>
    </div>
  );
};
