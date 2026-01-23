// Dashboard Types

export type WidgetType = 
  | 'toggle' 
  | 'slider' 
  | 'sensor' 
  | 'climate' 
  | 'scene' 
  | 'button'
  | 'camera'
  | 'media';

export interface Widget {
  id: string;
  type: WidgetType;
  name: string;
  entityId?: string;
  icon?: string;
  state?: string;
  value?: number;
  unit?: string;
  color?: string;
}

export interface Section {
  id: string;
  title: string;
  icon: string;
  color: string;
  widgets: Widget[];
}

export interface DashboardConfig {
  id: string;
  name: string;
  sections: Section[];
}
