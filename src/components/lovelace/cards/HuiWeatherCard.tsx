'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { HassContext, HassEntity, ActionConfig, WeatherForecast } from '@/types/hass';
import { HaCard } from '../components/HaCard';
import { WeatherIcon } from '../components/HaStateIcon';
import { 
  createActionHandlers, 
  createLongPressHandlers,
  computeEntityName,
} from '../common/action-handler';
import {
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind,
  CloudSun, CloudFog, Droplets, Thermometer,
} from 'lucide-react';

// ============================================
// Weather Card Config
// ============================================

export type ForecastType = 'daily' | 'hourly' | 'twice_daily';

export interface WeatherCardConfig {
  type: 'weather-forecast';
  entity: string;
  name?: string;
  show_current?: boolean;
  show_forecast?: boolean;
  forecast_type?: ForecastType;
  forecast_slots?: number;
  secondary_info_attribute?: string;
  round_temperature?: boolean;
  theme?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

// ============================================
// Props
// ============================================

interface Props {
  config: WeatherCardConfig;
  hass: HassContext;
  onMoreInfo?: (entityId: string) => void;
}

// ============================================
// Weather Condition Icons
// ============================================

const CONDITION_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'clear-night': Sun,
  'cloudy': Cloud,
  'exceptional': Sun,
  'fog': CloudFog,
  'hail': CloudSnow,
  'lightning': CloudLightning,
  'lightning-rainy': CloudLightning,
  'partlycloudy': CloudSun,
  'pouring': CloudRain,
  'rainy': CloudRain,
  'snowy': CloudSnow,
  'snowy-rainy': CloudSnow,
  'sunny': Sun,
  'windy': Wind,
  'windy-variant': Wind,
};

// ============================================
// Helper Functions
// ============================================

function formatTemperature(value: number | undefined, round: boolean = false): string {
  if (value === undefined || value === null) return '--';
  const temp = round ? Math.round(value) : value.toFixed(1);
  return `${temp}°`;
}

