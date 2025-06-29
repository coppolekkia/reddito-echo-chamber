
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

  // Prepare optimized meta tags data for social sharing
  const postTitle = `${post.title} - r/${post.subreddits.name}`;
  const postDescription = post.content ? 
    post.content.substring(0, 160).replace(/<[^>]*>/g, '') + (post.content.length > 160 ? '...' : '') : 
    `Post condiviso da u/${post.profiles.username} nella comunità r/${post.subreddits.name}`;
  const postImage = post.image_url || 'https://lovable.dev/opengraph-image-p98pqg.png';
  const postUrl = `${window.location.protocol}//${window.location.host}/post/${post.id}`;
  const imageAlt = post.image_url ? `Immagine del post: ${post.title}` : 'Coppolek - Social sharing image';

  return (
    <div className="min-h-screen bg-gray-50">
      <MetaTags 
        title={postTitle}
        description={postDescription}
        image={postImage}
        imageAlt={imageAlt}
        url={postUrl}
        type="article"
        siteName="Coppolek"
        author={post.profiles.username}
      />
      <Header />
      
      {/* Banner popup */}
      <BannerDisplay position="popup" />
      
      <div className={`max-w-4xl mx-auto ${isMobile ? 'px-3 py-3 pb-20' : 'px-2 sm:px-4 py-4 sm:py-8'}`}>
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
        <div className={`${isMobile ? 'my-4' : 'my-6'}`}>
          <BannerDisplay position="inside-post" />
        </div>
        
        <div className={`${isMobile ? 'mt-4' : 'mt-6'}`}>
          <CommentSection postId={post.id} />
        </div>
      </div>
      {isMobile && <MobileNav />}
    </div>
  );
}
