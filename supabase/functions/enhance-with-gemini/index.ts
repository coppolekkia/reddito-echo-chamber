
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, content, url, prompt } = await req.json();

    if (!geminiApiKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Gemini API key non configurata' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Costruisci il prompt per Gemini con istruzioni specifiche per formattazione e SEO
    let geminiPrompt = prompt || `Analizza e approfondisci questo contenuto fornendo un'analisi completa e ben strutturata.

ISTRUZIONI DI FORMATTAZIONE E SEO:
- Usa il grassetto (<strong>) per evidenziare i punti chiave
- Organizza in paragrafi chiari (<p>)
- Crea sottosezioni con titoli quando necessario
- Usa elenchi per migliorare la leggibilità
- Includi parole chiave rilevanti per SEO
- Mantieni un tono informativo e coinvolgente
- Struttura per ottimizzare engagement e SEO

FORMATO OUTPUT: HTML ben formattato.`;
    
    if (title) {
      geminiPrompt += `\n\nTitolo: ${title}`;
    }
    
    if (content) {
      geminiPrompt += `\n\nContenuto: ${content}`;
    }
    
    if (url) {
      geminiPrompt += `\n\nURL di riferimento: ${url}`;
    }

    console.log('Using Gemini API with enhanced formatting prompt');

    // Nuovo endpoint corretto per Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: geminiPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048, // Increased for more detailed content
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const enhancedContent = data.candidates[0].content.parts[0].text;
      
      return new Response(JSON.stringify({ 
        success: true, 
        data: enhancedContent 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error('Unexpected Gemini API response structure:', data);
      throw new Error('Risposta non valida da Gemini API');
    }

  } catch (error) {
    console.error('Error in enhance-with-gemini function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Errore durante l\'elaborazione con Gemini AI'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
