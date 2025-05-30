import { useParams } from 'react-router-dom';
import { usePosts } from '@/hooks/usePosts';
import { PostCard } from '@/components/PostCard';

export default function SinglePost() {
  const { id } = useParams();
  const { data: posts, isLoading } = usePosts();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const post = posts?.find(post => post.id === id);

  if (!post) {
    return <div className="flex items-center justify-center min-h-screen">Post not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <PostCard {...post} />
    </div>
  );
}