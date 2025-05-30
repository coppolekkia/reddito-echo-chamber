
interface ScrapedContent {
  title: string;
  description: string;
  content: string;
  image?: string;
  url: string;
}

export class ScrapingService {
  static async scrapeUrl(url: string): Promise<{ success: boolean; data?: ScrapedContent; error?: string }> {
    try {
      // Validate URL
      new URL(url);
      
      // Use a CORS proxy to fetch the content
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (!data.contents) {
        return { success: false, error: 'Impossibile recuperare il contenuto' };
      }
      
      // Parse HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      
      // Extract title
      let title = doc.querySelector('title')?.textContent || '';
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
      if (ogTitle) title = ogTitle;
      
      // Extract description
      let description = '';
      const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content');
      const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
      description = ogDescription || metaDescription || '';
      
      // Extract main content (simplified approach)
      const contentElements = doc.querySelectorAll('p, article, main, .content, .post-content');
      let content = '';
      contentElements.forEach(el => {
        if (el.textContent && el.textContent.length > 100) {
          content += el.textContent + '\n\n';
        }
      });
      
      // Limit content length
      if (content.length > 1000) {
        content = content.substring(0, 1000) + '...';
      }
      
      // Extract image
      let image = '';
      const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
      if (ogImage) image = ogImage;
      
      return {
        success: true,
        data: {
          title: title.trim(),
          description: description.trim(),
          content: content.trim(),
          image: image,
          url: url
        }
      };
    } catch (error) {
      console.error('Error scraping URL:', error);
      return { 
        success: false, 
        error: 'URL non valido o impossibile da raggiungere' 
      };
    }
  }
}
