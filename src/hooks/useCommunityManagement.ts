
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
  member_count?: number;
  post_count?: number;
  is_member?: boolean;
}

export const useCommunityManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get communities with additional statistics
  const { data: communities, isLoading } = useQuery({
    queryKey: ['communities-with-stats'],
    queryFn: async () => {
      const { data: subreddits, error } = await supabase
        .from('subreddits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // TODO: In future, we can add actual member counts and post counts
      // For now, we'll return the basic data
      return subreddits.map(subreddit => ({
        ...subreddit,
        member_count: Math.floor(Math.random() * 1000) + 1, // Mock data for now
        post_count: Math.floor(Math.random() * 50) + 1, // Mock data for now
        is_member: false, // TODO: Implement actual membership logic
      })) as CommunityWithStats[];
    },
  });

  // Join a community (placeholder for future implementation)
  const joinCommunity = useMutation({
    mutationFn: async (communityId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // TODO: Implement actual join logic when membership table is created
      console.log('Joining community:', communityId);
      
      // For now, just show a success message
      toast({
        title: "Funzionalità in arrivo!",
        description: "La possibilità di unirsi alle comunità sarà disponibile presto.",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities-with-stats'] });
    },
  });

  // Leave a community (placeholder for future implementation)
  const leaveCommunity = useMutation({
    mutationFn: async (communityId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // TODO: Implement actual leave logic when membership table is created
      console.log('Leaving community:', communityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities-with-stats'] });
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

  // Get user's communities (if they were a member)
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
