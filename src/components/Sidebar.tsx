
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
    <div className="w-80 space-y-4">
      {/* Navigation */}
      <Card className="p-4">
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <TrendingUp className="h-4 w-4 mr-2" />
            Popular
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Star className="h-4 w-4 mr-2" />
            All
          </Button>
        </div>
      </Card>

      {/* Create */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Crea</h3>
        <div className="space-y-2">
          <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handleCreatePost}>
            <Plus className="h-4 w-4 mr-2" />
            Crea Post
          </Button>
          <Button variant="outline" className="w-full" onClick={handleCreateCommunity}>
            <Users className="h-4 w-4 mr-2" />
            Crea Comunità
          </Button>
        </div>
      </Card>

      {/* Communities */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Community</h3>
        {isLoading ? (
          <p className="text-sm text-gray-500">Caricamento...</p>
        ) : (
          <div className="space-y-2">
            {subreddits && subreddits.length > 0 ? (
              subreddits.slice(0, 10).map((community, index) => (
                <div 
                  key={community.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm">{index + 1}</span>
                    <span className="text-lg">🏘️</span>
                    <div>
                      <div className="font-medium text-sm">r/{community.name}</div>
                      {community.description && (
                        <div className="text-xs text-gray-500 truncate max-w-32">
                          {community.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Unisciti
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-2">Nessuna comunità ancora</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCreateCommunity}
                  className="text-xs"
                >
                  Crea la prima!
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Reddit Premium Ad */}
      <Card className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <div className="text-center">
          <div className="text-2xl mb-2">🏆</div>
          <h3 className="font-semibold text-orange-800 mb-1">Coppolek Premium</h3>
          <p className="text-sm text-orange-700 mb-3">
            La migliore esperienza Coppolek, con funzionalità premium
          </p>
          <Button variant="outline" size="sm" className="border-orange-300 text-orange-800 hover:bg-orange-100">
            Prova Ora
          </Button>
        </div>
      </Card>
    </div>
  );
};
