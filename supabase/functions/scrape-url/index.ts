
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

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch URL:', response.status, response.statusText)
      return new Response(
        JSON.stringify({ success: false, error: 'Impossibile accedere all\'URL' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const html = await response.text()
    console.log('HTML fetched, length:', html.length)

    // Helper function to extract meta content
    const extractMeta = (html: string, patterns: string[]) => {
      for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'i')
        const match = html.match(regex)
        if (match && match[1]) {
          return match[1].trim()
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
      '<meta[^>]*name=[\'"]twitter:image[\'"][^>]*content=[\'"]([^\'"]*)[\'"]'
    ])

    // If no Open Graph/Twitter image, try to find the first image in content
    if (!image) {
      const imgMatch = html.match(/<img[^>]*src=[\'"]([^\'"]*)[\'"][^>]*>/i)
      if (imgMatch && imgMatch[1]) {
        image = imgMatch[1].trim()
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

    // Extract content - try multiple approaches
    let content = description
    if (!content) {
      // Try to extract first paragraph
      const paragraphMatch = html.match(/<p[^>]*>([^<]+)<\/p>/i)
      if (paragraphMatch && paragraphMatch[1]) {
        content = paragraphMatch[1].trim()
      }
    }

    // If still no content, try to extract from article tag
    if (!content) {
      const articleMatch = html.match(/<article[^>]*>(.*?)<\/article>/is)
      if (articleMatch && articleMatch[1]) {
        // Remove HTML tags and get first 200 characters
        const textContent = articleMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        content = textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '')
      }
    }

    // Extract additional metadata
    const siteName = extractMeta(html, [
      '<meta[^>]*property=[\'"]og:site_name[\'"][^>]*content=[\'"]([^\'"]*)[\'"]'
    ])

    const author = extractMeta(html, [
      '<meta[^>]*name=[\'"]author[\'"][^>]*content=[\'"]([^\'"]*)[\'"]',
      '<meta[^>]*property=[\'"]article:author[\'"][^>]*content=[\'"]([^\'"]*)[\'"]'
    ])

    console.log('Extracted data:', {
      title: title.substring(0, 50) + '...',
      description: description.substring(0, 50) + '...',
      image: image?.substring(0, 50) + '...',
      siteName,
      author
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          title: title,
          description: description,
          content: content,
          image: image,
          url: url,
          siteName: siteName,
          author: author
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
