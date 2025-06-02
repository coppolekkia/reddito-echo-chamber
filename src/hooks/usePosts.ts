
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface Post {
  id: string;
  title: string;
  content: string | null;
  author_id: string;
  subreddit_id: string;
  image_url: string | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
  profiles: {
    username: string;
  };
  subreddits: {
    name: string;
  };
  comments?: any[];
  comment_count?: number;
}

export const usePosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (username),
          subreddits (name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Aggiungi il conteggio dei commenti per ogni post
      const postsWithCommentCount = await Promise.all(
        data.map(async (post) => {
          const { count } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);
          
          return {
            ...post,
            comment_count: count || 0
          };
        })
      );

      return postsWithCommentCount as Post[];
    },
  });
};

export const useVote = () => {
  const [isVoting, setIsVoting] = useState(false);

  const vote = async (postId: string, voteType: 'up' | 'down', userId: string) => {
    setIsVoting(true);
    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if same type
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Update vote if different type
          await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            post_id: postId,
            user_id: userId,
            vote_type: voteType,
          });
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return { vote, isVoting };
};
