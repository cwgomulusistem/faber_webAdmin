'use client';

// Home Context
// Manages user's homes and active home selection

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { homeService } from '../services/home.service';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Home } from '../types/home.types';

interface HomeContextType {
  homes: Home[];
  activeHome: Home | null;
  isLoading: boolean;
  error: string | null;
  setActiveHome: (homeId: string) => void;
  refreshHomes: () => Promise<void>;
  clearError: () => void;
}

const HomeContext = createContext<HomeContextType>({
  homes: [],
  activeHome: null,
  isLoading: true,
  error: null,
  setActiveHome: () => {},
  refreshHomes: async () => {},
  clearError: () => {},
});

export function useHome(): HomeContextType {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
}

const ACTIVE_HOME_KEY = 'faber_active_home_id';

export function HomeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [homes, setHomes] = useState<Home[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeHomeId, setActiveHomeId] = useLocalStorage<string | null>(ACTIVE_HOME_KEY, null);

  // Load homes from API
  const loadHomes = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const homesList = await homeService.getHomes();
      setHomes(homesList);

      // If no active home is set, or active home is not in the list, set default
      if (homesList.length > 0) {
        const defaultHome = homesList.find((h) => h.isDefault) || homesList[0];
        
        if (!activeHomeId || !homesList.find((h) => h.id === activeHomeId)) {
          setActiveHomeId(defaultHome.id);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load homes';
      setError(message);
      console.error('Error loading homes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, activeHomeId, setActiveHomeId]);

  // Initial load
  useEffect(() => {
    loadHomes();
  }, [loadHomes]);

  // Get active home from homes list
  const activeHome = useMemo(() => {
    if (!activeHomeId || homes.length === 0) {
      return null;
    }
    return homes.find((h) => h.id === activeHomeId) || null;
  }, [activeHomeId, homes]);

  // Set active home
  const setActiveHome = useCallback((homeId: string) => {
    const home = homes.find((h) => h.id === homeId);
    if (home) {
      setActiveHomeId(homeId);
    } else {
      setError(`Home with ID ${homeId} not found`);
    }
  }, [homes, setActiveHomeId]);

  // Refresh homes
  const refreshHomes = useCallback(async () => {
    await loadHomes();
  }, [loadHomes]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<HomeContextType>(() => ({
    homes,
    activeHome,
    isLoading,
    error,
    setActiveHome,
    refreshHomes,
    clearError,
  }), [
    homes,
    activeHome,
    isLoading,
    error,
    setActiveHome,
    refreshHomes,
    clearError,
  ]);

  return (
    <HomeContext.Provider value={value}>
      {children}
    </HomeContext.Provider>
  );
}

export default HomeContext;
