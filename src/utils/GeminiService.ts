
import { supabase } from '@/integrations/supabase/client';

interface GeminiResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export class GeminiService {
  static async enhancePostContent(title: string, content: string, url?: string): Promise<GeminiResponse> {
    try {
      console.log('Calling Gemini AI for content enhancement');

      const { data, error } = await supabase.functions.invoke('enhance-with-gemini', {
        body: { 
          title,
          content,
          url: url || '',
          prompt: 'Analizza e approfondisci questo contenuto fornendo contesto aggiuntivo, punti chiave e insights interessanti. Mantieni un tono informativo e coinvolgente.'
        }
      });

      if (error) {
        console.error('Error calling Gemini function:', error);
        return {
          success: false,
          error: 'Errore durante l\'analisi con AI'
        };
      }

      console.log('Gemini enhancement result:', data);
      return data;
    } catch (error) {
      console.error('Gemini service error:', error);
      return {
        success: false,
        error: 'Errore durante l\'analisi con AI'
      };
    }
  }
}
