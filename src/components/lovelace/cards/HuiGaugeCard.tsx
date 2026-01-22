'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { HassContext, HassEntity, ActionConfig } from '@/types/hass';
import { HaCard } from '../components/HaCard';
import { HaGauge, severityColors, type GaugeLevel } from '../components/HaGauge';
import { 
  createActionHandlers, 
  createLongPressHandlers,
  computeEntityName,
  hasAnyAction,
} from '../common/action-handler';

// ============================================
// Gauge Card Config
// ============================================

export interface SeverityConfig {
  green?: number;
  yellow?: number;
  red?: number;
}

export interface GaugeSegment {
  from: number;
  color: string;
  label?: string;
}

export interface GaugeCardConfig {
  type: 'gauge';
  entity: string;
  attribute?: string;
  name?: string;
  unit?: string;
  min?: number;
  max?: number;
  severity?: SeverityConfig;
  segments?: GaugeSegment[];
  needle?: boolean;
  theme?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

// ============================================
// Props
// ============================================

interface Props {
  config: GaugeCardConfig;
  hass: HassContext;
  onMoreInfo?: (entityId: string) => void;
}

// ============================================
// Constants
// ============================================

export const DEFAULT_MIN = 0;
export const DEFAULT_MAX = 100;

// ============================================
// Helper Functions
// ============================================

function computeSeverityColor(
  value: number,
  config: GaugeCardConfig
): string {
  // New segment format
  if (config.segments && config.segments.length > 0) {
    const sortedSegments = [...config.segments].sort((a, b) => a.from - b.from);
    
    for (let i = sortedSegments.length - 1; i >= 0; i--) {
      if (value >= sortedSegments[i].from) {
        return sortedSegments[i].color;
      }
    }
    return sortedSegments[0]?.color || severityColors.normal;
  }
  
  // Old severity format
  const severity = config.severity;
  if (!severity) {
    return severityColors.normal;
  }
  
  const entries = Object.entries(severity) as [keyof SeverityConfig, number | undefined][];
  const validEntries = entries
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => [key, value as number] as const)
    .sort((a, b) => a[1] - b[1]);
  
  if (validEntries.length === 0) {
    return severityColors.normal;
  }
  
  for (let i = validEntries.length - 1; i >= 0; i--) {
    const [colorKey, threshold] = validEntries[i];
    if (value >= threshold) {
      return severityColors[colorKey] || severityColors.normal;
    }
  }
  
  return severityColors.normal;
}

function computeLevels(config: GaugeCardConfig): GaugeLevel[] | undefined {
  // New segment format
  if (config.segments && config.segments.length > 0) {
    return config.segments.map(segment => ({
      level: segment.from,
      stroke: segment.color,
      label: segment.label,
    }));
  }
  
  // Old severity format
  const severity = config.severity;
  if (!severity || !config.needle) {
    return undefined;
  }
  
  const levels: GaugeLevel[] = [];
  
  if (severity.green !== undefined) {
    levels.push({ level: severity.green, stroke: severityColors.green });
  }
  if (severity.yellow !== undefined) {
    levels.push({ level: severity.yellow, stroke: severityColors.yellow });
  }
  if (severity.red !== undefined) {
    levels.push({ level: severity.red, stroke: severityColors.red });
  }
  
  return levels.length > 0 ? levels.sort((a, b) => a.level - b.level) : undefined;
}

// ============================================
// HuiGaugeCard Component
// ============================================

export function HuiGaugeCard({ config, hass, onMoreInfo }: Props) {
  const entityId = config.entity;
  const stateObj = hass.states[entityId];
  
  // Config with defaults
  const minValue = config.min ?? DEFAULT_MIN;
  const maxValue = config.max ?? DEFAULT_MAX;
  
  // Compute values
  const name = useMemo(() => 
    computeEntityName(hass, stateObj, config.name),
    [hass, stateObj, config.name]
  );
  
  // Get the value to display
  const valueToDisplay = useMemo(() => {
    if (!stateObj) return NaN;
    
    if (config.attribute) {
      return Number(stateObj.attributes[config.attribute]);
    }
    return Number(stateObj.state);
  }, [stateObj, config.attribute]);
  
  // Unit
  const unit = useMemo(() => {
    if (config.unit !== undefined) return config.unit;
    return stateObj?.attributes.unit_of_measurement || '';
  }, [config.unit, stateObj]);
  
  // Severity color (for non-needle mode)
  const gaugeColor = useMemo(() => {
    if (config.needle) return undefined;
    if (isNaN(valueToDisplay)) return severityColors.normal;
    return computeSeverityColor(valueToDisplay, config);
  }, [valueToDisplay, config]);
  
  // Levels (for needle mode)
  const levels = useMemo(() => computeLevels(config), [config]);
  
  // Actions
  const cardActions = createActionHandlers({
    hass,
    config: {
      entity: entityId,
      tap_action: config.tap_action || { action: 'more-info' },
      hold_action: config.hold_action,
      double_tap_action: config.double_tap_action,
    },
    onMoreInfo,
  });
  
  const buttonHandlers = createLongPressHandlers({
    onTap: cardActions.handleTap,
    onHold: cardActions.handleHold,
    onDoubleTap: cardActions.hasDoubleTapAction ? cardActions.handleDoubleTap : undefined,
  });
  
  const hasAction = hasAnyAction({
    tap_action: config.tap_action || { action: 'more-info' },
    hold_action: config.hold_action,
    double_tap_action: config.double_tap_action,
  });
  
  // Handle missing entity
  if (!stateObj) {
    return (
      <HaCard className="p-4 h-full flex items-center justify-center">
        <div className="text-center text-[var(--warning-color)]">
          <span className="text-2xl">⚠️</span>
          <div className="text-sm mt-1">{entityId}</div>
        </div>
      </HaCard>
    );
  }
  
  // Handle unavailable state
  if (stateObj.state === 'unavailable') {
    return (
      <HaCard className="p-4 h-full flex items-center justify-center">
        <div className="text-center text-[var(--secondary-text-color)]">
          <span className="text-lg">Unavailable</span>
          <div className="text-sm mt-1">{entityId}</div>
        </div>
      </HaCard>
    );
  }
  
  // Handle non-numeric value
  if (isNaN(valueToDisplay)) {
    return (
      <HaCard className="p-4 h-full flex items-center justify-center">
        <div className="text-center text-[var(--warning-color)]">
          <span className="text-lg">
            {config.attribute 
              ? `Attribute "${config.attribute}" is not numeric` 
              : 'State is not numeric'
            }
          </span>
          <div className="text-sm mt-1">{entityId}</div>
        </div>
      </HaCard>
    );
  }
  
  return (
    <HaCard
      className={cn(
        'h-full flex flex-col items-center justify-center p-4',
        hasAction && 'cursor-pointer'
      )}
      tabIndex={hasAction ? 0 : undefined}
      role={hasAction ? 'button' : undefined}
      {...buttonHandlers}
    >
      <HaGauge
        value={valueToDisplay}
        min={minValue}
        max={maxValue}
        label={unit}
        needle={config.needle}
        levels={levels}
        size="lg"
        className="max-w-[250px] w-full"
      />
      
      <div 
        className="name text-center mt-2 text-[var(--primary-text-color)] font-medium truncate w-full"
        title={name}
      >
        {name}
      </div>
    </HaCard>
  );
}

export default HuiGaugeCard;