function formatTime(dateString: string, hourly: boolean = false): string {
  const date = new Date(dateString);
  
  if (hourly) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

function getConditionIcon(condition: string | undefined) {
  if (!condition) return Sun;
  return CONDITION_ICONS[condition.toLowerCase()] || Sun;
}

// ============================================
// Weather Current Component
// ============================================

interface WeatherCurrentProps {
  stateObj: HassEntity;
  name: string;
  roundTemperature?: boolean;
  secondaryInfo?: string;
}

function WeatherCurrent({ stateObj, name, roundTemperature, secondaryInfo }: WeatherCurrentProps) {
  const temperature = stateObj.attributes.temperature;
  const condition = stateObj.state;
  const humidity = stateObj.attributes.humidity;
  const windSpeed = stateObj.attributes.wind_speed;
  const windBearing = stateObj.attributes.wind_bearing;
  
  const ConditionIcon = getConditionIcon(condition);
  
  // Get secondary info
  const getSecondaryInfoValue = () => {
    if (!secondaryInfo) {
      // Default: humidity or wind
      if (humidity !== undefined) return `${humidity}%`;
      if (windSpeed !== undefined) return `${windSpeed} km/h`;
      return null;
    }
    
    const value = stateObj.attributes[secondaryInfo];
    if (value === undefined) return null;
    
    if (secondaryInfo === 'wind_speed' && windBearing !== undefined) {
      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const index = Math.round(windBearing / 45) % 8;
      return `${value} km/h ${directions[index]}`;
    }
    
    return String(value);
  };
  
  return (
    <div className="flex items-center justify-between p-4">
      {/* Icon */}
      <div className="flex items-center">
        <div className="w-16 h-16 flex items-center justify-center">
          <ConditionIcon size={64} className="text-[var(--state-icon-color)]" />
        </div>
      </div>
      
      {/* Info */}
      <div className="flex-1 px-4">
        <div className="text-xl font-medium text-[var(--primary-text-color)] capitalize">
          {condition?.replace(/-/g, ' ') || 'Unknown'}
        </div>
        <div className="text-sm text-[var(--secondary-text-color)] truncate" title={name}>
          {name}
        </div>
      </div>
      
      {/* Temperature and secondary */}
      <div className="text-right">
        <div className="flex items-baseline justify-end">
          <span className="text-4xl font-light text-[var(--primary-text-color)]">
            {formatTemperature(temperature, roundTemperature)}
          </span>
        </div>
        <div className="text-sm text-[var(--secondary-text-color)] flex items-center justify-end gap-1">
          {secondaryInfo === 'humidity' || (!secondaryInfo && humidity !== undefined) ? (
            <Droplets size={14} />
          ) : secondaryInfo === 'wind_speed' || (!secondaryInfo && windSpeed !== undefined) ? (
            <Wind size={14} />
          ) : null}
          {getSecondaryInfoValue()}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Weather Forecast Component
// ============================================

interface WeatherForecastProps {
  forecast: WeatherForecast[];
  forecastType?: ForecastType;
  roundTemperature?: boolean;
}

function WeatherForecastDisplay({ forecast, forecastType, roundTemperature }: WeatherForecastProps) {
  const isHourly = forecastType === 'hourly';
  const isTwiceDaily = forecastType === 'twice_daily';
  
  return (
    <div className="flex justify-around px-4 pb-4">
      {forecast.map((item, index) => {
        const ConditionIcon = getConditionIcon(item.condition);
        
        return (
          <div key={index} className="text-center min-w-[50px]">
            {/* Date/Time */}
            <div className="text-xs text-[var(--secondary-text-color)] mb-1">
              {isTwiceDaily ? (
                <>
                  {formatTime(item.datetime, false)}
                  <div className="text-[10px]">
                    {item.is_daytime !== false ? 'Day' : 'Night'}
                  </div>
                </>
              ) : (
                formatTime(item.datetime, isHourly)
              )}
            </div>
            
            {/* Icon */}
            <div className="flex justify-center py-2">
              <ConditionIcon size={32} className="text-[var(--state-icon-color)]" />
            </div>
            
            {/* High temp */}
            <div className="text-sm font-medium text-[var(--primary-text-color)]">
              {item.temperature !== undefined 
                ? formatTemperature(item.temperature, roundTemperature)
                : '—'
              }
            </div>
            
            {/* Low temp */}
            {item.templow !== undefined && (
              <div className="text-xs text-[var(--secondary-text-color)]">
                {formatTemperature(item.templow, roundTemperature)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// HuiWeatherCard Component
// ============================================

export function HuiWeatherCard({ config, hass, onMoreInfo }: Props) {
  const entityId = config.entity;
  const stateObj = hass.states[entityId];
  
  // Config defaults
  const showCurrent = config.show_current !== false;
  const showForecast = config.show_forecast !== false;
  const forecastSlots = config.forecast_slots ?? 5;
  
  // Compute values
  const name = useMemo(() => 
    computeEntityName(hass, stateObj, config.name),
    [hass, stateObj, config.name]
  );
  
  // Get forecast data
  const forecast = useMemo(() => {
    if (!stateObj || !showForecast) return [];
    const forecastData = stateObj.attributes.forecast || [];
    return forecastData.slice(0, forecastSlots);
  }, [stateObj, showForecast, forecastSlots]);
  
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
  
  const cardHandlers = createLongPressHandlers({
    onTap: cardActions.handleTap,
    onHold: cardActions.handleHold,
    onDoubleTap: cardActions.hasDoubleTapAction ? cardActions.handleDoubleTap : undefined,
  });
  
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
  
  // Handle unavailable
  if (stateObj.state === 'unavailable') {
    return (
      <HaCard 
        className="h-full flex items-center justify-center p-4 cursor-pointer"
        {...cardHandlers}
      >
        <div className="text-center text-[var(--secondary-text-color)]">
          <span className="text-lg">Unavailable</span>
          <div className="text-sm mt-1">{name}</div>
        </div>
      </HaCard>
    );
  }
  
  return (
    <HaCard 
      className={cn(
        'h-full flex flex-col justify-center',
        cardActions.hasAction && 'cursor-pointer'
      )}
      tabIndex={cardActions.hasAction ? 0 : undefined}
      {...cardHandlers}
    >
      {/* Current weather */}
      {showCurrent && (
        <WeatherCurrent
          stateObj={stateObj}
          name={name}
          roundTemperature={config.round_temperature}
          secondaryInfo={config.secondary_info_attribute}
        />
      )}
      
      {/* Forecast */}
      {showForecast && forecast.length > 0 && (
        <>
          {showCurrent && (
            <div className="border-t border-[var(--divider-color)]" />
          )}
          <WeatherForecastDisplay
            forecast={forecast}
            forecastType={config.forecast_type}
            roundTemperature={config.round_temperature}
          />
        </>
      )}
    </HaCard>
  );
}

export default HuiWeatherCard;
