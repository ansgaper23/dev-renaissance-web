import { onINP, onFCP, onLCP, onCLS } from 'web-vitals';
import { useEffect } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  route: string;
  timestamp: number;
}

export const usePerformance = () => {
  useEffect(() => {
    const handleMetric = (metric: any) => {
      const performanceData: PerformanceMetric = {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        route: window.location.pathname,
        timestamp: Date.now(),
      };

      // Log to console for debugging
      console.log(`🏁 ${metric.name}:`, {
        value: `${Math.round(metric.value)}ms`,
        rating: metric.rating,
        route: performanceData.route
      });

      // Optional: Send to analytics if needed
      // You can uncomment this to send to Supabase analytics
      /*
      if (metric.name === 'INP' && metric.value > 200) {
        // Log poor INP scores for investigation
        supabase.from('performance_logs').insert([performanceData]);
      }
      */
    };

    // Monitor Core Web Vitals
    onINP(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onCLS(handleMetric);
  }, []);
};