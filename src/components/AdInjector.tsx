import { useEffect } from 'react';
import { useDomainAds } from '@/hooks/useDomainAds';

interface AdInjectorProps {
  /** 'playback' for movie/series pages, 'global' for all pages, undefined for both */
  scope?: 'global' | 'playback';
}

const AdInjector = ({ scope }: AdInjectorProps) => {
  const { data: ads = [] } = useDomainAds(scope);

  useEffect(() => {
    // Clean previous injected ads for this scope
    const scopeAttr = scope || 'all';
    document.querySelectorAll(`[data-domain-ad-scope="${scopeAttr}"]`).forEach(el => el.remove());

    if (ads.length === 0) return;

    ads.forEach((ad, index) => {
      if (!ad.ad_code) return;
      try {
        const parser = new DOMParser();
        const parsed = parser.parseFromString(ad.ad_code, 'text/html');
        const scripts = Array.from(parsed.querySelectorAll('script')) as HTMLScriptElement[];

        if (scripts.length > 0) {
          scripts.forEach((scr, si) => {
            const s = document.createElement('script');
            Array.from(scr.attributes).forEach(attr => s.setAttribute(attr.name, attr.value));
            if (scr.src) s.src = scr.src;
            else if (scr.text || scr.textContent) s.text = scr.text || scr.textContent || '';
            s.setAttribute('data-domain-ad-scope', scopeAttr);
            s.setAttribute('data-domain-ad-id', ad.id);
            document.head.appendChild(s);
          });
        } else {
          const s = document.createElement('script');
          s.type = 'text/javascript';
          s.setAttribute('data-domain-ad-scope', scopeAttr);
          s.setAttribute('data-domain-ad-id', ad.id);
          s.text = ad.ad_code;
          document.head.appendChild(s);
        }
      } catch (e) {
        console.warn('Error injecting domain ad:', e);
      }
    });

    return () => {
      document.querySelectorAll(`[data-domain-ad-scope="${scopeAttr}"]`).forEach(el => el.remove());
    };
  }, [ads, scope]);

  return null;
};

export default AdInjector;
