'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Themes, ThemeMode } from '@/types/hass';

// ============================================
// CSS Variables for Themes
// ============================================

const lightThemeVariables: Record<string, string> = {
  // Primary colors
  '--primary-color': '#03a9f4',
  '--primary-text-color': '#212121',
  '--secondary-text-color': '#727272',
  '--text-primary-color': '#ffffff',
  '--disabled-text-color': '#bdbdbd',
  
  // Background colors
  '--primary-background-color': '#fafafa',
  '--secondary-background-color': '#ffffff',
  '--card-background-color': '#ffffff',
  '--divider-color': 'rgba(0, 0, 0, 0.12)',
  
  // State colors
  '--state-icon-color': '#44739e',
  '--state-inactive-color': '#969696',
  '--state-active-color': '#fdd835',
  
  // Entity state colors
  '--state-light-active-color': '#fdd835',
  '--state-light-off-color': '#969696',
  '--state-switch-active-color': '#66bb6a',
  '--state-switch-off-color': '#969696',
  '--state-climate-cool-color': '#2196f3',
  '--state-climate-heat-color': '#ff9800',
  '--state-climate-idle-color': '#969696',
  '--state-climate-auto-color': '#4caf50',
  '--state-alarm-armed-color': '#4caf50',
  '--state-alarm-disarmed-color': '#969696',
  '--state-alarm-pending-color': '#ff9800',
  '--state-alarm-triggered-color': '#f44336',
  
  // Severity colors
  '--error-color': '#db4437',
  '--warning-color': '#ff9800',
  '--success-color': '#43a047',
  '--info-color': '#039be5',
  
  // Card styles
  '--ha-card-border-radius': '12px',
  '--ha-card-border-width': '1px',
  '--ha-card-border-color': 'var(--divider-color)',
  '--ha-card-box-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
  
  // Tile card
  '--tile-color': 'var(--state-inactive-color)',
  
  // Spacing
  '--ha-space-1': '4px',
  '--ha-space-2': '8px',
  '--ha-space-3': '12px',
  '--ha-space-4': '16px',
  '--ha-space-5': '20px',
  '--ha-space-6': '24px',
  '--ha-space-8': '32px',
  '--ha-space-9': '36px',
  '--ha-space-10': '40px',
  
  // Font sizes
  '--ha-font-size-xs': '0.75rem',
  '--ha-font-size-s': '0.875rem',
  '--ha-font-size-m': '1rem',
  '--ha-font-size-l': '1.125rem',
  '--ha-font-size-xl': '1.25rem',
  '--ha-font-size-2xl': '1.5rem',
  '--ha-font-size-3xl': '1.875rem',
  
  // Line heights
  '--ha-line-height-condensed': '1.2',
  '--ha-line-height-normal': '1.5',
  '--ha-line-height-expanded': '1.75',
  
  // Border radius
  '--ha-border-radius-sm': '4px',
  '--ha-border-radius-md': '8px',
  '--ha-border-radius-lg': '12px',
  '--ha-border-radius-xl': '16px',
  '--ha-border-radius-pill': '9999px',
  '--ha-border-radius-square': '0px',
  
  // Ripple
  '--ha-ripple-color': 'var(--primary-color)',
  '--ha-ripple-hover-opacity': '0.04',
  '--ha-ripple-pressed-opacity': '0.12',
  
  // Slider
  '--slider-track-color': '#e0e0e0',
  '--slider-bar-color': 'var(--primary-color)',
};

