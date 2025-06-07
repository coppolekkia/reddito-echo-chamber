
import { PostCardWithBanner } from "./PostCardWithBanner";
import { CreatePost } from "./CreatePost";
import { BannerDisplay } from "./BannerDisplay";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { usePostSorting, SortType } from "@/hooks/usePostSorting";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

export const PostFeed = () => {
  const { data: posts, isLoading, error } = usePosts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { sortType, setSortType, sortedPosts } = usePostSorting(posts);

  const getSortIcon = (type: SortType) => {
    switch (type) {
      case 'hot': return '🔥';
      case 'new': return '🆕';
      case 'top': return '⭐';
      case 'rising': return '🌅';
      default: return '';
    }
  };

  const getSortLabel = (type: SortType) => {
    switch (type) {
      case 'hot': return 'Hot';
      case 'new': return 'New';
      case 'top': return 'Top';
      case 'rising': return 'Rising';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-full">
        <div className="text-center py-8 lg:py-12">
          <p className="text-gray-600 text-sm lg:text-base">Caricamento post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-full">
        <div className="text-center py-8 lg:py-12">
          <p className="text-red-600 text-sm lg:text-base">Errore nel caricamento dei post</p>
        </div>
      </div>
    );
  }

  const sortTypes: SortType[] = ['hot', 'new', 'top', 'rising'];

  return (
    <div className="w-full max-w-full">
      {/* Banner popup */}
      <BannerDisplay position="popup" />
      
      {user ? (
        <div className={`${isMobile ? 'mb-3' : 'mb-4 lg:mb-6'}`}>
          <CreatePost />
        </div>
      ) : (
        <div className={`${isMobile ? 'mb-3 p-3' : 'mb-4 lg:mb-6 p-3 lg:p-4'} bg-white border border-gray-200 rounded-lg`}>
          <p className="text-gray-600 text-center mb-3 text-sm lg:text-base">
            Accedi per creare un nuovo post
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-sm lg:text-base h-9 lg:h-10"
          >
            Accedi
          </Button>
        </div>
      )}
      
      {/* Filtri post - ottimizzati per mobile */}
      <div className={`${isMobile ? 'mb-3' : 'mb-4 lg:mb-6'}`}>
        <div className={`flex items-center ${isMobile ? 'space-x-1 px-1' : 'space-x-2 lg:space-x-4'} mb-3 overflow-x-auto pb-2 scrollbar-hide`}>
          {sortTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSortType(type)}
              className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm'} rounded-full font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                sortType === type
                  ? 'bg-orange-500 text-white border border-orange-500'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className={`${isMobile ? 'mr-1' : 'mr-1.5'}`}>{getSortIcon(type)}</span>
              {getSortLabel(type)}
            </button>
          ))}
        </div>
        
        {/* Badge per mostrare il filtro attivo */}
        <div className={`flex items-center justify-between ${isMobile ? 'px-1' : ''}`}>
          <Badge variant="secondary" className="text-xs">
            Ordinamento: {getSortLabel(sortType)}
          </Badge>
          <span className="text-xs text-gray-500">
            {sortedPosts.length} post{sortedPosts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {/* Posts */}
      <div className="space-y-0">
        {sortedPosts && sortedPosts.length > 0 ? (
          sortedPosts.map((post) => (
            <PostCardWithBanner 
              key={post.id} 
              id={post.id}
              title={post.title}
              content={post.content || ''}
              author={post.profiles.username}
              subreddit={post.subreddits.name}
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              comments={0}
              timeAgo={new Date(post.created_at).toLocaleString('it-IT')}
              image_url={post.image_url || undefined}
              comment_count={post.comment_count}
            />
          ))
        ) : (
          <div className="text-center py-8 lg:py-12">
            <p className="text-gray-600 text-sm lg:text-base">Nessun post disponibile.</p>
            {!user && (
              <Button 
                onClick={() => navigate('/auth')}
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-sm lg:text-base h-9 lg:h-10"
              >
                Accedi per creare il primo post
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
