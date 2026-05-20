import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { AppMode, AppFilters, HostProperty, Event } from '../types';
import { supabase } from '../lib/supabase';
import * as api from '../lib/api';

interface AppContextType {
  session: Session | null;
  user: User | null;
  authLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  events: Event[];
  eventsLoading: boolean;
  filteredEvents: Event[];
  refreshEvents: () => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [mode, setMode] = useState<AppMode>('viajero');
  const [filters, setFiltersState] = useState<AppFilters>(DEFAULT_FILTERS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hostProperty, setHostProperty] = useState<HostProperty | null>(DEFAULT_HOST);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const data = await api.fetchAllEvents();
      setEvents(data);
    } catch (e) {
      console.warn('Failed to load events:', e);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  useEffect(() => {
    if (session?.user) {
      api.fetchFavorites(session.user.id).then(setFavorites);
    } else {
      setFavorites([]);
    }
  }, [session]);

  const filteredEvents = useMemo(
    () => api.applyFilters(events, filters),
    [events, filters],
  );

  const setFilters = useCallback((partial: Partial<AppFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), []);

  const toggleFavorite = useCallback(
    (eventId: string) => {
      const userId = session?.user?.id;
      const isFav = favorites.includes(eventId);
      setFavorites((prev) => (isFav ? prev.filter((id) => id !== eventId) : [...prev, eventId]));
      if (userId) {
        if (isFav) {
          api.removeFavorite(userId, eventId);
        } else {
          api.addFavorite(userId, eventId);
        }
      }
    },
    [favorites, session],
  );

  const isFavorite = useCallback(
    (eventId: string) => favorites.includes(eventId),
    [favorites],
  );

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AppContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        authLoading,
        signUp,
        signIn,
        signOut,
        events,
        eventsLoading,
        filteredEvents,
        refreshEvents,
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
