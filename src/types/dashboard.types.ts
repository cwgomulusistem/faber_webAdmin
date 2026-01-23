// Dashboard Types for Server-Driven UI - Web Frontend
// These types match the backend Go structures

// ==================== WIDGET TYPES ====================

export type WidgetType =
  | 'SWITCH'
  | 'DIMMER'
  | 'THERMOSTAT'
  | 'SENSOR'
  | 'WEATHER'
  | 'SCENE'
  | 'CAMERA'
  | 'BUTTON'
  | 'TILE'
  | 'GAUGE'
  | 'AREA';

// ==================== LAYOUT STRUCTURES ====================

export interface WebLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MobileLayout {
  order: number;
  visible: boolean;
}

export interface WidgetLayout {
  web: WebLayout;
  mobile: MobileLayout;
}

// ==================== WIDGET CONFIG ====================

export interface BaseWidgetConfig {
  name?: string;
  icon?: string;
}

export interface SwitchWidgetConfig extends BaseWidgetConfig {
  showState?: boolean;
}

export interface ThermostatWidgetConfig extends BaseWidgetConfig {
  showCurrentTemp?: boolean;
  showTargetTemp?: boolean;
}

export interface SensorWidgetConfig extends BaseWidgetConfig {
  unit?: string;
  precision?: number;
}

export type WidgetConfig = BaseWidgetConfig | SwitchWidgetConfig | ThermostatWidgetConfig | SensorWidgetConfig;

// ==================== ENTITY DATA ====================

export interface DeviceEntityData {
  id: string;
  name: string;
  type: string;
  isOnline: boolean;
  attributes: Record<string, any>;
}

export interface SceneEntityData {
  id: string;
  name: string;
  icon?: string;
}

export type EntityData = DeviceEntityData | SceneEntityData | null;

// ==================== DASHBOARD WIDGET ====================

export interface DashboardWidget {
  id: string;
  dashboardId: string;
  type: WidgetType;
  entityId?: string;
  entityType: 'device' | 'scene' | 'sensor';
  config: WidgetConfig;
  layout: WidgetLayout;
  entityData?: EntityData;
  createdAt: string;
  updatedAt: string;
}

// ==================== DASHBOARD LAYOUT ====================

export interface DashboardLayout {
  id: string;
  name: string;
  homeId: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
}

// ==================== API INPUTS ====================

export interface CreateWidgetInput {
  dashboardId: string;
  type: WidgetType;
  entityId?: string;
  entityType?: string;
  config?: WidgetConfig;
  layout: WidgetLayout;
}

export interface UpdateWidgetInput {
  config?: WidgetConfig;
  layout?: WidgetLayout;
}

export interface UpdateWidgetLayoutInput {
  widgetId: string;
  layout: WidgetLayout;
}

export interface BatchUpdateLayoutInput {
  widgets: UpdateWidgetLayoutInput[];
}

// ==================== API RESPONSE ====================

export interface DashboardResponse {
  success: boolean;
  data: DashboardLayout;
}

export interface WidgetResponse {
  success: boolean;
  data: DashboardWidget;
}

// ==================== WIDGET PALETTE ====================

export interface WidgetPaletteItem {
  type: WidgetType;
  name: string;
  icon: string;
  description: string;
  defaultSize: { w: number; h: number };
}

export const WIDGET_PALETTE: WidgetPaletteItem[] = [
  { type: 'SWITCH', name: 'Anahtar', icon: '💡', description: 'Açma/Kapama kontrolü', defaultSize: { w: 2, h: 2 } },
  { type: 'DIMMER', name: 'Dimmer', icon: '🔆', description: 'Parlaklık ayarı', defaultSize: { w: 2, h: 2 } },
  { type: 'THERMOSTAT', name: 'Termostat', icon: '🌡️', description: 'Sıcaklık kontrolü', defaultSize: { w: 3, h: 3 } },
  { type: 'SENSOR', name: 'Sensör', icon: '📊', description: 'Sensör değeri', defaultSize: { w: 2, h: 2 } },
  { type: 'SCENE', name: 'Senaryo', icon: '🎬', description: 'Otomasyon senaryosu', defaultSize: { w: 2, h: 1 } },
  { type: 'GAUGE', name: 'Gösterge', icon: '🎯', description: 'Yüzde göstergesi', defaultSize: { w: 2, h: 2 } },
  { type: 'WEATHER', name: 'Hava Durumu', icon: '☀️', description: 'Hava durumu bilgisi', defaultSize: { w: 3, h: 2 } },
];
