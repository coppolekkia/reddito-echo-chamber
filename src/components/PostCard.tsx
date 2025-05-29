
import { ArrowUp, ArrowDown, MessageSquare, Share, Bookmark } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  subreddit: string;
  upvotes: number;
  comments: number;
  timeAgo: string;
  imageUrl?: string;
}

export const PostCard = ({ 
  title, 
  content, 
  author, 
  subreddit, 
  upvotes: initialUpvotes, 
  comments, 
  timeAgo,
  imageUrl 
}: PostCardProps) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [voteState, setVoteState] = useState<'up' | 'down' | null>(null);

  const handleUpvote = () => {
    if (voteState === 'up') {
      setUpvotes(upvotes - 1);
      setVoteState(null);
    } else if (voteState === 'down') {
      setUpvotes(upvotes + 2);
      setVoteState('up');
    } else {
      setUpvotes(upvotes + 1);
      setVoteState('up');
    }
  };

  const handleDownvote = () => {
    if (voteState === 'down') {
      setUpvotes(upvotes + 1);
      setVoteState(null);
    } else if (voteState === 'up') {
      setUpvotes(upvotes - 2);
      setVoteState('down');
    } else {
      setUpvotes(upvotes - 1);
      setVoteState('down');
    }
  };

  return (
    <Card className="mb-4 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex">
        {/* Vote Section */}
        <div className="flex flex-col items-center p-2 bg-gray-50 min-w-[50px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpvote}
            className={`p-1 h-8 w-8 ${voteState === 'up' ? 'text-orange-500 bg-orange-50' : 'text-gray-400 hover:text-orange-500'}`}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <span className={`text-sm font-bold py-1 ${voteState === 'up' ? 'text-orange-500' : voteState === 'down' ? 'text-blue-500' : 'text-gray-600'}`}>
            {upvotes}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownvote}
            className={`p-1 h-8 w-8 ${voteState === 'down' ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-blue-500'}`}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <span className="font-semibold text-gray-700">r/{subreddit}</span>
            <span className="mx-2">•</span>
            <span>Posted by u/{author}</span>
            <span className="mx-2">•</span>
            <span>{timeAgo}</span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
            {title}
          </h3>
          
          <p className="text-gray-700 mb-3 line-clamp-3">
            {content}
          </p>

          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="Post content" 
              className="w-full max-h-96 object-cover rounded-lg mb-3"
            />
          )}

          <div className="flex items-center space-x-4 text-gray-500">
            <Button variant="ghost" size="sm" className="hover:bg-gray-100">
              <MessageSquare className="h-4 w-4 mr-1" />
              {comments} Comments
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-gray-100">
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-gray-100">
              <Bookmark className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
