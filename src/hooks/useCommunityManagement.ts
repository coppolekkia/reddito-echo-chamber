import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

export interface CommunityWithStats {
  id: string;
  name: string;
  description: string | null;
  creator_id: string | null;
  created_at: string;
  cover_image_url: string | null;
  logo_url: string | null;
  member_count?: number;
  post_count?: number;
  is_member?: boolean;
}

export const useCommunityManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's community memberships
  const { data: userMemberships } = useQuery({
    queryKey: ['user-memberships', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('community_memberships')
        .select('subreddit_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map(m => m.subreddit_id);
    },
    enabled: !!user,
  });

  // Get communities with additional statistics
  const { data: communities, isLoading } = useQuery({
    queryKey: ['communities-with-stats'],
    queryFn: async () => {
      const { data: subreddits, error } = await supabase
        .from('subreddits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get member counts for each community
      const communitiesWithStats = await Promise.all(
        subreddits.map(async (subreddit) => {
          const { count: memberCount } = await supabase
            .from('community_memberships')
            .select('*', { count: 'exact', head: true })
            .eq('subreddit_id', subreddit.id);

          const { count: postCount } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('subreddit_id', subreddit.id);

          return {
            ...subreddit,
            member_count: memberCount || 0,
            post_count: postCount || 0,
            is_member: userMemberships?.includes(subreddit.id) || false,
          };
        })
      );

      return communitiesWithStats as CommunityWithStats[];
    },
  });

  // Join a community
  const joinCommunity = useMutation({
    mutationFn: async (communityId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('community_memberships')
        .insert({
          user_id: user.id,
          subreddit_id: communityId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities-with-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-memberships'] });
      toast({
        title: "Iscrizione completata!",
        description: "Ti sei iscritto alla comunità con successo.",
      });
    },
    onError: (error) => {
      console.error('Error joining community:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile iscriversi alla comunità.",
        variant: "destructive",
      });
    },
  });

  // Leave a community
  const leaveCommunity = useMutation({
    mutationFn: async (communityId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('community_memberships')
        .delete()
        .eq('user_id', user.id)
        .eq('subreddit_id', communityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities-with-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-memberships'] });
      toast({
        title: "Iscrizione cancellata",
        description: "Hai lasciato la comunità con successo.",
      });
    },
    onError: (error) => {
      console.error('Error leaving community:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile lasciare la comunità.",
        variant: "destructive",
      });
    },
  });

  // Search communities
  const searchCommunities = async (query: string) => {
    if (!query.trim()) return communities || [];
    
    return communities?.filter(community =>
      community.name.toLowerCase().includes(query.toLowerCase()) ||
      community.description?.toLowerCase().includes(query.toLowerCase())
    ) || [];
  };

  // Get popular communities (sorted by member count)
  const getPopularCommunities = () => {
    return communities?.sort((a, b) => (b.member_count || 0) - (a.member_count || 0)) || [];
  };

  // Get user's communities (if they are a member)
  const getUserCommunities = () => {
    return communities?.filter(community => community.is_member) || [];
  };

  return {
    communities,
    isLoading,
    joinCommunity,
    leaveCommunity,
    searchCommunities,
    getPopularCommunities,
    getUserCommunities,
    isJoining: joinCommunity.isPending,
    isLeaving: leaveCommunity.isPending,
  };
};
