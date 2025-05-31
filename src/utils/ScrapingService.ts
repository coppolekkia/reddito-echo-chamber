
import { supabase } from '@/integrations/supabase/client';

interface ScrapingResult {
  title?: string;
  description?: string;
  content?: string;
  image?: string;
  url?: string;
  siteName?: string;
  author?: string;
}

interface ScrapingResponse {
  success: boolean;
  data?: ScrapingResult;
  error?: string;
}

export class ScrapingService {
  static async scrapeUrl(url: string): Promise<ScrapingResponse> {
    try {
      // Validate URL
      try {
        new URL(url);
      } catch {
        return {
          success: false,
          error: 'URL non valido'
        };
      }

      console.log('Calling scrape function for URL:', url);

      const { data, error } = await supabase.functions.invoke('scrape-url', {
        body: { url }
      });

      if (error) {
        console.error('Error calling scrape function:', error);
        return {
          success: false,
          error: 'Errore durante l\'estrazione del contenuto'
        };
      }

      console.log('Scraping result:', data);
      return data;
    } catch (error) {
      console.error('Scraping service error:', error);
      return {
        success: false,
        error: 'Errore durante l\'estrazione del contenuto'
      };
    }
  }
}
