import { useEffect } from 'react';

/**
 * Custom hook to set the page title dynamically
 * @param title - The page title (e.g., "Dashboard", "Inventory")
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `StockyWeb - ${title}`;
  }, [title]);
}
