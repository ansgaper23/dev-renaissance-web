import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'movie' | 'series' | 'website';
  siteName?: string;
  logoUrl?: string;
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  adsCode?: string;
}

const SEOHead = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  siteName = 'Cuevana3',
  logoUrl,
  keywords,
  author = 'Cuevana3',
  publishedTime,
  modifiedTime,
  section = 'Entretenimiento',
  tags = [],
  adsCode
}: SEOHeadProps) => {
  useEffect(() => {
    const currentUrl = url || window.location.href;
    const fullTitle = title ? `${title} - ${siteName}` : `${siteName} - Películas y Series Online Gratis HD`;
    const defaultDescription = description || 'Ver películas y series online gratis en HD. Estrenos, clásicos y contenido exclusivo en Cuevana3. Sin registro, sin límites.';
    const defaultKeywords = keywords || 'películas online, series gratis, ver peliculas, streaming gratis, cuevana3, cine online, estrenos, HD, sin registro';

    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false, isHttpEquiv = false) => {
      const attribute = isHttpEquiv ? 'http-equiv' : (isProperty ? 'property' : 'name');
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Update favicon and manifest
    if (logoUrl) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = logoUrl;
      }
      
      // Add apple-touch-icon
      let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (!appleTouchIcon) {
        appleTouchIcon = document.createElement('link');
        appleTouchIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleTouchIcon);
      }
      appleTouchIcon.href = logoUrl;
    }

    // Basic SEO Meta Tags
    updateMetaTag('description', defaultDescription);
    updateMetaTag('keywords', defaultKeywords);
    updateMetaTag('author', author);
    updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMetaTag('googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMetaTag('language', 'es');
    updateMetaTag('geo.region', 'ES');
    updateMetaTag('geo.placename', 'España');
    updateMetaTag('distribution', 'global');
    updateMetaTag('rating', 'general');
    updateMetaTag('revisit-after', '1 days');

    // Open Graph Meta Tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', defaultDescription, true);
    updateMetaTag('og:type', type === 'website' ? 'website' : (type === 'movie' ? 'video.movie' : 'video.tv_show'), true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:site_name', siteName, true);
    updateMetaTag('og:locale', 'es_ES', true);
    
    if (image) {
      updateMetaTag('og:image', image, true);
      updateMetaTag('og:image:width', '1200', true);
      updateMetaTag('og:image:height', '630', true);
      updateMetaTag('og:image:type', 'image/jpeg', true);
      updateMetaTag('og:image:alt', fullTitle, true);
    }

    if (publishedTime) {
      updateMetaTag('article:published_time', publishedTime, true);
    }
    if (modifiedTime) {
      updateMetaTag('article:modified_time', modifiedTime, true);
    }
    if (section) {
      updateMetaTag('article:section', section, true);
    }
    if (tags.length > 0) {
      tags.forEach(tag => {
        updateMetaTag('article:tag', tag, true);
      });
    }

    // Twitter Card Meta Tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', defaultDescription);
    updateMetaTag('twitter:site', '@cuevana3');
    updateMetaTag('twitter:creator', '@cuevana3');
    
    if (image) {
      updateMetaTag('twitter:image', image);
      updateMetaTag('twitter:image:alt', fullTitle);
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;

    // Hreflang for international SEO
    let hreflang = document.querySelector('link[hreflang="es"]') as HTMLLinkElement;
    if (!hreflang) {
      hreflang = document.createElement('link');
      hreflang.rel = 'alternate';
      hreflang.setAttribute('hreflang', 'es');
      document.head.appendChild(hreflang);
    }
    hreflang.href = currentUrl;

    // DNS Prefetch for performance
    const dnsPrefetches = [
      'https://image.tmdb.org',
      'https://www.youtube.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    dnsPrefetches.forEach(domain => {
      if (!document.querySelector(`link[rel="dns-prefetch"][href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        document.head.appendChild(link);
      }
    });

    // Add ads code to head if provided
    if (adsCode) {
      // Remove existing ads code if any
      const existingAdsScript = document.querySelector('#ads-code-script');
      if (existingAdsScript) {
        existingAdsScript.remove();
      }

      // Create and append new ads code
      const adsScript = document.createElement('script');
      adsScript.id = 'ads-code-script';
      adsScript.innerHTML = adsCode;
      document.head.appendChild(adsScript);
    }

    // Add JSON-LD schema for better SEO
    const existingSchema = document.querySelector('#seo-schema');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Create schema based on type
    let schema: any;

    if (type === 'website') {
      // For website, create a proper @graph structure without circular references
      const websiteSchema = {
        "@type": "WebSite",
        "@id": `${window.location.origin}/#website`,
        "name": siteName,
        "description": defaultDescription,
        "url": window.location.origin,
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${window.location.origin}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        },
        "publisher": {
          "@id": `${window.location.origin}/#organization`
        }
      };

      const organizationSchema = {
        "@type": "Organization",
        "@id": `${window.location.origin}/#organization`,
        "name": siteName,
        "url": window.location.origin,
        "sameAs": [
          "https://www.facebook.com/cuevana3",
          "https://twitter.com/cuevana3",
          "https://www.instagram.com/cuevana3"
        ]
      };

      if (logoUrl) {
        organizationSchema["logo"] = {
          "@type": "ImageObject",
          "url": logoUrl
        };
      }

      schema = {
        "@context": "https://schema.org",
        "@graph": [websiteSchema, organizationSchema]
      };
    } else {
      // For movies and series
      schema = {
        "@context": "https://schema.org",
        "@type": type === 'movie' ? "Movie" : "TVSeries",
        "name": title || siteName,
        "description": defaultDescription,
        "url": currentUrl
      };

      if (image) {
        schema.image = {
          "@type": "ImageObject",
          "url": image,
          "width": 1200,
          "height": 630
        };
      }

      if (publishedTime) {
        schema.datePublished = publishedTime;
      }
      if (modifiedTime) {
        schema.dateModified = modifiedTime;
      }
      if (tags.length > 0) {
        schema.genre = tags;
      }
      
      schema.author = {
        "@type": "Organization",
        "name": siteName
      };
      
      schema.publisher = {
        "@type": "Organization",
        "name": siteName
      };

      if (logoUrl) {
        schema.publisher.logo = {
          "@type": "ImageObject",
          "url": logoUrl
        };
      }
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'seo-schema';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

  }, [title, description, image, url, type, siteName, logoUrl, keywords, author, publishedTime, modifiedTime, section, tags, adsCode]);

  return null;
};

export default SEOHead;
