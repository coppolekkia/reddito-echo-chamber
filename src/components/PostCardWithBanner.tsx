
import { PostCard } from './PostCard';
import { BannerDisplay } from './BannerDisplay';

interface PostCardWithBannerProps {
  id: string;
  title: string;
  content: string;
  author: string;
  subreddit: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  timeAgo: string;
  image_url?: string;
  comment_count?: number;
}

export const PostCardWithBanner = (props: PostCardWithBannerProps) => {
  return (
    <div className="space-y-4">
      <PostCard {...props} />
      {/* Banner interno al post */}
      <BannerDisplay position="inside-post" />
    </div>
  );
};
