'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import type { HassContext, HassEntity, ActionConfig } from '@/types/hass';
import { HaCard } from '../components/HaCard';
import { HaStateIcon, LightIcon } from '../components/HaStateIcon';
import { HaRoundSlider } from '../components/HaSlider';
import { 
  createActionHandlers, 
  createLongPressHandlers,
  computeEntityName,
} from '../common/action-handler';
import { isStateActive } from '@/contexts/ThemeContext';
import { MoreVertical } from 'lucide-react';

// ============================================
// Light Card Config
// ============================================

export interface LightCardConfig {
  type: 'light';
  entity: string;
  name?: string;
  icon?: string;
  theme?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

// ============================================
// Props
// ============================================

interface Props {
  config: LightCardConfig;
  hass: HassContext;
  onMoreInfo?: (entityId: string) => void;
}

// ============================================
// Helper Functions
// ============================================

function computeBrightnessColor(stateObj: HassEntity): string | undefined {
  if (stateObj.state === 'off' || !stateObj.attributes.brightness) {
    return undefined;
  }
  
  const brightness = stateObj.attributes.brightness;
  const percentage = Math.round((brightness / 255) * 100);
  return `brightness(${0.5 + (percentage / 200)})`;
}

function computeLightColor(stateObj: HassEntity): string {
  if (stateObj.state === 'off') {
    return 'var(--state-inactive-color)';
  }
  
  const rgbColor = stateObj.attributes.rgb_color;
  if (rgbColor) {
    return `rgb(${rgbColor.join(',')})`;
  }
  
  return 'var(--state-light-active-color)';
}

function supportsBrightness(stateObj: HassEntity): boolean {
  const supportedFeatures = stateObj.attributes.supported_features || 0;
  // SUPPORT_BRIGHTNESS = 1
  return (supportedFeatures & 1) !== 0 || stateObj.attributes.brightness !== undefined;
}

// ============================================
// HuiLightCard Component
// ============================================

export function HuiLightCard({ config, hass, onMoreInfo }: Props) {
  const entityId = config.entity;
  const stateObj = hass.states[entityId];
  const [showingBrightness, setShowingBrightness] = useState(false);
  const [tempBrightness, setTempBrightness] = useState<number | null>(null);
  
  // Compute values
  const name = useMemo(() => 
    computeEntityName(hass, stateObj, config.name),
    [hass, stateObj, config.name]
  );
  
  const isOn = stateObj?.state === 'on';
  const hasBrightness = stateObj ? supportsBrightness(stateObj) : false;
  
  const brightness = useMemo(() => {
    if (!stateObj) return 0;
    return Math.round(((stateObj.attributes.brightness || 0) / 255) * 100);
  }, [stateObj]);
  
  const displayBrightness = tempBrightness ?? brightness;
  
  const lightColor = useMemo(() => {
    if (!stateObj) return 'var(--state-inactive-color)';
    return computeLightColor(stateObj);
  }, [stateObj]);
  
  const brightnessFilter = useMemo(() => {
    if (!stateObj) return undefined;
    return computeBrightnessColor(stateObj);
  }, [stateObj]);
  
  // Actions
  const cardActions = createActionHandlers({
    hass,
    config: {
      entity: entityId,
      tap_action: config.tap_action || { action: 'toggle' },
      hold_action: config.hold_action || { action: 'more-info' },
      double_tap_action: config.double_tap_action,
    },
    onMoreInfo,
  });
  
  const buttonHandlers = createLongPressHandlers({
    onTap: cardActions.handleTap,
    onHold: cardActions.handleHold,
    onDoubleTap: cardActions.hasDoubleTapAction ? cardActions.handleDoubleTap : undefined,
  });
  
  // Brightness handlers
  const handleBrightnessChange = useCallback((value: number) => {
    setShowingBrightness(true);
    setTempBrightness(value);
  }, []);
  
  const handleBrightnessChangeEnd = useCallback(async (value: number) => {
    setTempBrightness(null);
    
    // Hide brightness display after a delay
    setTimeout(() => setShowingBrightness(false), 500);
    
    // Call service
    await hass.callService('light', 'turn_on', {
      entity_id: entityId,
      brightness_pct: value,
    });
  }, [hass, entityId]);
  
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
  
  return (
    <HaCard className="relative h-full overflow-hidden">
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
      
      <div className="content h-full flex flex-col items-center justify-center p-4">
        {/* Brightness Slider */}
        <div className="relative flex items-center justify-center">
          {hasBrightness ? (
            <HaRoundSlider
              value={displayBrightness}
              min={1}
              max={100}
              disabled={stateObj.state === 'unavailable'}
              onChange={handleBrightnessChange}
              onChangeEnd={handleBrightnessChangeEnd}
              color={lightColor}
              size={200}
              strokeWidth={20}
            />
          ) : (
            <div className="w-[200px] h-[200px] flex items-center justify-center">
              {/* Light button without slider */}
              <button
                className={cn(
                  'w-24 h-24 rounded-full flex items-center justify-center',
                  'transition-all duration-200',
                  isOn 
                    ? 'bg-[var(--state-light-active-color)]/20' 
                    : 'bg-[var(--state-inactive-color)]/10',
                  'hover:scale-110 active:scale-95'
                )}
                {...buttonHandlers}
                disabled={stateObj.state === 'unavailable'}
              >
                <LightIcon 
                  on={isOn} 
                  size={48}
                  className="transition-transform"
                />
              </button>
            </div>
          )}
          
          {/* Center button (for slider mode) */}
          {hasBrightness && (
            <button
              className={cn(
                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                'w-24 h-24 rounded-full flex items-center justify-center',
                'transition-all duration-200',
                isOn && 'hover:scale-110 active:scale-95',
                stateObj.state === 'unavailable' && 'opacity-50 cursor-not-allowed'
              )}
              style={{
                color: lightColor,
                filter: brightnessFilter,
              }}
              {...buttonHandlers}
              disabled={stateObj.state === 'unavailable'}
            >
              <HaStateIcon
                stateObj={stateObj}
                size="2xl"
                stateColor={false}
                color={lightColor}
              />
            </button>
          )}
        </div>
        
        {/* Info Section */}
        <div className="text-center mt-2" title={name}>
          {/* Brightness / State Display */}
          <div className={cn(
            'text-sm transition-opacity duration-300',
            showingBrightness ? 'opacity-100' : 'opacity-0'
          )}>
            {displayBrightness}%
          </div>
          
          {/* State (when not showing brightness) */}
          {!showingBrightness && stateObj.state === 'unavailable' && (
            <div className="text-sm text-[var(--secondary-text-color)]">
              Unavailable
            </div>
          )}
          
          {/* Name */}
          <div className="font-medium text-[var(--primary-text-color)] truncate max-w-[180px]">
            {name}
          </div>
        </div>
      </div>
    </HaCard>
  );
}

export default HuiLightCard;
