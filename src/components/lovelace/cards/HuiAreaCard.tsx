'use client';

import React, { useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { HassContext, HassEntity, ActionConfig, AreaRegistryEntry } from '@/types/hass';
import { HaCard } from '../components/HaCard';
import { HaStateIcon } from '../components/HaStateIcon';
import { 
  createActionHandlers, 
  createLongPressHandlers,
} from '../common/action-handler';
import { isStateActive, getStateColor } from '@/contexts/ThemeContext';
import {
  Home, Lightbulb, Thermometer, Droplets,
  AlertTriangle, Camera, Power, Lock,
} from 'lucide-react';

// ============================================
// Area Card Config
// ============================================

export type AreaCardDisplayType = 'compact' | 'icon' | 'picture' | 'camera';

export interface AreaCardConfig {
  type: 'area';
  area?: string;
  name?: string;
  color?: string;
  navigation_path?: string;
  display_type?: AreaCardDisplayType;
  show_camera?: boolean;
  camera_view?: string;
  aspect_ratio?: string;
  sensor_classes?: string[];
  alert_classes?: string[];
  features?: any[];
  features_position?: 'bottom' | 'inline';
  exclude_entities?: string[];
}

// ============================================
// Props
// ============================================

interface Props {
  config: AreaCardConfig;
  hass: HassContext;
  onMoreInfo?: (entityId: string) => void;
  onNavigate?: (path: string) => void;
}

// ============================================
// Default Sensor Classes
// ============================================

const DEFAULT_SENSOR_CLASSES = [
  'temperature',
  'humidity',
];

const DEFAULT_ALERT_CLASSES = [
  'motion',
  'door',
  'window',
  'moisture',
  'smoke',
  'gas',
  'problem',
  'battery',
];

// ============================================
// Sensor Icon Mapping
// ============================================

const SENSOR_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  temperature: Thermometer,
  humidity: Droplets,
  motion: AlertTriangle,
  door: Lock,
  window: Home,
  moisture: Droplets,
  smoke: AlertTriangle,
  gas: AlertTriangle,
  problem: AlertTriangle,
  battery: Power,
};

// ============================================
// Helper Functions
// ============================================

function getEntitiesForArea(
  hass: HassContext,
  areaId: string,
  excludeEntities: string[] = []
): HassEntity[] {
  const entities: HassEntity[] = [];
  
  // Get entities from entity registry that belong to this area
  Object.entries(hass.states).forEach(([entityId, entity]) => {
    if (excludeEntities.includes(entityId)) return;
    
    const entityEntry = hass.entities?.[entityId];
    if (entityEntry?.area_id === areaId) {
      entities.push(entity);
    }
    
    // Also check device area
    if (entityEntry?.device_id) {
      const device = hass.devices?.[entityEntry.device_id];
      if (device?.area_id === areaId) {
        entities.push(entity);
      }
    }
  });
  
  return entities;
}

function getLightEntities(entities: HassEntity[]): HassEntity[] {
  return entities.filter(e => e.entity_id.startsWith('light.'));
}

function getSwitchEntities(entities: HassEntity[]): HassEntity[] {
  return entities.filter(e => 
    e.entity_id.startsWith('switch.') || 
    e.entity_id.startsWith('input_boolean.')
  );
}

function getSensorEntities(entities: HassEntity[], sensorClasses: string[]): HassEntity[] {
  return entities.filter(e => {
    if (!e.entity_id.startsWith('sensor.')) return false;
    const deviceClass = e.attributes.device_class;
    return sensorClasses.includes(deviceClass || '');
  });
}

function getAlertEntities(entities: HassEntity[], alertClasses: string[]): HassEntity[] {
  return entities.filter(e => {
    if (!e.entity_id.startsWith('binary_sensor.')) return false;
    const deviceClass = e.attributes.device_class;
    return alertClasses.includes(deviceClass || '');
  });
}

// ============================================
// Area Summary Component
// ============================================

interface AreaSummaryProps {
  lights: HassEntity[];
  switches: HassEntity[];
  sensors: HassEntity[];
  alerts: HassEntity[];
  color?: string;
}

