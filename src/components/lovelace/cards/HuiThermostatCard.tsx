'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import type { HassContext, HassEntity, ActionConfig } from '@/types/hass';
import { HaCard } from '../components/HaCard';
import { ClimateIcon } from '../components/HaStateIcon';
import { HaRoundSlider } from '../components/HaSlider';
import { computeEntityName } from '../common/action-handler';
import { getStateColor } from '@/contexts/ThemeContext';
import { MoreVertical, Thermometer, Droplets, Wind } from 'lucide-react';

// ============================================
// Thermostat Card Config
// ============================================

export interface ThermostatCardConfig {
  type: 'thermostat';
  entity: string;
  name?: string;
  theme?: string;
  show_current_as_primary?: boolean;
  features?: any[];
}

// ============================================
// Props
// ============================================

interface Props {
  config: ThermostatCardConfig;
  hass: HassContext;
  onMoreInfo?: (entityId: string) => void;
}

// ============================================
// HVAC Modes and Colors
// ============================================

const HVAC_MODE_COLORS: Record<string, string> = {
  heat: 'var(--state-climate-heat-color, #ff9800)',
  cool: 'var(--state-climate-cool-color, #2196f3)',
  heat_cool: 'var(--state-climate-auto-color, #4caf50)',
  auto: 'var(--state-climate-auto-color, #4caf50)',
  dry: 'var(--info-color, #039be5)',
  fan_only: 'var(--state-icon-color, #44739e)',
  off: 'var(--state-inactive-color, #969696)',
};

const HVAC_ACTION_TO_MODE: Record<string, string> = {
  heating: 'heat',
  cooling: 'cool',
  idle: 'off',
  drying: 'dry',
  fan: 'fan_only',
};

// ============================================
// Helper Functions
// ============================================

function getClimateColor(stateObj: HassEntity): string {
  const hvacAction = stateObj.attributes.hvac_action;
  
  if (hvacAction && HVAC_ACTION_TO_MODE[hvacAction]) {
    return HVAC_MODE_COLORS[HVAC_ACTION_TO_MODE[hvacAction]] || HVAC_MODE_COLORS.off;
  }
  
  const state = stateObj.state;
  return HVAC_MODE_COLORS[state] || HVAC_MODE_COLORS.off;
}

function formatTemperature(value: number | undefined, unit: string = '°'): string {
  if (value === undefined || value === null) return '--';
  return `${Math.round(value)}${unit}`;
}

// ============================================
// Temperature Control Component
// ============================================

interface TemperatureControlProps {
  stateObj: HassEntity;
  hass: HassContext;
  showCurrentAsPrimary?: boolean;
  color: string;
}