const darkThemeVariables: Record<string, string> = {
  // Primary colors
  '--primary-color': '#4fc3f7',
  '--primary-text-color': '#e1e1e1',
  '--secondary-text-color': '#9e9e9e',
  '--text-primary-color': '#ffffff',
  '--disabled-text-color': '#6f6f6f',
  
  // Background colors
  '--primary-background-color': '#111318',
  '--secondary-background-color': '#1c1c1c',
  '--card-background-color': '#1e1e1e',
  '--divider-color': 'rgba(255, 255, 255, 0.12)',
  
  // State colors
  '--state-icon-color': '#69b0ce',
  '--state-inactive-color': '#6f6f6f',
  '--state-active-color': '#fdd835',
  
  // Entity state colors
  '--state-light-active-color': '#fdd835',
  '--state-light-off-color': '#6f6f6f',
  '--state-switch-active-color': '#66bb6a',
  '--state-switch-off-color': '#6f6f6f',
  '--state-climate-cool-color': '#42a5f5',
  '--state-climate-heat-color': '#ffb74d',
  '--state-climate-idle-color': '#6f6f6f',
  '--state-climate-auto-color': '#66bb6a',
  '--state-alarm-armed-color': '#66bb6a',
  '--state-alarm-disarmed-color': '#6f6f6f',
  '--state-alarm-pending-color': '#ffb74d',
  '--state-alarm-triggered-color': '#ef5350',
  
  // Severity colors
  '--error-color': '#ef5350',
  '--warning-color': '#ffb74d',
  '--success-color': '#66bb6a',
  '--info-color': '#4fc3f7',
  
  // Card styles
  '--ha-card-border-radius': '12px',
  '--ha-card-border-width': '1px',
  '--ha-card-border-color': 'rgba(255, 255, 255, 0.1)',
  '--ha-card-box-shadow': '0 2px 4px rgba(0, 0, 0, 0.3)',
  
  // Tile card
  '--tile-color': 'var(--state-inactive-color)',
  
  // Spacing (same as light)
  '--ha-space-1': '4px',
  '--ha-space-2': '8px',
  '--ha-space-3': '12px',
  '--ha-space-4': '16px',
  '--ha-space-5': '20px',
  '--ha-space-6': '24px',
  '--ha-space-8': '32px',
  '--ha-space-9': '36px',
  '--ha-space-10': '40px',
  
  // Font sizes (same as light)
  '--ha-font-size-xs': '0.75rem',
  '--ha-font-size-s': '0.875rem',
  '--ha-font-size-m': '1rem',
  '--ha-font-size-l': '1.125rem',
  '--ha-font-size-xl': '1.25rem',
  '--ha-font-size-2xl': '1.5rem',
  '--ha-font-size-3xl': '1.875rem',
  
  // Line heights (same as light)
  '--ha-line-height-condensed': '1.2',
  '--ha-line-height-normal': '1.5',
  '--ha-line-height-expanded': '1.75',
  
  // Border radius (same as light)
  '--ha-border-radius-sm': '4px',
  '--ha-border-radius-md': '8px',
  '--ha-border-radius-lg': '12px',
  '--ha-border-radius-xl': '16px',
  '--ha-border-radius-pill': '9999px',
  '--ha-border-radius-square': '0px',
  
  // Ripple
  '--ha-ripple-color': 'var(--primary-color)',
  '--ha-ripple-hover-opacity': '0.08',
  '--ha-ripple-pressed-opacity': '0.16',
  
  // Slider
  '--slider-track-color': '#424242',
  '--slider-bar-color': 'var(--primary-color)',
};

// ============================================
// Theme Context Interface
// ============================================

interface ThemeContextValue {
  themes: Themes;
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  applyTheme: (themeName?: string) => void;
  getCssVariable: (name: string) => string;
}

