
import { useEffect } from 'react';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  imageAlt?: string;
  siteName?: string;
  author?: string;
}

export const MetaTags = ({ 
  title = "Coppolek - The Front Page of the Internet",
  description = "A modern Reddit clone built with React",
  image = "https://lovable.dev/opengraph-image-p98pqg.png",
  url = window.location.href,
  type = "website",
  imageAlt = "Coppolek - Social sharing image",
  siteName = "Coppolek",
  author
}: MetaTagsProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update meta tag
    const updateMetaTag = (property: string, content: string, isProperty = true) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Clear any existing meta tags first to avoid conflicts
    const metaTagsToUpdate = [
      'description',
      'og:title', 'og:description', 'og:image', 'og:image:alt', 'og:url', 'og:type', 'og:site_name', 'og:locale', 'og:image:width', 'og:image:height',
      'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt', 'twitter:site', 'twitter:creator',
      'article:author', 'robots', 'viewport'
    ];

    // Update basic meta tags
    updateMetaTag('description', description, false);

    // Update OpenGraph tags for better social sharing
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:image:alt', imageAlt);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', siteName);
    updateMetaTag('og:locale', 'it_IT');
    
    // Add image dimensions for better rendering
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');

    // Update Twitter Card tags for better Twitter sharing
    updateMetaTag('twitter:card', 'summary_large_image', false);
    updateMetaTag('twitter:title', title, false);
    updateMetaTag('twitter:description', description, false);
    updateMetaTag('twitter:image', image, false);
    updateMetaTag('twitter:image:alt', imageAlt, false);
    updateMetaTag('twitter:site', '@coppolek', false);
    
    // Add author if provided
    if (author) {
      updateMetaTag('twitter:creator', `@${author}`, false);
      updateMetaTag('article:author', author);
    }

    // Add additional meta tags for better SEO and social sharing
    updateMetaTag('robots', 'index, follow', false);
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0', false);

    // Force update of canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', url);

    // Log meta tags for debugging
    console.log('Meta tags updated:', {
      title,
      description,
      image,
      url,
      type
    });

    // Cleanup function to reset to defaults when component unmounts
    return () => {
      document.title = "Coppolek - The Front Page of the Internet";
    };
  }, [title, description, image, url, type, imageAlt, siteName, author]);

  return null; // This component doesn't render anything
};
