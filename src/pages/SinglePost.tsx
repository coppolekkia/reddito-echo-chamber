
import { useParams } from 'react-router-dom';
import { usePosts } from '@/hooks/usePosts';
import { PostCard } from '@/components/PostCard';
import { BannerDisplay } from '@/components/BannerDisplay';
import { CommentSection } from '@/components/CommentSection';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { MetaTags } from '@/components/MetaTags';
import { useIsMobile } from '@/hooks/use-mobile';

export default function SinglePost() {
  const { id } = useParams();
  const { data: posts, isLoading } = usePosts();
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Caricamento...</p>
        </div>
        {isMobile && <MobileNav />}
      </div>
    );
  }

  const post = posts?.find(post => post.id === id);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <MetaTags title="Post non trovato - Coppolek" />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Post non trovato</p>
        </div>
        {isMobile && <MobileNav />}
      </div>
    );
  }

  // Prepare meta tags data
  const postTitle = `${post.title} - r/${post.subreddits.name}`;
  const postDescription = post.content ? 
    post.content.substring(0, 160) + (post.content.length > 160 ? '...' : '') : 
    `Post di u/${post.profiles.username} in r/${post.subreddits.name}`;
  const postImage = post.image_url || 'https://lovable.dev/opengraph-image-p98pqg.png';
  const postUrl = `${window.location.origin}/post/${post.id}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <MetaTags 
        title={postTitle}
        description={postDescription}
        image={postImage}
        url={postUrl}
        type="article"
      />
      <Header />
      
      {/* Banner popup */}
      <BannerDisplay position="popup" />
      
      <div className={`max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8 ${isMobile ? 'pb-20' : ''}`}>
        <PostCard 
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
        />
        
        {/* Banner interno al post */}
        <div className="my-6">
          <BannerDisplay position="inside-post" />
        </div>
        
        <div className="mt-6">
          <CommentSection postId={post.id} />
        </div>
      </div>
      {isMobile && <MobileNav />}
    </div>
  );
}
