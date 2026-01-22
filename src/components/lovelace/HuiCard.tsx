'use client';

import React from 'react';
import type { HassContext } from '@/types/hass';

// ============================================
// Import All Card Components
// ============================================

// Basic Cards
import { HuiButtonCard, type ButtonCardConfig } from './cards/HuiButtonCard';
import { HuiLightCard, type LightCardConfig } from './cards/HuiLightCard';
import { HuiGaugeCard, type GaugeCardConfig } from './cards/HuiGaugeCard';

// Modern Cards
import { HuiTileCard, type TileCardConfig } from './cards/HuiTileCard';
import { HuiThermostatCard, type ThermostatCardConfig } from './cards/HuiThermostatCard';
import { HuiWeatherCard, type WeatherCardConfig } from './cards/HuiWeatherCard';
import { HuiAreaCard, type AreaCardConfig } from './cards/HuiAreaCard';

// Base Card Component
import { HaCard } from './components/HaCard';
import { HaStateIcon } from './components/HaStateIcon';

// ============================================
// Card Config Types
// ============================================

export interface EntitiesCardConfig {
  type: 'entities';
  title?: string;
  entities: Array<string | { entity: string; name?: string; icon?: string }>;
  show_header_toggle?: boolean;
  state_color?: boolean;
}

export interface GlanceCardConfig {
  type: 'glance';
  title?: string;
  entities: Array<string | { entity: string; name?: string; icon?: string }>;
  columns?: number;
  show_name?: boolean;
  show_state?: boolean;
  show_icon?: boolean;
  state_color?: boolean;
}

export interface SensorCardConfig {
  type: 'sensor';
  entity: string;
  name?: string;
  icon?: string;
  graph?: 'line' | 'none';
  unit?: string;
  detail?: number;
  hours_to_show?: number;
}

export interface StatisticCardConfig {
  type: 'statistic';
  entity: string;
  name?: string;
  period?: { start?: string; end?: string };
  stat_type?: 'mean' | 'min' | 'max' | 'state' | 'sum' | 'change';
  unit?: string;
}

export interface GridCardConfig {
  type: 'grid';
  cards: LovelaceCardConfig[];
  columns?: number;
  square?: boolean;
}

export interface StackCardConfig {
  type: 'vertical-stack' | 'horizontal-stack';
  cards: LovelaceCardConfig[];
}

// Union of all card configs
export type LovelaceCardConfig = 
  | TileCardConfig
  | ButtonCardConfig
  | LightCardConfig
  | GaugeCardConfig
  | ThermostatCardConfig
  | WeatherCardConfig
  | AreaCardConfig
  | EntitiesCardConfig
  | GlanceCardConfig
  | SensorCardConfig
  | StatisticCardConfig
  | GridCardConfig
  | StackCardConfig
  | { type: string; [key: string]: any }; // Generic fallback

// ============================================
// Props
// ============================================

interface Props {
  config: LovelaceCardConfig;
  hass: HassContext;
  onMoreInfo?: (entityId: string) => void;
}

// ============================================
// Entities Card Component
// ============================================

function EntitiesCard({ config, hass }: { config: EntitiesCardConfig; hass: HassContext }) {
  const entities = config.entities.map(e => 
    typeof e === 'string' ? { entity: e } : e
  );
  
  return (
    <HaCard className="h-full">
      {config.title && (
        <div className="px-4 py-3 font-medium text-[var(--primary-text-color)]">
          {config.title}
        </div>
      )}
      <div className="divide-y divide-[var(--divider-color)]">
        {entities.map((entityConfig, idx) => {
          const stateObj = hass.states[entityConfig.entity];
          if (!stateObj) {
            return (
              <div key={idx} className="px-4 py-3 text-[var(--warning-color)]">
                {entityConfig.entity} not found
              </div>
            );
          }
          
          return (
            <div key={idx} className="flex items-center px-4 py-3 gap-3">
              <HaStateIcon stateObj={stateObj} size="md" stateColor={config.state_color} />
              <div className="flex-1 min-w-0">
                <div className="text-[var(--primary-text-color)] truncate">
                  {entityConfig.name || stateObj.attributes.friendly_name || entityConfig.entity}
                </div>
              </div>
              <div className="text-[var(--secondary-text-color)]">
                {hass.formatEntityState(stateObj)}
              </div>
            </div>
          );
        })}
      </div>
    </HaCard>
  );
}

