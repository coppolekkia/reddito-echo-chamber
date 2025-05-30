
import { PostCard } from "./PostCard";
import { CreatePost } from "./CreatePost";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const PostFeed = () => {
  const { data: posts, isLoading, error } = usePosts();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex-1 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-gray-600">Caricamento post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-red-600">Errore nel caricamento dei post</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-2xl">
      {user ? (
        <CreatePost />
      ) : (
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-600 text-center mb-3">
            Accedi per creare un nuovo post
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            Accedi
          </Button>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <button className="px-4 py-2 bg-white border rounded-full text-sm font-medium hover:bg-gray-50 border-gray-300">
            🔥 Hot
          </button>
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full text-sm font-medium">
            🆕 New
          </button>
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full text-sm font-medium">
            ⭐ Top
          </button>
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full text-sm font-medium">
            🌅 Rising
          </button>
        </div>
      </div>
      
      <div className="space-y-0">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              id={post.id}
              title={post.title}
              content={post.content || ''}
              author={post.profiles.username}
              subreddit={post.subreddits.name}
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              comments={0} // TODO: Add comment count
              timeAgo={new Date(post.created_at).toLocaleString('it-IT')}
              imageUrl={post.image_url || undefined}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Nessun post disponibile.</p>
            {!user && (
              <Button 
                onClick={() => navigate('/auth')}
                className="mt-4 bg-orange-500 hover:bg-orange-600"
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
