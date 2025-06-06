
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

// Usa i tipi di Supabase per la compatibilità
type DatabaseBanner = Database['public']['Tables']['banners']['Row'];
type BannerInsert = Database['public']['Tables']['banners']['Insert'];
type BannerUpdate = Database['public']['Tables']['banners']['Update'];

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

// Funzione helper per convertire i dati del database al nostro tipo Banner
const convertDatabaseBanner = (dbBanner: DatabaseBanner): Banner => ({
  ...dbBanner,
  position: dbBanner.position as 'top' | 'sidebar' | 'bottom'
});

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
      setBanners(data ? data.map(convertDatabaseBanner) : []);
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
      setBanners(data ? data.map(convertDatabaseBanner) : []);
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
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Prepara i dati per l'inserimento utilizzando il tipo corretto
      const insertData: BannerInsert = {
        title: bannerData.title || '',
        content: bannerData.content || null,
        image_url: bannerData.image_url || null,
        link_url: bannerData.link_url || null,
        position: bannerData.position || 'top',
        priority: bannerData.priority || 0,
        is_active: bannerData.is_active ?? true,
        created_by: user.user.id
      };

      const { data, error } = await supabase
        .from('banners')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Banner creato con successo",
      });

      await fetchAllBanners();
      return convertDatabaseBanner(data);
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
      // Prepara i dati per l'aggiornamento utilizzando il tipo corretto
      const updateData: BannerUpdate = {
        title: updates.title,
        content: updates.content,
        image_url: updates.image_url,
        link_url: updates.link_url,
        position: updates.position,
        priority: updates.priority,
        is_active: updates.is_active,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('banners')
        .update(updateData)
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