// ============================================
// Glance Card Component
// ============================================

function GlanceCard({ config, hass }: { config: GlanceCardConfig; hass: HassContext }) {
  const entities = config.entities.map(e => 
    typeof e === 'string' ? { entity: e } : e
  );
  
  const columns = config.columns || Math.min(entities.length, 5);
  const showName = config.show_name !== false;
  const showState = config.show_state !== false;
  const showIcon = config.show_icon !== false;
  
  return (
    <HaCard className="h-full">
      {config.title && (
        <div className="px-4 py-3 font-medium text-[var(--primary-text-color)]">
          {config.title}
        </div>
      )}
      <div 
        className="grid p-4 gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {entities.map((entityConfig, idx) => {
          const stateObj = hass.states[entityConfig.entity];
          
          return (
            <div key={idx} className="flex flex-col items-center text-center">
              {showIcon && (
                <div className="mb-1">
                  {stateObj ? (
                    <HaStateIcon stateObj={stateObj} size="lg" stateColor={config.state_color} />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--state-inactive-color)]/20" />
                  )}
                </div>
              )}
              {showName && (
                <div className="text-xs text-[var(--primary-text-color)] truncate w-full">
                  {entityConfig.name || stateObj?.attributes.friendly_name || entityConfig.entity}
                </div>
              )}
              {showState && stateObj && (
                <div className="text-xs text-[var(--secondary-text-color)]">
                  {hass.formatEntityState(stateObj)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </HaCard>
  );
}

// ============================================
// Sensor Card Component
// ============================================

function SensorCard({ config, hass }: { config: SensorCardConfig; hass: HassContext }) {
  const stateObj = hass.states[config.entity];
  
  if (!stateObj) {
    return (
      <HaCard className="p-4 h-full">
        <div className="text-[var(--warning-color)]">
          Entity not found: {config.entity}
        </div>
      </HaCard>
    );
  }
  
  const name = config.name || stateObj.attributes.friendly_name || config.entity;
  const unit = config.unit || stateObj.attributes.unit_of_measurement || '';
  
  return (
    <HaCard className="h-full p-4 flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-2">
        <HaStateIcon stateObj={stateObj} size="lg" stateColor />
        <span className="font-medium text-[var(--primary-text-color)]">{name}</span>
      </div>
      <div className="text-3xl font-light text-[var(--primary-text-color)]">
        {stateObj.state} <span className="text-lg">{unit}</span>
      </div>
    </HaCard>
  );
}

// ============================================
// Statistic Card Component
// ============================================

function StatisticCard({ config, hass }: { config: StatisticCardConfig; hass: HassContext }) {
  const stateObj = hass.states[config.entity];
  
  if (!stateObj) {
    return (
      <HaCard className="p-4 h-full">
        <div className="text-[var(--warning-color)]">
          Entity not found: {config.entity}
        </div>
      </HaCard>
    );
  }
  
  const name = config.name || stateObj.attributes.friendly_name || config.entity;
  const unit = config.unit || stateObj.attributes.unit_of_measurement || '';
  const statType = config.stat_type || 'state';
  
  return (
    <HaCard className="h-full p-4 flex flex-col justify-center text-center">
      <div className="text-sm text-[var(--secondary-text-color)] uppercase tracking-wide mb-1">
        {name}
      </div>
      <div className="text-3xl font-light text-[var(--primary-text-color)]">
        {stateObj.state} <span className="text-lg">{unit}</span>
      </div>
      <div className="text-xs text-[var(--secondary-text-color)] mt-1">
        {statType}
      </div>
    </HaCard>
  );
}

// ============================================
// Grid Card Component
// ============================================

function GridCard({ config, hass, onMoreInfo }: { config: GridCardConfig; hass: HassContext; onMoreInfo?: (entityId: string) => void }) {
  const columns = config.columns || 2;
  
  return (
    <div 
      className="grid gap-4 h-full"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {config.cards.map((cardConfig, idx) => (
        <div key={idx} className={config.square ? 'aspect-square' : ''}>
          <HuiCard config={cardConfig} hass={hass} onMoreInfo={onMoreInfo} />
        </div>
      ))}
    </div>
  );
}

// ============================================
// Stack Card Components
// ============================================

function VerticalStackCard({ config, hass, onMoreInfo }: { config: StackCardConfig; hass: HassContext; onMoreInfo?: (entityId: string) => void }) {
  return (
    <div className="flex flex-col gap-4 h-full">
      {config.cards.map((cardConfig, idx) => (
        <div key={idx}>
          <HuiCard config={cardConfig} hass={hass} onMoreInfo={onMoreInfo} />
        </div>
      ))}
    </div>
  );
}

function HorizontalStackCard({ config, hass, onMoreInfo }: { config: StackCardConfig; hass: HassContext; onMoreInfo?: (entityId: string) => void }) {
  return (
    <div className="flex gap-4 h-full">
      {config.cards.map((cardConfig, idx) => (
        <div key={idx} className="flex-1">
          <HuiCard config={cardConfig} hass={hass} onMoreInfo={onMoreInfo} />
        </div>
      ))}
    </div>
  );
}

// ============================================
// Unknown Card Component
// ============================================

function UnknownCard({ config }: { config: LovelaceCardConfig }) {
  return (
    <HaCard className="p-4 h-full">
      <div className="text-[var(--error-color)]">
        <div className="font-medium">Unknown card type</div>
        <div className="text-sm opacity-75">{config.type}</div>
      </div>
    </HaCard>
  );
}

// ============================================
// Main Card Router
// ============================================

export function HuiCard({ config, hass, onMoreInfo }: Props) {
  // Strip custom: prefix
  const type = config.type?.replace('custom:', '');
  
  switch (type) {
    // Modern Cards
    case 'tile':
      return <HuiTileCard config={config as TileCardConfig} hass={hass} onMoreInfo={onMoreInfo} />;
    
    case 'thermostat':
      return <HuiThermostatCard config={config as ThermostatCardConfig} hass={hass} onMoreInfo={onMoreInfo} />;
    
    case 'weather-forecast':
      return <HuiWeatherCard config={config as WeatherCardConfig} hass={hass} onMoreInfo={onMoreInfo} />;
    
    case 'area':
      return <HuiAreaCard config={config as AreaCardConfig} hass={hass} onMoreInfo={onMoreInfo} />;
    
    // Basic Cards
    case 'button':
      return <HuiButtonCard config={config as ButtonCardConfig} hass={hass} onMoreInfo={onMoreInfo} />;
    
    case 'light':
      return <HuiLightCard config={config as LightCardConfig} hass={hass} onMoreInfo={onMoreInfo} />;
    
    case 'gauge':
      return <HuiGaugeCard config={config as GaugeCardConfig} hass={hass} onMoreInfo={onMoreInfo} />;
    
    // Simple Cards (inline implementation)
    case 'entities':
      return <EntitiesCard config={config as EntitiesCardConfig} hass={hass} />;
    
    case 'glance':
      return <GlanceCard config={config as GlanceCardConfig} hass={hass} />;
    
    case 'sensor':
      return <SensorCard config={config as SensorCardConfig} hass={hass} />;
    
    case 'statistic':
      return <StatisticCard config={config as StatisticCardConfig} hass={hass} />;
    
    // Layout Cards
    case 'grid':
      return <GridCard config={config as GridCardConfig} hass={hass} onMoreInfo={onMoreInfo} />;
    
    case 'vertical-stack':
      return <VerticalStackCard config={config as StackCardConfig} hass={hass} onMoreInfo={onMoreInfo} />;
    
    case 'horizontal-stack':
      return <HorizontalStackCard config={config as StackCardConfig} hass={hass} onMoreInfo={onMoreInfo} />;
    
    // Unknown card type
    default:
      return <UnknownCard config={config} />;
  }
}

export default HuiCard;
