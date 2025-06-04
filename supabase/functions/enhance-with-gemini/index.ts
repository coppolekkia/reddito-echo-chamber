
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

    // Costruisci il prompt per Gemini
    let geminiPrompt = prompt || 'Analizza e approfondisci questo contenuto fornendo contesto aggiuntivo, punti chiave e insights interessanti.';
    
    if (title) {
      geminiPrompt += `\n\nTitolo: ${title}`;
    }
    
    if (content) {
      geminiPrompt += `\n\nContenuto: ${content}`;
    }
    
    if (url) {
      geminiPrompt += `\n\nURL di riferimento: ${url}`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
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
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const enhancedContent = data.candidates[0].content.parts[0].text;
      
      return new Response(JSON.stringify({ 
        success: true, 
        data: enhancedContent 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
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
