import { useEffect, useState } from 'react';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

interface UseSearchHistoryReturn {
  searchHistory: string[];
  addToHistory: (term: string) => void;
  clearHistory: () => void;
  removeFromHistory: (term: string) => void;
}

export function useSearchHistory(): UseSearchHistoryReturn {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory) as string[];

      if (Array.isArray(parsed)) {
        setSearchHistory(JSON.parse(savedHistory) as string[]);
      }
    }
  }, []);

  const addToHistory = (term: string) => {
    if (!term.trim()) return;

    setSearchHistory((prevHistory) => {
      // Remove duplicate if exists
      const filteredHistory = prevHistory.filter((item) => item !== term);

      // Add new term to the beginning
      const newHistory = [term, ...filteredHistory];

      // Keep only the latest MAX_HISTORY_ITEMS items
      const trimmedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);

      // Save to localStorage
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmedHistory));

      return trimmedHistory;
    });
  };

  const removeFromHistory = (term: string) => {
    setSearchHistory((prevHistory) => {
      // Filter out the term to remove
      const newHistory = prevHistory.filter((item) => item !== term);

      // Update localStorage with the new history
      if (newHistory.length > 0) {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      } else {
        // If history is empty, remove the key from localStorage
        localStorage.removeItem(SEARCH_HISTORY_KEY);
      }

      return newHistory;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    setSearchHistory([]);
  };

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}