function TemperatureControl({ stateObj, hass, showCurrentAsPrimary, color }: TemperatureControlProps) {
  const [tempValue, setTempValue] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const currentTemp = stateObj.attributes.current_temperature;
  const targetTemp = stateObj.attributes.temperature;
  const minTemp = stateObj.attributes.min_temp || 7;
  const maxTemp = stateObj.attributes.max_temp || 35;
  
  const displayTarget = tempValue ?? targetTemp ?? minTemp;
  
  const handleChange = useCallback((value: number) => {
    setTempValue(value);
    setIsDragging(true);
  }, []);
  
  const handleChangeEnd = useCallback(async (value: number) => {
    setIsDragging(false);
    setTempValue(null);
    
    await hass.callService('climate', 'set_temperature', {
      entity_id: stateObj.entity_id,
      temperature: value,
    });
  }, [hass, stateObj.entity_id]);
  
  // Primary and secondary values based on config
  const primaryValue = showCurrentAsPrimary ? currentTemp : displayTarget;
  const secondaryValue = showCurrentAsPrimary ? displayTarget : currentTemp;
  const primaryLabel = showCurrentAsPrimary ? 'Current' : 'Target';
  const secondaryLabel = showCurrentAsPrimary ? 'Target' : 'Current';
  
  return (
    <div className="relative flex items-center justify-center">
      <HaRoundSlider
        value={displayTarget}
        min={minTemp}
        max={maxTemp}
        step={0.5}
        disabled={stateObj.state === 'unavailable' || stateObj.state === 'off'}
        onChange={handleChange}
        onChangeEnd={handleChangeEnd}
        color={color}
        size={220}
        strokeWidth={24}
      />
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <ClimateIcon hvacAction={stateObj.attributes.hvac_action} size={32} />
        
        <div className="mt-2 text-center">
          {/* Primary temperature */}
          <div className="flex items-baseline justify-center">
            <span 
              className="text-4xl font-light"
              style={{ color: 'var(--primary-text-color)' }}
            >
              {formatTemperature(primaryValue, '')}
            </span>
            <span 
              className="text-xl"
              style={{ color: 'var(--secondary-text-color)' }}
            >
              °
            </span>
          </div>
          
          <div className="text-xs text-[var(--secondary-text-color)]">
            {primaryLabel}
          </div>
        </div>
        
        {/* Secondary temperature */}
        {secondaryValue !== undefined && (
          <div className="mt-1 text-center">
            <span className="text-sm text-[var(--secondary-text-color)]">
              {secondaryLabel}: {formatTemperature(secondaryValue)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// HuiThermostatCard Component
// ============================================

export function HuiThermostatCard({ config, hass, onMoreInfo }: Props) {
  const entityId = config.entity;
  const stateObj = hass.states[entityId];
  
  // Compute values
  const name = useMemo(() => 
    computeEntityName(hass, stateObj, config.name),
    [hass, stateObj, config.name]
  );
  
  const climateColor = useMemo(() => {
    if (!stateObj) return HVAC_MODE_COLORS.off;
    return getClimateColor(stateObj);
  }, [stateObj]);
  
  // More info handler
  const handleMoreInfo = useCallback(() => {
    onMoreInfo?.(entityId);
  }, [onMoreInfo, entityId]);
  
  // Handle missing entity
  if (!stateObj) {
    return (
      <HaCard className="p-4 h-full">
        <div className="flex items-center gap-3 text-[var(--warning-color)]">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-medium">Entity not found</div>
            <div className="text-sm opacity-75">{entityId}</div>
          </div>
        </div>
      </HaCard>
    );
  }
  
  const domain = entityId.split('.')[0];
  if (!['climate', 'water_heater'].includes(domain)) {
    return (
      <HaCard className="p-4 h-full">
        <div className="flex items-center gap-3 text-[var(--error-color)]">
          <span className="text-2xl">❌</span>
          <div>
            <div className="font-medium">Invalid entity</div>
            <div className="text-sm opacity-75">Must be climate or water_heater domain</div>
          </div>
        </div>
      </HaCard>
    );
  }
  
  const humidity = stateObj.attributes.current_humidity;
  const hvacAction = stateObj.attributes.hvac_action;
  
  return (
    <HaCard className="relative h-full flex flex-col">
      {/* Title */}
      <div className="px-4 pt-3 pb-2 text-center">
        <p className="text-lg font-medium text-[var(--primary-text-color)] truncate">
          {name}
        </p>
      </div>
      
      {/* More Info Button */}
      <button
        className={cn(
          'absolute top-2 right-2 z-10 p-2 rounded-full',
          'text-[var(--secondary-text-color)]',
          'hover:bg-[var(--divider-color)] transition-colors'
        )}
        onClick={handleMoreInfo}
        aria-label="More info"
      >
        <MoreVertical size={20} />
      </button>
      
      {/* Temperature Control */}
      <div className="flex-1 flex items-center justify-center px-4 pb-4">
        <TemperatureControl
          stateObj={stateObj}
          hass={hass}
          showCurrentAsPrimary={config.show_current_as_primary}
          color={climateColor}
        />
      </div>
      
      {/* Status Bar */}
      <div className="px-4 pb-3 flex items-center justify-center gap-4 text-sm text-[var(--secondary-text-color)]">
        {/* HVAC Action */}
        {hvacAction && (
          <div className="flex items-center gap-1">
            <Wind size={14} />
            <span className="capitalize">{hvacAction}</span>
          </div>
        )}
        
        {/* Humidity */}
        {humidity !== undefined && (
          <div className="flex items-center gap-1">
            <Droplets size={14} />
            <span>{humidity}%</span>
          </div>
        )}
        
        {/* Mode */}
        <div className="flex items-center gap-1">
          <Thermometer size={14} />
          <span className="capitalize">{stateObj.state}</span>
        </div>
      </div>
      
      {/* Features placeholder */}
      {config.features && config.features.length > 0 && (
        <div 
          className="px-3 pb-3"
          style={{ '--feature-color': climateColor } as React.CSSProperties}
        >
          {/* Card features would go here */}
        </div>
      )}
    </HaCard>
  );
}

export default HuiThermostatCard;
