import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface LazySectionProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: React.ReactNode;
}

const LazySection = ({ 
  children, 
  threshold = 0.1, 
  rootMargin = '200px',
  fallback
}: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFallback = (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-cuevana-blue" />
        </div>
      </div>
    </div>
  );

  return (
    <div ref={ref}>
      {isVisible ? (
        <Suspense fallback={fallback || defaultFallback}>
          {children}
        </Suspense>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
};

export default LazySection;