function AreaSummary({ lights, switches, sensors, alerts, color }: AreaSummaryProps) {
  const lightsOn = lights.filter(e => e.state === 'on').length;
  const switchesOn = switches.filter(e => e.state === 'on').length;
  const activeAlerts = alerts.filter(e => e.state === 'on');
  
  return (
    <div className="flex flex-wrap gap-3 text-sm">
      {/* Lights */}
      {lights.length > 0 && (
        <div className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-full',
          lightsOn > 0 
            ? 'bg-[var(--state-light-active-color)]/20 text-[var(--state-light-active-color)]'
            : 'bg-[var(--state-inactive-color)]/10 text-[var(--secondary-text-color)]'
        )}>
          <Lightbulb size={14} />
          <span>{lightsOn}/{lights.length}</span>
        </div>
      )}
      
      {/* Switches */}
      {switches.length > 0 && (
        <div className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-full',
          switchesOn > 0 
            ? 'bg-[var(--state-switch-active-color)]/20 text-[var(--state-switch-active-color)]'
            : 'bg-[var(--state-inactive-color)]/10 text-[var(--secondary-text-color)]'
        )}>
          <Power size={14} />
          <span>{switchesOn}/{switches.length}</span>
        </div>
      )}
      
      {/* Sensors */}
      {sensors.map((sensor, idx) => {
        const deviceClass = sensor.attributes.device_class || 'sensor';
        const Icon = SENSOR_ICONS[deviceClass] || Thermometer;
        const unit = sensor.attributes.unit_of_measurement || '';
        
        return (
          <div 
            key={idx}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--state-inactive-color)]/10 text-[var(--secondary-text-color)]"
          >
            <Icon size={14} />
            <span>{sensor.state}{unit}</span>
          </div>
        );
      })}
      
      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--warning-color)]/20 text-[var(--warning-color)]">
          <AlertTriangle size={14} />
          <span>{activeAlerts.length} alert{activeAlerts.length > 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// HuiAreaCard Component
// ============================================

export function HuiAreaCard({ config, hass, onMoreInfo, onNavigate }: Props) {
  const areaId = config.area;
  
  // Get area info
  const area = useMemo(() => {
    if (!areaId || !hass.areas) return null;
    return hass.areas[areaId];
  }, [areaId, hass.areas]);
  
  const name = config.name || area?.name || 'Unknown Area';
  const displayType = config.display_type || 'compact';
  const sensorClasses = config.sensor_classes || DEFAULT_SENSOR_CLASSES;
  const alertClasses = config.alert_classes || DEFAULT_ALERT_CLASSES;
  
  // Get entities for this area
  const areaEntities = useMemo(() => {
    if (!areaId) return [];
    return getEntitiesForArea(hass, areaId, config.exclude_entities);
  }, [hass, areaId, config.exclude_entities]);
  
  // Categorize entities
  const lights = useMemo(() => getLightEntities(areaEntities), [areaEntities]);
  const switches = useMemo(() => getSwitchEntities(areaEntities), [areaEntities]);
  const sensors = useMemo(() => getSensorEntities(areaEntities, sensorClasses), [areaEntities, sensorClasses]);
  const alerts = useMemo(() => getAlertEntities(areaEntities, alertClasses), [areaEntities, alertClasses]);
  
  // Color
  const areaColor = config.color || 'var(--primary-color)';
  
  // Any active entities?
  const hasActiveEntities = useMemo(() => {
    return lights.some(e => e.state === 'on') || 
           switches.some(e => e.state === 'on') ||
           alerts.some(e => e.state === 'on');
  }, [lights, switches, alerts]);
  
  // Actions
  const handleTap = useCallback(() => {
    if (config.navigation_path) {
      onNavigate?.(config.navigation_path);
    }
  }, [config.navigation_path, onNavigate]);
  
  const cardHandlers = createLongPressHandlers({
    onTap: handleTap,
  });
  
  // Area picture
  const pictureUrl = area?.picture;
  
  // Handle missing area
  if (!areaId) {
    return (
      <HaCard className="p-4 h-full">
        <div className="flex items-center gap-3 text-[var(--warning-color)]">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-medium">Area not specified</div>
            <div className="text-sm opacity-75">Configure an area in card settings</div>
          </div>
        </div>
      </HaCard>
    );
  }
  
  // Compact display
  if (displayType === 'compact') {
    return (
      <HaCard 
        className={cn(
          'h-full p-4 cursor-pointer transition-all',
          'hover:shadow-lg'
        )}
        {...cardHandlers}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: hasActiveEntities ? `${areaColor}20` : 'var(--state-inactive-color)/10',
                color: hasActiveEntities ? areaColor : 'var(--secondary-text-color)',
              }}
            >
              <Home size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[var(--primary-text-color)] truncate">
                {name}
              </div>
              <div className="text-xs text-[var(--secondary-text-color)]">
                {areaEntities.length} entities
              </div>
            </div>
          </div>
          
          {/* Summary */}
          <AreaSummary
            lights={lights}
            switches={switches}
            sensors={sensors}
            alerts={alerts}
            color={areaColor}
          />
        </div>
      </HaCard>
    );
  }
  
  // Picture display
  if ((displayType === 'picture' || displayType === 'camera') && pictureUrl) {
    return (
      <HaCard 
        className={cn(
          'h-full overflow-hidden cursor-pointer transition-all',
          'hover:shadow-lg'
        )}
        style={{
          aspectRatio: config.aspect_ratio || '16/9',
        }}
        {...cardHandlers}
      >
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${pictureUrl})` }}
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <div className="font-medium text-white text-lg">{name}</div>
          <div className="mt-2">
            <AreaSummary
              lights={lights}
              switches={switches}
              sensors={sensors}
              alerts={alerts}
              color={areaColor}
            />
          </div>
        </div>
      </HaCard>
    );
  }
  
  // Icon display (default fallback)
  return (
    <HaCard 
      className={cn(
        'h-full p-6 cursor-pointer transition-all',
        'hover:shadow-lg flex flex-col items-center justify-center text-center'
      )}
      {...cardHandlers}
    >
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ 
          backgroundColor: hasActiveEntities ? `${areaColor}20` : 'var(--state-inactive-color)/10',
          color: hasActiveEntities ? areaColor : 'var(--secondary-text-color)',
        }}
      >
        <Home size={32} />
      </div>
      
      <div className="font-medium text-[var(--primary-text-color)] text-lg mb-2">
        {name}
      </div>
      
      <AreaSummary
        lights={lights}
        switches={switches}
        sensors={sensors}
        alerts={alerts}
        color={areaColor}
      />
    </HaCard>
  );
}

export default HuiAreaCard;
