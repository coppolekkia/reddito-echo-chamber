import { useParams } from 'react-router-dom';
import { usePosts } from '@/hooks/usePosts';
import { PostCard } from '@/components/PostCard';

export default function SinglePost() {
  const { id } = useParams();
  const { getPost, isLoading } = usePosts();
  const post = getPost(id);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!post) {
    return <div className="flex items-center justify-center min-h-screen">Post not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <PostCard post={post} />
    </div>
  );
}