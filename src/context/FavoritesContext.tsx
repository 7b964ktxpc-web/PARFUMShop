import React, { createContext, useContext, useState, useEffect } from 'react';
import { triggerHaptic } from '../lib/telegram';

interface FavoritesContextType {
  favoriteIds: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);
const FAVORITES_STORAGE_KEY = 'parfum_selective_favorites_v1';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage', e);
    }
  }, [favoriteIds]);

  const toggleFavorite = (productId: string) => {
    setFavoriteIds(prev => {
      const isFav = prev.includes(productId);
      if (isFav) {
        triggerHaptic('light');
        return prev.filter(id => id !== productId);
      } else {
        triggerHaptic('success');
        return [...prev, productId];
      }
    });
  };

  const isFavorite = (productId: string) => favoriteIds.includes(productId);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
