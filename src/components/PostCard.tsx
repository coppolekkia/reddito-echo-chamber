
import { ArrowUp, ArrowDown, MessageSquare, Share, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useVote } from "@/hooks/usePosts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  subreddit: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  timeAgo: string;
  imageUrl?: string;
}

export const PostCard = ({ 
  id,
  title, 
  content, 
  author, 
  subreddit, 
  upvotes: initialUpvotes, 
  downvotes: initialDownvotes,
  comments, 
  timeAgo,
  imageUrl 
}: PostCardProps) => {
  const { user } = useAuth();
  const { vote, isVoting } = useVote();
  const queryClient = useQueryClient();
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [currentUpvotes, setCurrentUpvotes] = useState(initialUpvotes);
  const [currentDownvotes, setCurrentDownvotes] = useState(initialDownvotes);

  useEffect(() => {
    if (user) {
      // Check user's existing vote
      const checkUserVote = async () => {
        const { data } = await supabase
          .from('votes')
          .select('vote_type')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setUserVote(data.vote_type as 'up' | 'down');
        }
      };
      checkUserVote();
    }
  }, [id, user]);

  useEffect(() => {
    setCurrentUpvotes(initialUpvotes);
    setCurrentDownvotes(initialDownvotes);
  }, [initialUpvotes, initialDownvotes]);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user || isVoting) return;

    const oldVote = userVote;
    const oldUpvotes = currentUpvotes;
    const oldDownvotes = currentDownvotes;

    // Optimistic update
    if (oldVote === voteType) {
      // Remove vote
      setUserVote(null);
      if (voteType === 'up') {
        setCurrentUpvotes(oldUpvotes - 1);
      } else {
        setCurrentDownvotes(oldDownvotes - 1);
      }
    } else if (oldVote && oldVote !== voteType) {
      // Change vote
      setUserVote(voteType);
      if (oldVote === 'up') {
        setCurrentUpvotes(oldUpvotes - 1);
        setCurrentDownvotes(oldDownvotes + 1);
      } else {
        setCurrentUpvotes(oldUpvotes + 1);
        setCurrentDownvotes(oldDownvotes - 1);
      }
    } else {
      // New vote
      setUserVote(voteType);
      if (voteType === 'up') {
        setCurrentUpvotes(oldUpvotes + 1);
      } else {
        setCurrentDownvotes(oldDownvotes + 1);
      }
    }

    try {
      await vote(id, voteType, user.id);
      // Refresh posts data
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      // Revert optimistic update on error
      setUserVote(oldVote);
      setCurrentUpvotes(oldUpvotes);
      setCurrentDownvotes(oldDownvotes);
    }
  };

  const totalScore = currentUpvotes - currentDownvotes;

  return (
    <Card className="mb-4 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex">
        {/* Vote Section */}
        <div className="flex flex-col items-center p-2 bg-gray-50 min-w-[50px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote('up')}
            disabled={!user || isVoting}
            className={`p-1 h-8 w-8 ${userVote === 'up' ? 'text-orange-500 bg-orange-50' : 'text-gray-400 hover:text-orange-500'}`}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <span className={`text-sm font-bold py-1 ${userVote === 'up' ? 'text-orange-500' : userVote === 'down' ? 'text-blue-500' : 'text-gray-600'}`}>
            {totalScore}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote('down')}
            disabled={!user || isVoting}
            className={`p-1 h-8 w-8 ${userVote === 'down' ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-blue-500'}`}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <span className="font-semibold text-gray-700">r/{subreddit}</span>
            <span className="mx-2">•</span>
            <span>Postato da u/{author}</span>
            <span className="mx-2">•</span>
            <span>{timeAgo}</span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
            {title}
          </h3>
          
          {content && (
            <p className="text-gray-700 mb-3 line-clamp-3">
              {content}
            </p>
          )}

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
              {comments} Commenti
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-gray-100">
              <Share className="h-4 w-4 mr-1" />
              Condividi
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-gray-100">
              <Bookmark className="h-4 w-4 mr-1" />
              Salva
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
