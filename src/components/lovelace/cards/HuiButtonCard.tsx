'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { HassContext, HassEntity, ActionConfig } from '@/types/hass';
import { HaCard } from '../components/HaCard';
import { HaStateIcon } from '../components/HaStateIcon';
import { 
  createActionHandlers, 
  createLongPressHandlers,
  computeEntityName,
  getDefaultAction,
} from '../common/action-handler';
import { isStateActive, getStateColor } from '@/contexts/ThemeContext';

// ============================================
// Button Card Config
// ============================================

export interface ButtonCardConfig {
  type: 'button';
  entity?: string;
  name?: string;
  icon?: string;
  icon_height?: string;
  show_icon?: boolean;
  show_name?: boolean;
  show_state?: boolean;
  theme?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  color?: string;
  /** @deprecated use color instead */
  state_color?: boolean;
}

// ============================================
// Props
// ============================================

interface Props {
  config: ButtonCardConfig;
  hass: HassContext;
  onMoreInfo?: (entityId: string) => void;
}

// ============================================
// Helper Functions
// ============================================

function computeButtonColor(
  stateObj: HassEntity | undefined,
  config: ButtonCardConfig
): string | undefined {
  // If color is explicitly set to 'none', return undefined
  if (config.color === 'none') {
    return undefined;
  }
  
  // If custom color is set, use it when active
  if (config.color) {
    if (!stateObj || isStateActive(stateObj.state)) {
      return config.color;
    }
    return undefined;
  }
  
  // No state object means no color
  if (!stateObj) {
    return undefined;
  }
  
  // Handle RGB color for lights
  if (stateObj.attributes.rgb_color) {
    const [r, g, b] = stateObj.attributes.rgb_color;
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  // Handle HVAC action for climate
  if (stateObj.attributes.hvac_action) {
    const domain = stateObj.entity_id.split('.')[0];
    return getStateColor(stateObj.state, domain, stateObj.attributes);
  }
  
  // Default to state color
  const domain = stateObj.entity_id.split('.')[0];
  return getStateColor(stateObj.state, domain, stateObj.attributes);
}

// ============================================
// HuiButtonCard Component
// ============================================

export function HuiButtonCard({ config, hass, onMoreInfo }: Props) {
  const entityId = config.entity;
  const stateObj = entityId ? hass.states[entityId] : undefined;
  
  // Config defaults
  const showIcon = config.show_icon !== false;
  const showName = config.show_name !== false;
  const showState = config.show_state === true;
  
  // Compute values
  const name = useMemo(() => {
    if (config.name) return config.name;
    return computeEntityName(hass, stateObj, config.name);
  }, [hass, stateObj, config.name]);
  
  const stateColor = useMemo(() => 
    computeButtonColor(stateObj, config),
    [stateObj, config]
  );
  
  const stateDisplay = useMemo(() => {
    if (!stateObj) return '';
    return hass.formatEntityState?.(stateObj) || stateObj.state;
  }, [hass, stateObj]);
  
  const active = stateObj ? isStateActive(stateObj.state) : false;
  
  // Default action based on entity
  const defaultTapAction = useMemo(() => {
    if (entityId) {
      return getDefaultAction(entityId);
    }
    return { action: 'more-info' as const };
  }, [entityId]);
  
  // Actions
  const cardActions = createActionHandlers({
    hass,
    config: {
      entity: entityId,
      tap_action: config.tap_action || defaultTapAction,
      hold_action: config.hold_action || { action: 'more-info' },
      double_tap_action: config.double_tap_action || { action: 'none' },
    },
    onMoreInfo,
  });
  
  const buttonHandlers = createLongPressHandlers({
    onTap: cardActions.handleTap,
    onHold: cardActions.handleHold,
    onDoubleTap: cardActions.hasDoubleTapAction ? cardActions.handleDoubleTap : undefined,
  });
  
  // Handle entity not found warning
  if (entityId && !stateObj) {
    return (
      <HaCard className="p-4 h-full flex items-center justify-center">
        <div className="text-center text-[var(--warning-color)]">
          <span className="text-2xl">⚠️</span>
          <div className="text-sm mt-1">{entityId}</div>
        </div>
      </HaCard>
    );
  }
  
  // Icon height style
  const iconStyle = config.icon_height ? { height: config.icon_height } : undefined;
  
  return (
    <HaCard
      className={cn(
        'group h-full cursor-pointer transition-all duration-200',
        'flex flex-col items-center justify-center text-center',
        'hover:shadow-lg active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]'
      )}
      style={{
        '--state-color': stateColor || 'var(--state-icon-color)',
      } as React.CSSProperties}
      tabIndex={cardActions.hasAction ? 0 : undefined}
      role={cardActions.hasAction ? 'button' : undefined}
      aria-label={name}
      {...buttonHandlers}
    >
      <div className="p-4 flex flex-col items-center justify-center gap-2 h-full">
        {/* Icon */}
        {showIcon && (
          <div 
            className={cn(
              'transition-transform duration-200',
              'group-hover:scale-110 group-active:scale-95',
              'group-focus-visible:scale-110'
            )}
            style={iconStyle}
          >
            {stateObj ? (
              <HaStateIcon
                stateObj={stateObj}
                size="2xl"
                stateColor
                color={stateColor}
              />
            ) : (
              <div 
                className="w-12 h-12 flex items-center justify-center"
                style={{ color: 'var(--state-icon-color)' }}
              >
                {/* Default icon or placeholder */}
                <svg 
                  viewBox="0 0 24 24" 
                  width="48" 
                  height="48"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
            )}
          </div>
        )}
        
        {/* Name */}
        {showName && name && (
          <span 
            className="font-medium text-[var(--primary-text-color)] truncate max-w-full"
            title={name}
          >
            {name}
          </span>
        )}
        
        {/* State */}
        {showState && stateObj && (
          <span className="text-sm text-[var(--secondary-text-color)]">
            {stateDisplay}
          </span>
        )}
      </div>
    </HaCard>
  );
}

export default HuiButtonCard;
