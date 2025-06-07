
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { PostFeed } from '@/components/PostFeed';
import { BannerDisplay } from '@/components/BannerDisplay';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSubreddits } from '@/hooks/useSubreddits';
import { useCommunityManagement } from '@/hooks/useCommunityManagement';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar } from 'lucide-react';

export default function CommunityPage() {
  const { subreddit } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { data: subreddits, isLoading } = useSubreddits();
  const { communities, joinCommunity, leaveCommunity, isJoining, isLeaving } = useCommunityManagement();
  
  const community = subreddits?.find(s => s.name === subreddit);
  const communityWithStats = communities?.find(c => c.name === subreddit);

  const handleJoinLeave = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!community) return;

    if (communityWithStats?.is_member) {
      leaveCommunity.mutate(community.id);
    } else {
      joinCommunity.mutate(community.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Caricamento comunità...</p>
        </div>
        {isMobile && <MobileNav />}
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Comunità non trovata</h1>
            <p className="text-gray-600">La comunità r/{subreddit} non esiste.</p>
          </div>
        </div>
        {isMobile && <MobileNav />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Banner popup */}
      <BannerDisplay position="popup" />
      
      {/* Community Header - Ottimizzato per mobile */}
      <div className="bg-white border-b border-gray-200">
        <div className={`max-w-7xl mx-auto ${isMobile ? 'px-3 py-4' : 'px-2 sm:px-4 lg:px-8 py-4 sm:py-6'}`}>
          <div className={`${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
            <div className={`${isMobile ? 'space-y-2' : ''}`}>
              <h1 className={`${isMobile ? 'text-xl' : 'text-2xl lg:text-3xl'} font-bold text-gray-900`}>
                r/{community.name}
              </h1>
              {community.description && (
                <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'mt-2'}`}>
                  {community.description}
                </p>
              )}
              <div className={`flex items-center ${isMobile ? 'space-x-2 flex-wrap' : 'space-x-4 mt-3'}`}>
                <Badge variant="secondary" className={`flex items-center space-x-1 ${isMobile ? 'text-xs' : ''}`}>
                  <Users className="h-3 w-3" />
                  <span>Membri: {communityWithStats?.member_count || 0}</span>
                </Badge>
                <Badge variant="outline" className={`flex items-center space-x-1 ${isMobile ? 'text-xs' : ''}`}>
                  <Calendar className="h-3 w-3" />
                  <span>
                    {isMobile ? 
                      new Date(community.created_at).toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }) :
                      `Creata: ${new Date(community.created_at).toLocaleDateString('it-IT')}`
                    }
                  </span>
                </Badge>
              </div>
            </div>
            <Button 
              onClick={handleJoinLeave}
              disabled={isJoining || isLeaving}
              variant={communityWithStats?.is_member ? "outline" : "default"}
              className={`${isMobile ? 'w-full' : ''}`}
            >
              {isJoining || isLeaving ? 'Caricamento...' : 
               communityWithStats?.is_member ? 'Lascia' : 'Unisciti'}
            </Button>
          </div>
        </div>
      </div>
      
      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-3 py-3' : 'px-2 sm:px-4 lg:px-8 py-4 sm:py-6'}`}>
        <div className={`${isMobile ? 'pb-20' : ''}`}>
          {/* TODO: Filtrare i post per questa comunità */}
          <PostFeed />
        </div>
      </div>
      
      {isMobile && <MobileNav />}
    </div>
  );
}