const defaultThemes: Themes = {
  default_theme: 'default',
  default_dark_theme: null,
  themes: {},
  darkMode: false,
  theme: 'default',
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ============================================
// Theme Provider Component
// ============================================

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({ children, defaultMode = 'auto' }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultMode);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themes, setThemes] = useState<Themes>(defaultThemes);

  // Detect system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (themeMode === 'auto') {
        setIsDarkMode(e.matches);
      }
    };

    // Initial check
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  // Update dark mode based on theme mode
  useEffect(() => {
    if (themeMode === 'dark') {
      setIsDarkMode(true);
    } else if (themeMode === 'light') {
      setIsDarkMode(false);
    }
    // 'auto' is handled by the system preference effect
  }, [themeMode]);

  // Apply CSS variables to document
  useEffect(() => {
    const variables = isDarkMode ? darkThemeVariables : lightThemeVariables;
    const root = document.documentElement;

    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Update body background
    document.body.style.backgroundColor = variables['--primary-background-color'];
    document.body.style.color = variables['--primary-text-color'];

    // Update themes state
    setThemes(prev => ({
      ...prev,
      darkMode: isDarkMode,
    }));
  }, [isDarkMode]);

  // Load saved theme preference
  useEffect(() => {
    const saved = localStorage.getItem('themeMode') as ThemeMode | null;
    if (saved && ['auto', 'light', 'dark'].includes(saved)) {
      setThemeModeState(saved);
    }
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('themeMode', mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(isDarkMode ? 'light' : 'dark');
  }, [isDarkMode, setThemeMode]);

  const applyTheme = useCallback((themeName?: string) => {
    // For future custom theme support
    console.log('Apply theme:', themeName);
  }, []);

  const getCssVariable = useCallback((name: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }, []);

  const value: ThemeContextValue = {
    themes,
    themeMode,
    isDarkMode,
    setThemeMode,
    toggleTheme,
    applyTheme,
    getCssVariable,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// ============================================
// State Color Utilities
// ============================================

export function getStateColor(state: string, domain: string, attributes?: Record<string, any>): string {
  // Light entities
  if (domain === 'light') {
    if (state === 'on') {
      if (attributes?.rgb_color) {
        const [r, g, b] = attributes.rgb_color;
        return `rgb(${r}, ${g}, ${b})`;
      }
      return 'var(--state-light-active-color)';
    }
    return 'var(--state-light-off-color)';
  }

  // Switch entities
  if (domain === 'switch' || domain === 'input_boolean') {
    return state === 'on' 
      ? 'var(--state-switch-active-color)' 
      : 'var(--state-switch-off-color)';
  }

  // Climate entities
  if (domain === 'climate') {
    const hvacAction = attributes?.hvac_action;
    if (hvacAction === 'cooling') return 'var(--state-climate-cool-color)';
    if (hvacAction === 'heating') return 'var(--state-climate-heat-color)';
    if (hvacAction === 'idle') return 'var(--state-climate-idle-color)';
    if (state === 'auto') return 'var(--state-climate-auto-color)';
    return 'var(--state-icon-color)';
  }

  // Alarm panel
  if (domain === 'alarm_control_panel') {
    if (state.includes('armed')) return 'var(--state-alarm-armed-color)';
    if (state === 'disarmed') return 'var(--state-alarm-disarmed-color)';
    if (state === 'pending' || state === 'arming') return 'var(--state-alarm-pending-color)';
    if (state === 'triggered') return 'var(--state-alarm-triggered-color)';
    return 'var(--state-icon-color)';
  }

  // Binary sensors
  if (domain === 'binary_sensor') {
    const deviceClass = attributes?.device_class;
    if (state === 'on') {
      if (['battery', 'gas', 'problem', 'safety', 'smoke', 'tamper'].includes(deviceClass || '')) {
        return 'var(--error-color)';
      }
      if (['motion', 'occupancy', 'presence', 'vibration'].includes(deviceClass || '')) {
        return 'var(--primary-color)';
      }
      return 'var(--state-active-color)';
    }
    return 'var(--state-inactive-color)';
  }

  // Person / Device tracker
  if (domain === 'person' || domain === 'device_tracker') {
    if (state === 'home') return 'var(--success-color)';
    if (state === 'not_home') return 'var(--state-inactive-color)';
    return 'var(--primary-color)';
  }

  // Default active/inactive
  if (['on', 'open', 'unlocked', 'playing', 'home', 'active'].includes(state)) {
    return 'var(--state-active-color)';
  }

  return 'var(--state-inactive-color)';
}

export function isStateActive(state: string, domain?: string): boolean {
  const activeStates = [
    'on', 'open', 'unlocked', 'playing', 'home', 'active',
    'heat', 'cool', 'heat_cool', 'auto', 'dry', 'fan_only',
    'armed_home', 'armed_away', 'armed_night', 'armed_vacation', 'armed_custom_bypass',
    'triggered', 'pending', 'arming',
  ];
  
  // Special handling for unavailable states
  if (['unavailable', 'unknown'].includes(state)) {
    return false;
  }

  return activeStates.includes(state);
}

export default ThemeContext;
