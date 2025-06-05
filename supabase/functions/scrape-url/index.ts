
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    console.log('Scraping URL:', url)

    // More comprehensive headers to avoid bot detection
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    }

    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Fetch the webpage
    const response = await fetch(url, {
      headers,
      redirect: 'follow'
    })

    console.log('Response status:', response.status, response.statusText)

    if (!response.ok) {
      console.error('Failed to fetch URL:', response.status, response.statusText)
      
      // Provide more specific error messages
      let errorMessage = 'Impossibile accedere all\'URL'
      if (response.status === 403) {
        errorMessage = 'Accesso negato dal sito web (403). Il sito potrebbe bloccare i bot.'
      } else if (response.status === 404) {
        errorMessage = 'Pagina non trovata (404)'
      } else if (response.status === 429) {
        errorMessage = 'Troppe richieste (429). Riprova più tardi.'
      } else if (response.status >= 500) {
        errorMessage = 'Errore del server del sito web'
      }
      
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const html = await response.text()
    console.log('HTML fetched, length:', html.length)

    // Helper function to extract meta content with better error handling
    const extractMeta = (html: string, patterns: string[]) => {
      for (const pattern of patterns) {
        try {
          const regex = new RegExp(pattern, 'i')
          const match = html.match(regex)
          if (match && match[1]) {
            // Decode HTML entities
            return match[1]
              .replace(/&quot;/g, '"')
              .replace(/&apos;/g, "'")
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .trim()
          }
        } catch (error) {
          console.error('Error matching pattern:', pattern, error)
        }
      }
      return null
    }

    // Extract title - prioritize Open Graph, then Twitter, then regular title
    const title = extractMeta(html, [
      '<meta[^>]*property=[\'"]og:title[\'"][^>]*content=[\'"]([^\'"]*)[\'"]',
      '<meta[^>]*name=[\'"]twitter:title[\'"][^>]*content=[\'"]([^\'"]*)[\'"]',
      '<title[^>]*>([^<]+)</title>'
    ]) || ''

    // Extract description - prioritize Open Graph, then Twitter, then meta description
    const description = extractMeta(html, [
      '<meta[^>]*property=[\'"]og:description[\'"][^>]*content=[\'"]([^\'"]*)[\'"]',
      '<meta[^>]*name=[\'"]twitter:description[\'"][^>]*content=[\'"]([^\'"]*)[\'"]',
      '<meta[^>]*name=[\'"]description[\'"][^>]*content=[\'"]([^\'"]*)[\'"]'
    ]) || ''

    // Extract image - prioritize Open Graph, then Twitter
    let image = extractMeta(html, [
      '<meta[^>]*property=[\'"]og:image[\'"][^>]*content=[\'"]([^\'"]*)[\'"]',
      '<meta[^>]*name=[\'"]twitter:image[\'"][^>]*content=[\'"]([^\'"]*)[\'"]',
      '<meta[^>]*property=[\'"]twitter:image[\'"][^>]*content=[\'"]([^\'"]*)[\'"]'
    ])

    // If no Open Graph/Twitter image, try to find the first meaningful image in content
    if (!image) {
      const imgMatches = html.match(/<img[^>]*src=[\'"]([^\'"]*)[\'"][^>]*>/gi)
      if (imgMatches) {
        for (const imgMatch of imgMatches.slice(0, 3)) { // Check first 3 images
          const srcMatch = imgMatch.match(/src=[\'"]([^\'"]*)[\'"]/)
          if (srcMatch && srcMatch[1]) {
            const imgSrc = srcMatch[1].trim()
            // Skip very small images or common UI elements
            if (!imgSrc.includes('logo') && 
                !imgSrc.includes('icon') && 
                !imgSrc.includes('button') &&
                !imgSrc.includes('1x1') &&
                imgSrc.length > 10) {
              image = imgSrc
              break
            }
          }
        }
      }
    }

    // Make image URL absolute if it's relative
    if (image && !image.startsWith('http')) {
      try {
        const baseUrl = new URL(url)
        if (image.startsWith('//')) {
          image = `${baseUrl.protocol}${image}`
        } else if (image.startsWith('/')) {
          image = `${baseUrl.protocol}//${baseUrl.host}${image}`
        } else {
          image = `${baseUrl.protocol}//${baseUrl.host}/${image}`
        }
      } catch (error) {
        console.error('Error making image URL absolute:', error)
        image = null
      }
    }

    // Extract content - try multiple approaches with better text extraction
    let content = description
    if (!content) {
      // Try to extract first meaningful paragraph
      const paragraphs = html.match(/<p[^>]*>([^<]+(?:<[^/][^>]*>[^<]*</[^>]*>[^<]*)*)<\/p>/gi)
      if (paragraphs && paragraphs.length > 0) {
        for (const p of paragraphs.slice(0, 3)) {
          const textContent = p.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
          if (textContent.length > 50 && !textContent.toLowerCase().includes('cookie')) {
            content = textContent.substring(0, 300) + (textContent.length > 300 ? '...' : '')
            break
          }
        }
      }
    }

    // If still no content, try to extract from article or main content areas
    if (!content) {
      const contentSelectors = [
        /<article[^>]*>(.*?)<\/article>/is,
        /<main[^>]*>(.*?)<\/main>/is,
        /<div[^>]*class=[\'"][^\'"]*(content|article|post|entry)[^\'"]*(.*?)<\/div>/is
      ]
      
      for (const selector of contentSelectors) {
        const match = html.match(selector)
        if (match && match[1]) {
          const textContent = match[1]
            .replace(/<script[^>]*>.*?<\/script>/gis, '')
            .replace(/<style[^>]*>.*?<\/style>/gis, '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
          
          if (textContent.length > 100) {
            content = textContent.substring(0, 400) + (textContent.length > 400 ? '...' : '')
            break
          }
        }
      }
    }

    // Extract additional metadata
    const siteName = extractMeta(html, [
      '<meta[^>]*property=[\'"]og:site_name[\'"][^>]*content=[\'"]([^\'"]*)[\'"]'
    ]) || new URL(url).hostname

    const author = extractMeta(html, [
      '<meta[^>]*name=[\'"]author[\'"][^>]*content=[\'"]([^\'"]*)[\'"]',
      '<meta[^>]*property=[\'"]article:author[\'"][^>]*content=[\'"]([^\'"]*)[\'"]'
    ])

    console.log('Extracted data:', {
      title: title.substring(0, 50) + '...',
      description: description.substring(0, 50) + '...',
      content: content?.substring(0, 50) + '...',
      image: image?.substring(0, 50) + '...',
      siteName,
      author
    })

    // Validate that we got at least some useful data
    if (!title && !description && !content) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Impossibile estrarre contenuto significativo dalla pagina'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          title: title || 'Titolo non disponibile',
          description: description || '',
          content: content || '',
          image: image || null,
          url: url,
          siteName: siteName,
          author: author || null
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Scraping error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Errore durante l\'estrazione del contenuto. Il sito potrebbe non essere accessibile.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
