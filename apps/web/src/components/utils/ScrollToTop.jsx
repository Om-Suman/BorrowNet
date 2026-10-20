import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures the browser window resets to the top (x: 0, y: 0)
 * whenever the user navigates between routes or query parameters.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // Instant jump ensures user doesn't see a delayed scroll animation
    });
  }, [pathname, search]);

  return null;
}

