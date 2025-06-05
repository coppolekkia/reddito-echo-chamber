
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

    // Rotate between different user agents to avoid detection
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0'
    ]

    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)]

    // Enhanced headers to better mimic a real browser
    const headers = {
      'User-Agent': randomUserAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    }

    // Add random delay to avoid rate limiting
    const delay = Math.random() * 2000 + 1000 // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, delay))

    console.log('Attempting to fetch with User-Agent:', randomUserAgent.substring(0, 50) + '...')

    // Try multiple strategies if the first one fails
    let response
    let lastError

    // Strategy 1: Direct fetch
    try {
      response = await fetch(url, {
        headers,
        redirect: 'follow'
      })
      console.log('Direct fetch response status:', response.status)
    } catch (error) {
      console.log('Direct fetch failed:', error.message)
      lastError = error
    }

    // Strategy 2: Try with minimal headers if direct fetch failed
    if (!response || !response.ok) {
      try {
        console.log('Trying with minimal headers...')
        response = await fetch(url, {
          headers: {
            'User-Agent': randomUserAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          redirect: 'follow'
        })
        console.log('Minimal headers response status:', response.status)
      } catch (error) {
        console.log('Minimal headers fetch failed:', error.message)
        lastError = error
      }
    }

    // Strategy 3: Try with no custom headers as last resort
    if (!response || !response.ok) {
      try {
        console.log('Trying with default headers...')
        response = await fetch(url, {
          redirect: 'follow'
        })
        console.log('Default headers response status:', response.status)
      } catch (error) {
        console.log('Default headers fetch failed:', error.message)
        lastError = error
      }
    }

    if (!response) {
      throw lastError || new Error('Tutte le strategie di fetch sono fallite')
    }

    if (!response.ok) {
      console.error('Failed to fetch URL:', response.status, response.statusText)
      
      // Provide more specific error messages
      let errorMessage = 'Impossibile accedere all\'URL'
      if (response.status === 403) {
        errorMessage = 'Accesso negato dal sito web. Il sito potrebbe avere protezioni anti-bot attive.'
      } else if (response.status === 404) {
        errorMessage = 'Pagina non trovata (404)'
      } else if (response.status === 429) {
        errorMessage = 'Troppe richieste (429). Riprova più tardi.'
      } else if (response.status >= 500) {
        errorMessage = 'Errore del server del sito web'
      } else if (response.status === 401) {
        errorMessage = 'Il sito richiede autenticazione'
      } else if (response.status === 406) {
        errorMessage = 'Contenuto non accettabile - il sito potrebbe bloccare i bot'
      }
      
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const html = await response.text()
    console.log('HTML fetched, length:', html.length)

    if (html.length < 100) {
      console.log('HTML too short, might be blocked or empty page')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'La pagina sembra essere vuota o bloccata'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Helper function to extract meta content with better error handling
    const extractMeta = (html, patterns) => {
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
        for (const imgMatch of imgMatches.slice(0, 3)) {
          const srcMatch = imgMatch.match(/src=[\'"]([^\'"]*)[\'"]/)
          if (srcMatch && srcMatch[1]) {
            const imgSrc = srcMatch[1].trim()
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
      try {
        const paragraphRegex = /<p[^>]*>([^<]+(?:<[^\/][^>]*>[^<]*<\/[^>]*>[^<]*)*)<\/p>/gi
        const paragraphs = html.match(paragraphRegex)
        if (paragraphs && paragraphs.length > 0) {
          for (const p of paragraphs.slice(0, 3)) {
            const textContent = p.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
            if (textContent.length > 50 && !textContent.toLowerCase().includes('cookie')) {
              content = textContent.substring(0, 300) + (textContent.length > 300 ? '...' : '')
              break
            }
          }
        }
      } catch (error) {
        console.error('Error extracting paragraphs:', error)
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
        try {
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
        } catch (error) {
          console.error('Error with content selector:', error)
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

    console.log('Extracted data summary:', {
      title: title ? title.substring(0, 50) + '...' : 'No title',
      description: description ? description.substring(0, 50) + '...' : 'No description',
      content: content ? content.substring(0, 50) + '...' : 'No content',
      image: image ? 'Image found' : 'No image',
      siteName
    })

    // Validate that we got at least some useful data
    if (!title && !description && !content) {
      console.log('No meaningful content extracted')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Impossibile estrarre contenuto significativo dalla pagina. Il sito potrebbe essere protetto o dinamico.'
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
        error: 'Errore durante l\'estrazione del contenuto. Il sito potrebbe non essere accessibile o avere protezioni anti-bot molto forti.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
