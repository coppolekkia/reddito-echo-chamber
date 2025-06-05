
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Banner {
  id: string;
  title: string;
  content?: string;
  image_url?: string;
  link_url?: string;
  is_active: boolean;
  position: 'top' | 'sidebar' | 'bottom';
  priority: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return { banners, loading, refetch: fetchBanners };
};

export const useAdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAllBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei banner",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBanner = async (bannerData: Partial<Banner>) => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .insert({
          ...bannerData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Banner creato con successo",
      });

      await fetchAllBanners();
      return data;
    } catch (error) {
      console.error('Error creating banner:', error);
      toast({
        title: "Errore",
        description: "Errore nella creazione del banner",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Banner aggiornato con successo",
      });

      await fetchAllBanners();
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento del banner",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Banner eliminato con successo",
      });

      await fetchAllBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione del banner",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAllBanners();
  }, []);

  return {
    banners,
    loading,
    createBanner,
    updateBanner,
    deleteBanner,
    refetch: fetchAllBanners
  };
};
