'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { 
  HassContext, 
  HassEntity, 
  Themes, 
  LocaleData, 
  HassConfig,
  EntityRegistryEntry,
  DeviceRegistryEntry,
  AreaRegistryEntry,
  ServiceTarget,
} from '@/types/hass';
import { WebSocketService, initWebSocketService } from '@/services/websocket.service';
import env from '@/config/env';

// ============================================
// Default Values
// ============================================

const defaultLocale: LocaleData = {
  language: 'en',
  number_format: 'language',
  time_format: '24',
  date_format: 'language',
  first_weekday: 'monday',
  time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

const defaultConfig: HassConfig = {
  latitude: 0,
  longitude: 0,
  elevation: 0,
  unit_system: {
    length: 'km',
    mass: 'kg',
    temperature: '°C',
    volume: 'L',
    pressure: 'hPa',
    wind_speed: 'km/h',
    accumulated_precipitation: 'mm',
  },
  location_name: 'Home',
  time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  currency: 'USD',
  language: 'en',
};

const defaultThemes: Themes = {
  default_theme: 'default',
  default_dark_theme: null,
  themes: {},
  darkMode: false,
  theme: 'default',
};

// ============================================
// Format Helpers
// ============================================

function formatEntityState(stateObj: HassEntity, state?: string): string {
  const stateToFormat = state || stateObj.state;
  
  // Handle unavailable states
  if (['unavailable', 'unknown'].includes(stateToFormat)) {
    return stateToFormat.charAt(0).toUpperCase() + stateToFormat.slice(1);
  }
  
  // Handle numeric states with units
  const numericValue = parseFloat(stateToFormat);
  if (!isNaN(numericValue)) {
    const unit = stateObj.attributes.unit_of_measurement;
    const formatted = numericValue.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
    return unit ? `${formatted} ${unit}` : formatted;
  }
  
  // Handle datetime states
  const deviceClass = stateObj.attributes.device_class;
  if (deviceClass === 'timestamp') {
    try {
      return new Date(stateToFormat).toLocaleString();
    } catch {
      return stateToFormat;
    }
  }
  
  // Handle boolean-like states
  if (stateToFormat === 'on') return 'On';
  if (stateToFormat === 'off') return 'Off';
  if (stateToFormat === 'home') return 'Home';
  if (stateToFormat === 'not_home') return 'Away';
  
  // Default: capitalize first letter
  return stateToFormat.charAt(0).toUpperCase() + stateToFormat.slice(1).replace(/_/g, ' ');
}

function formatEntityAttributeValue(stateObj: HassEntity, attribute: string, value?: any): string {
  const attrValue = value ?? stateObj.attributes[attribute];
  
  if (attrValue === undefined || attrValue === null) {
    return '';
  }
  
  // Handle arrays
  if (Array.isArray(attrValue)) {
    return attrValue.join(', ');
  }
  
  // Handle numbers
  if (typeof attrValue === 'number') {
    return attrValue.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  }
  
  // Handle booleans
  if (typeof attrValue === 'boolean') {
    return attrValue ? 'Yes' : 'No';
  }
  
  // Handle objects
  if (typeof attrValue === 'object') {
    return JSON.stringify(attrValue);
  }
  
  return String(attrValue);
}

function formatEntityAttributeName(stateObj: HassEntity, attribute: string): string {
  // Convert snake_case to Title Case
  return attribute
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================
// Localize Helper
// ============================================

function createLocalize(translations: Record<string, string> = {}) {
  return (key: string, params?: Record<string, any>): string => {
    let result = translations[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }
    
    return result;
  };
}

// ============================================
// useHass Hook (Polling Mode)
// ============================================

interface UseHassOptions {
  apiUrl?: string;
  pollInterval?: number;
  useWebSocket?: boolean;
  wsUrl?: string;
  accessToken?: string;
}

export function useHass(options: UseHassOptions = {}): HassContext {
  const {
    apiUrl = env.API_URL,
    pollInterval = 5000,
    useWebSocket = false,
    wsUrl,
    accessToken,
  } = options;

  const [states, setStates] = useState<Record<string, HassEntity>>({});
  const [connected, setConnected] = useState(false);
  const [entities, setEntities] = useState<Record<string, EntityRegistryEntry>>({});
  const [devices, setDevices] = useState<Record<string, DeviceRegistryEntry>>({});
  const [areas, setAreas] = useState<Record<string, AreaRegistryEntry>>({});
  
  const wsRef = useRef<WebSocketService | null>(null);

  // ============================================
  // Fetch States (Polling Mode)
  // ============================================

  const fetchStates = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/v1/states`);
      if (res.ok) {
        const entityList: HassEntity[] = await res.json();
        const statesMap: Record<string, HassEntity> = {};
        entityList.forEach(e => {
          statesMap[e.entity_id] = e;
        });
        setStates(statesMap);
        setConnected(true);
      } else {
        setConnected(false);
      }
    } catch (e) {
      console.error('Failed to fetch states', e);
      setConnected(false);
    }
  }, [apiUrl]);

  // ============================================
  // WebSocket Mode
  // ============================================

  useEffect(() => {
    if (useWebSocket && wsUrl && accessToken) {
      const ws = initWebSocketService(wsUrl, accessToken);
      wsRef.current = ws;

      ws.connect()
        .then(() => {
          console.log('WebSocket connected');
        })
        .catch((err) => {
          console.error('WebSocket connection failed:', err);
        });

      const unsubState = ws.onStateChange((newStates) => {
        setStates(newStates);
      });

      const unsubConnection = ws.onConnectionChange((isConnected) => {
        setConnected(isConnected);
      });

      return () => {
        unsubState();
        unsubConnection();
        ws.disconnect();
      };
    }

    // Polling mode
    fetchStates();
    const interval = setInterval(fetchStates, pollInterval);
    return () => clearInterval(interval);
  }, [useWebSocket, wsUrl, accessToken, fetchStates, pollInterval]);

  // ============================================
  // Call Service
  // ============================================

  const callService = useCallback(async (
    domain: string,
    service: string,
    data?: Record<string, any>,
    target?: ServiceTarget
  ): Promise<void> => {
    // WebSocket mode
    if (wsRef.current) {
      await wsRef.current.callService(domain, service, data, target);
      return;
    }

    // HTTP mode
    const serviceData = { ...data };
    if (target?.entity_id) {
      serviceData.entity_id = target.entity_id;
    }

    try {
      const res = await fetch(`${apiUrl}/api/v1/services/${domain}/${service}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData),
      });

      if (!res.ok) {
        throw new Error(`Service call failed: ${res.status}`);
      }

      // Refresh states after service call
      setTimeout(fetchStates, 500);
    } catch (error) {
      console.error('Service call failed:', error);
      throw error;
    }
  }, [apiUrl, fetchStates]);

  // ============================================
  // Build Context
  // ============================================

  const context: HassContext = useMemo(() => ({
    states,
    callService,
    themes: defaultThemes,
    locale: defaultLocale,
    config: defaultConfig,
    entities,
    devices,
    areas,
    connected,
    formatEntityState,
    formatEntityAttributeValue,
    formatEntityAttributeName,
    localize: createLocalize(),
  }), [states, callService, entities, devices, areas, connected]);

  return context;
}

// ============================================
// Simple useHass without WebSocket
// ============================================

export function useSimpleHass(): HassContext {
  return useHass({ useWebSocket: false });
}

export default useHass;
