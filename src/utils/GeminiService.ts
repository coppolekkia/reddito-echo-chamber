
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
          prompt: `Analizza e approfondisci questo contenuto fornendo un'analisi completa e ben strutturata. 

ISTRUZIONI DI FORMATTAZIONE E SEO:
- Usa il grassetto (<strong>) per evidenziare i punti chiave e le informazioni importanti
- Organizza il contenuto in paragrafi chiari e ben separati (<p>)
- Crea sottosezioni con titoli appropriati quando necessario
- Usa elenchi puntati (<ul><li>) o numerati (<ol><li>) per rendere l'informazione più digeribile
- Includi parole chiave rilevanti in modo naturale per il SEO
- Mantieni un tono informativo e coinvolgente
- Aggiungi contesto aggiuntivo, statistiche o fatti interessanti quando possibile
- Struttura il contenuto per migliorare la leggibilità e l'engagement
- Usa transizioni fluide tra i paragrafi
- Concludi con insights o considerazioni finali

FORMATO OUTPUT: Restituisci il contenuto formattato in HTML con i tag appropriati per una visualizzazione ottimale.`
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
