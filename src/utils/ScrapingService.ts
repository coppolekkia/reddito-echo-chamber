
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
        const urlObj = new URL(url);
        // Check if it's a supported protocol
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          return {
            success: false,
            error: 'Solo URL HTTP e HTTPS sono supportati'
          };
        }
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
          error: 'Errore durante la connessione al servizio di estrazione'
        };
      }

      console.log('Scraping result:', data);

      // Handle the response from the edge function
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Errore sconosciuto durante l\'estrazione'
        };
      }

      return data;
    } catch (error) {
      console.error('Scraping service error:', error);
      
      // Provide more helpful error messages
      let errorMessage = 'Errore durante l\'estrazione del contenuto';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Impossibile raggiungere il servizio di estrazione';
      } else if (error instanceof Error) {
        errorMessage = `Errore: ${error.message}`;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Helper method to test if a URL is likely to be scrapeable
  static isUrlScrapeable(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // List of domains that are known to block scraping
      const blockedDomains = [
        'facebook.com',
        'instagram.com',
        'twitter.com',
        'x.com',
        'linkedin.com',
        'pinterest.com',
        'amazon.com',
        'ebay.com'
      ];
      
      const hostname = urlObj.hostname.toLowerCase();
      return !blockedDomains.some(domain => hostname.includes(domain));
    } catch {
      return false;
    }
  }

  // Method to get a user-friendly warning for potentially problematic URLs
  static getScrapingWarning(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      if (hostname.includes('facebook.com') || hostname.includes('instagram.com')) {
        return 'I social media spesso bloccano l\'estrazione automatica del contenuto.';
      }
      
      if (hostname.includes('amazon.com') || hostname.includes('ebay.com')) {
        return 'I siti di e-commerce potrebbero bloccare l\'estrazione del contenuto.';
      }
      
      if (hostname.includes('paywall') || hostname.includes('subscription')) {
        return 'Questo sito potrebbe richiedere un abbonamento per accedere al contenuto.';
      }
      
      return null;
    } catch {
      return null;
    }
  }
}
