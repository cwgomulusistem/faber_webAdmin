// ============================================
// Entity Types
// ============================================

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    unit_of_measurement?: string;
    icon?: string;
    device_class?: string;
    brightness?: number;
    rgb_color?: [number, number, number];
    hs_color?: [number, number];
    color_temp?: number;
    min_mireds?: number;
    max_mireds?: number;
    supported_features?: number;
    hvac_action?: string;
    hvac_modes?: string[];
    current_temperature?: number;
    temperature?: number;
    target_temp_high?: number;
    target_temp_low?: number;
    min_temp?: number;
    max_temp?: number;
    forecast?: WeatherForecast[];
    entity_picture?: string;
    entity_picture_local?: string;
    [key: string]: any;
  };
  last_changed: string;
  last_updated: string;
  context?: {
    id: string;
    parent_id?: string | null;
    user_id?: string | null;
  };
}

// ============================================
// Weather Types
// ============================================

export interface WeatherForecast {
  datetime: string;
  condition?: string;
  temperature?: number;
  templow?: number;
  precipitation?: number;
  precipitation_probability?: number;
  humidity?: number;
  wind_speed?: number;
  wind_bearing?: number;
  is_daytime?: boolean;
}

// ============================================
// Service Types
// ============================================

export interface ServiceTarget {
  entity_id?: string | string[];
  device_id?: string | string[];
  area_id?: string | string[];
}

// ============================================
// Action Types
// ============================================

export type ActionType = 
  | 'more-info' 
  | 'toggle' 
  | 'call-service' 
  | 'perform-action'
  | 'navigate' 
  | 'url' 
  | 'none'
  | 'fire-dom-event';

export interface ActionConfig {
  action: ActionType;
  entity?: string;
  navigation_path?: string;
  navigation_replace?: boolean;
  url_path?: string;
  service?: string;
  perform_action?: string;
  service_data?: Record<string, any>;
  data?: Record<string, any>;
  target?: ServiceTarget;
  confirmation?: {
    text?: string;
    exemptions?: Array<{ user: string }>;
  };
}

export interface ActionsConfig {
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

// ============================================
// Theme Types
// ============================================

export type ThemeMode = 'auto' | 'light' | 'dark';

export interface Theme {
  [key: string]: string;
}

export interface Themes {
  default_theme: string;
  default_dark_theme?: string | null;
  themes: Record<string, Theme>;
  darkMode: boolean;
  theme: string;
}

// ============================================
// Locale Types
// ============================================

export type TimeFormat = '12' | '24' | 'language';
export type DateFormat = 'language' | 'DMY' | 'MDY' | 'YMD';
export type FirstWeekday = 'language' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type NumberFormat = 'language' | 'none' | 'comma_decimal' | 'decimal_comma' | 'space_comma';

export interface LocaleData {
  language: string;
  number_format: NumberFormat;
  time_format: TimeFormat;
  date_format: DateFormat;
  first_weekday: FirstWeekday;
  time_zone: string;
}

// ============================================
// Config Types
// ============================================

export interface HassConfig {
  latitude: number;
  longitude: number;
  elevation: number;
  unit_system: {
    length: string;
    mass: string;
    temperature: string;
    volume: string;
    pressure: string;
    wind_speed: string;
    accumulated_precipitation: string;
  };
  location_name: string;
  time_zone: string;
  currency: string;
  country?: string;
  language: string;
}

// ============================================
// Entity Registry Types
// ============================================

export interface EntityRegistryEntry {
  entity_id: string;
  name?: string | null;
  icon?: string | null;
  platform: string;
  config_entry_id?: string | null;
  device_id?: string | null;
  area_id?: string | null;
  disabled_by?: string | null;
  hidden_by?: string | null;
  entity_category?: 'config' | 'diagnostic' | null;
  has_entity_name?: boolean;
  original_name?: string;
  unique_id: string;
  translation_key?: string | null;
  display_precision?: number | null;
}

// ============================================
// Device Registry Types
// ============================================

export interface DeviceRegistryEntry {
  id: string;
  config_entries: string[];
  connections: Array<[string, string]>;
  identifiers: Array<[string, string]>;
  manufacturer?: string | null;
  model?: string | null;
  name?: string | null;
  sw_version?: string | null;
  hw_version?: string | null;
  serial_number?: string | null;
  via_device_id?: string | null;
  area_id?: string | null;
  name_by_user?: string | null;
  disabled_by?: string | null;
  configuration_url?: string | null;
}

// ============================================
// Area Registry Types
// ============================================

export interface AreaRegistryEntry {
  area_id: string;
  floor_id?: string | null;
  name: string;
  picture?: string | null;
  icon?: string | null;
  aliases: string[];
}

// ============================================
// Grid Options Types
// ============================================

export interface LovelaceGridOptions {
  columns?: number;
  rows?: number | 'auto';
  min_columns?: number;
  min_rows?: number;
  max_columns?: number;
  max_rows?: number;
}

// ============================================
// Main Hass Context
// ============================================

export interface HassContext {
  // Core state
  states: Record<string, HassEntity>;
  
  // Service calls
  callService: (
    domain: string, 
    service: string, 
    data?: Record<string, any>,
    target?: ServiceTarget
  ) => Promise<void>;
  
  // Theme support
  themes: Themes;
  selectedTheme?: string | null;
  
  // Locale support
  locale: LocaleData;
  config: HassConfig;
  
  // Entity/Device/Area registries
  entities: Record<string, EntityRegistryEntry>;
  devices: Record<string, DeviceRegistryEntry>;
  areas: Record<string, AreaRegistryEntry>;
  
  // User info
  user?: {
    id: string;
    name: string;
    is_owner: boolean;
    is_admin: boolean;
  };
  
  // Formatters
  formatEntityState: (stateObj: HassEntity, state?: string) => string;
  formatEntityAttributeValue: (stateObj: HassEntity, attribute: string, value?: any) => string;
  formatEntityAttributeName: (stateObj: HassEntity, attribute: string) => string;
  
  // Localization
  localize: (key: string, params?: Record<string, any>) => string;
  
  // Connection status
  connected: boolean;
}
