import React, { createContext, useContext, useState, useCallback } from 'react';
import { AppMode, AppFilters, HostProperty, EventCategory, Region, DateFilter } from '../types';

interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  filters: AppFilters;
  setFilters: (partial: Partial<AppFilters>) => void;
  resetFilters: () => void;
  favorites: string[];
  toggleFavorite: (eventId: string) => void;
  isFavorite: (eventId: string) => boolean;
  hostProperty: HostProperty | null;
  setHostProperty: (property: HostProperty) => void;
}

const DEFAULT_FILTERS: AppFilters = {
  category: 'all',
  region: 'todas',
  dateFilter: 'todas',
  searchQuery: '',
};

const DEFAULT_HOST: HostProperty = {
  name: 'Casa Rural El Olmo',
  town: 'Mora de Rubielos',
  coordinates: { latitude: 40.252, longitude: -0.7476 },
  radiusKm: 50,
};

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>('viajero');
  const [filters, setFiltersState] = useState<AppFilters>(DEFAULT_FILTERS);
  const [favorites, setFavorites] = useState<string[]>(['ev001', 'ev013']);
  const [hostProperty, setHostProperty] = useState<HostProperty | null>(DEFAULT_HOST);

  const setFilters = useCallback((partial: Partial<AppFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const toggleFavorite = useCallback((eventId: string) => {
    setFavorites((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId],
    );
  }, []);

  const isFavorite = useCallback((eventId: string) => favorites.includes(eventId), [favorites]);

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        filters,
        setFilters,
        resetFilters,
        favorites,
        toggleFavorite,
        isFavorite,
        hostProperty,
        setHostProperty,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
