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

    // Fallbacks con "ver película online"
    const extraKeyword = "ver película online";
    const defaultDescription =
      (description && description.length > 30 
        ? description
        : "Ver películas y series online gratis en HD. Estrenos, clásicos y contenido exclusivo en Cuevana3. Sin registro, sin límites."
      ) + " | " + siteName;
    const metaDescription = defaultDescription.length > 210 
      ? defaultDescription.substring(0, 210) + "..."
      : defaultDescription;
    const defaultKeywords = (
      (keywords ? keywords + ", " : "") +
      "películas online, series gratis, ver peliculas, streaming gratis, cuevana3, ver película online, cine online, estrenos, HD, sin registro"
    );

    // Título
    const fullTitle = title ? `${title} - ${siteName}` : `${siteName} - Películas y Series Online Gratis HD`;

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

    // Basic SEO Meta Tags (description con sinopsis y call-to-action)
    updateMetaTag('description', metaDescription);
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

    // Open Graph Meta Tags: WhatsApp usa og:name, og:image, og:description
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', metaDescription, true);
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
    updateMetaTag('twitter:description', metaDescription);
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

      // Create and append new ads code for popads
      const adsScript = document.createElement('script');
      adsScript.id = 'ads-code-script';
      adsScript.type = 'text/javascript';
      adsScript.setAttribute('data-cfasync', 'false');
      adsScript.async = false; // Ensure script loads synchronously for popads
      
      // For popads, we need to execute the script immediately
      try {
        adsScript.innerHTML = adsCode;
        document.head.appendChild(adsScript);
        
        // Force script execution by creating a new script element if needed
        setTimeout(() => {
          if (adsScript.innerHTML && !document.querySelector('#ads-code-backup')) {
            const backupScript = document.createElement('script');
            backupScript.id = 'ads-code-backup';
            backupScript.type = 'text/javascript';
            backupScript.setAttribute('data-cfasync', 'false');
            backupScript.text = adsCode;
            document.body.appendChild(backupScript);
          }
        }, 100);
      } catch (error) {
        console.log('Ad script load attempt:', error);
        // Alternative method for problematic scripts
        const scriptElement = document.createElement('div');
        scriptElement.innerHTML = `<script type="text/javascript" data-cfasync="false">${adsCode}</script>`;
        document.head.appendChild(scriptElement.firstChild as HTMLScriptElement);
      }
    }

    // Add JSON-LD schema for better SEO
    const existingSchema = document.querySelector('#seo-schema');
    if (existingSchema) existingSchema.remove();

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
      // Para movie o tvseries: description y keywords optimizados
      schema = {
        "@context": "https://schema.org",
        "@type": type === 'movie' ? "Movie" : "TVSeries",
        "name": title || siteName,
        "description": metaDescription,
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
      if (publishedTime) schema.datePublished = publishedTime;
      if (modifiedTime) schema.dateModified = modifiedTime;
      if (tags.length > 0) schema.genre = tags;
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
      // Siempre incluye keyword extra
      schema.keywords = defaultKeywords;
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
