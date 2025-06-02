
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  parent_id: string | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
  profiles: {
    username: string;
  };
}

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (username)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return data as Comment[];
    },
  });
};

export const useSubreddits = () => {
  return useQuery({
    queryKey: ['subreddits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subreddits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },
  });
};
