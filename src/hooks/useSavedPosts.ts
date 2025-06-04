
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useSavedPosts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedPosts, isLoading } = useQuery({
    queryKey: ['saved-posts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('saved_posts')
        .select('post_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map(item => item.post_id);
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('saved_posts')
        .insert({
          user_id: user.id,
          post_id: postId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-posts', user?.id] });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-posts', user?.id] });
    },
  });

  const toggleSave = (postId: string) => {
    if (!user) return;

    const isSaved = savedPosts?.includes(postId);
    if (isSaved) {
      unsaveMutation.mutate(postId);
    } else {
      saveMutation.mutate(postId);
    }
  };

  const isPostSaved = (postId: string) => {
    return savedPosts?.includes(postId) || false;
  };

  return {
    savedPosts: savedPosts || [],
    isLoading,
    toggleSave,
    isPostSaved,
    isSaving: saveMutation.isPending || unsaveMutation.isPending,
  };
};
