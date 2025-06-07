
import { useEffect } from 'react';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const MetaTags = ({ 
  title = "Coppolek - The Front Page of the Internet",
  description = "A modern Reddit clone built with React",
  image = "https://lovable.dev/opengraph-image-p98pqg.png",
  url = window.location.href,
  type = "website"
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

    // Update OpenGraph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', type);

    // Update Twitter tags
    updateMetaTag('twitter:title', title, false);
    updateMetaTag('twitter:description', description, false);
    updateMetaTag('twitter:image', image, false);
    updateMetaTag('twitter:card', 'summary_large_image', false);

    // Update description meta tag
    updateMetaTag('description', description, false);

    // Cleanup function to reset to defaults when component unmounts
    return () => {
      document.title = "Coppolek - The Front Page of the Internet";
    };
  }, [title, description, image, url, type]);

  return null; // This component doesn't render anything
};
