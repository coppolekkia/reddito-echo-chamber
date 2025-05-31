
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL è richiesto' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: 'Impossibile accedere all\'URL' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const html = await response.text()

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''

    // Extract meta description
    const descriptionMatch = html.match(/<meta[^>]*name=['"]description['"][^>]*content=['"]([^'"]*)['"]/i)
    const description = descriptionMatch ? descriptionMatch[1].trim() : ''

    // Extract Open Graph data
    const ogTitleMatch = html.match(/<meta[^>]*property=['"]og:title['"][^>]*content=['"]([^'"]*)['"]/i)
    const ogDescriptionMatch = html.match(/<meta[^>]*property=['"]og:description['"][^>]*content=['"]([^'"]*)['"]/i)
    const ogImageMatch = html.match(/<meta[^>]*property=['"]og:image['"][^>]*content=['"]([^'"]*)['"]/i)

    // Use Open Graph data if available, otherwise fallback to regular meta tags
    const finalTitle = ogTitleMatch ? ogTitleMatch[1].trim() : title
    const finalDescription = ogDescriptionMatch ? ogDescriptionMatch[1].trim() : description
    const image = ogImageMatch ? ogImageMatch[1].trim() : null

    // Extract first paragraph as content if no description
    let content = finalDescription
    if (!content) {
      const paragraphMatch = html.match(/<p[^>]*>([^<]+)<\/p>/i)
      content = paragraphMatch ? paragraphMatch[1].trim() : ''
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          title: finalTitle,
          description: finalDescription,
          content: content,
          image: image,
          url: url
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Scraping error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Errore durante l\'estrazione del contenuto' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
