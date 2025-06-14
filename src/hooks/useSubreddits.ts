
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Subreddit {
  id: string;
  name: string;
  description: string | null;
  creator_id: string | null;
  created_at: string;
  cover_image_url: string | null;
  logo_url: string | null;
}

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

      return data as Subreddit[];
    },
  });
};
