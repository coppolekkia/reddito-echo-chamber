
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { PostFeed } from '@/components/PostFeed';
import { BannerDisplay } from '@/components/BannerDisplay';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSubreddits } from '@/hooks/useSubreddits';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar } from 'lucide-react';

export default function CommunityPage() {
  const { subreddit } = useParams();
  const isMobile = useIsMobile();
  const { data: subreddits, isLoading } = useSubreddits();
  
  const community = subreddits?.find(s => s.name === subreddit);

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
      
      {/* Community Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">r/{community.name}</h1>
              {community.description && (
                <p className="text-gray-600 mt-2">{community.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-3">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>Membri: N/A</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Creata: {new Date(community.created_at).toLocaleDateString('it-IT')}</span>
                </Badge>
              </div>
            </div>
            <Button variant="outline">
              Unisciti
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className={`${isMobile ? 'pb-20' : ''}`}>
          {/* TODO: Filtrare i post per questa comunità */}
          <PostFeed />
        </div>
      </div>
      
      {isMobile && <MobileNav />}
    </div>
  );
}
