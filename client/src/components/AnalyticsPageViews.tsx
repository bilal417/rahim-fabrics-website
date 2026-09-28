import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/analytics';

export default function AnalyticsPageViews() {
  const location = useLocation();

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    const timer = window.setTimeout(() => trackPageView(path), 0);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search]);

  return null;
}
