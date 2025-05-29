
import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'movie' | 'series' | 'website';
  siteName?: string;
  logoUrl?: string;
}

const SEOHead = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  siteName = 'Cuevana3',
  logoUrl
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} - ${siteName}`;
    }

    // Update meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Update favicon if logo is available
    if (logoUrl) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = logoUrl;
      }
    }

    if (description) {
      updateMetaTag('description', description);
      updateMetaTag('og:description', description, true);
      updateMetaTag('twitter:description', description);
    }

    if (title) {
      updateMetaTag('og:title', `${title} - ${siteName}`, true);
      updateMetaTag('twitter:title', `${title} - ${siteName}`);
    }

    if (image) {
      updateMetaTag('og:image', image, true);
      updateMetaTag('twitter:image', image);
    }

    if (url) {
      updateMetaTag('og:url', url, true);
      updateMetaTag('canonical', url);
    }

    updateMetaTag('og:type', type === 'website' ? 'website' : 'video.movie', true);
    updateMetaTag('og:site_name', siteName, true);

    // Add JSON-LD schema for movies/series
    if (type !== 'website' && title && description) {
      const existingSchema = document.querySelector('#movie-schema');
      if (existingSchema) {
        existingSchema.remove();
      }

      const schema = {
        "@context": "https://schema.org",
        "@type": type === 'movie' ? "Movie" : "TVSeries",
        "name": title,
        "description": description,
        "url": url || window.location.href
      };

      if (image) {
        schema["image"] = image;
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'movie-schema';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [title, description, image, url, type, siteName, logoUrl]);

  return null;
};

export default SEOHead;
