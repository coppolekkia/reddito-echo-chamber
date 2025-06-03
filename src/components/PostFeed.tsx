
import { PostCard } from "./PostCard";
import { CreatePost } from "./CreatePost";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { usePostSorting, SortType } from "@/hooks/usePostSorting";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export const PostFeed = () => {
  const { data: posts, isLoading, error } = usePosts();
  const { user } = useAuth();
  const navigate = useNavigate();
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
      {user ? (
        <div className="mb-4 lg:mb-6">
          <CreatePost />
        </div>
      ) : (
        <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-white border border-gray-200 rounded-lg">
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
      
      {/* Filtri post - funzionali e responsive */}
      <div className="mb-4 lg:mb-6">
        <div className="flex items-center space-x-2 lg:space-x-4 mb-4 overflow-x-auto pb-2">
          {sortTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSortType(type)}
              className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium whitespace-nowrap transition-colors ${
                sortType === type
                  ? 'bg-orange-500 text-white border border-orange-500'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {getSortIcon(type)} {getSortLabel(type)}
            </button>
          ))}
        </div>
        
        {/* Badge per mostrare il filtro attivo */}
        <div className="flex items-center justify-between">
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
            <PostCard 
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
