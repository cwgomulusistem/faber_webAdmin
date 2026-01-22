'use client';

import React, { useCallback, useMemo } from 'react';
import type { HassContext, HassEntity } from '@/types/hass';
import { cn } from '@/lib/utils';
import { HaStateIcon } from '../components/HaStateIcon';
import { Power, Zap, Thermometer, Droplets, Wind, Sun, Moon, Lock, Unlock, DoorOpen, DoorClosed } from 'lucide-react';

// ============================================
// Tile Card Config
// ============================================

export interface TileCardConfig {
  type: 'tile';
  entity: string;
  name?: string;
  icon?: string;
  color?: string;
  show_entity_picture?: boolean;
  vertical?: boolean;
  hide_state?: boolean;
  state_content?: string | string[];
  tap_action?: any;
  hold_action?: any;
  icon_tap_action?: any;
  features?: any[];
}

// ============================================
// Props
// ============================================

interface Props {
  config: TileCardConfig;
  hass: HassContext;
  onMoreInfo?: (entityId: string) => void;
}

// ============================================
// Helper Functions
// ============================================

function getDomainFromEntity(entityId: string): string {
  return entityId.split('.')[0] || 'unknown';
}

function isEntityActive(entity: HassEntity): boolean {
  const state = entity.state.toLowerCase();
  return ['on', 'open', 'unlocked', 'home', 'playing', 'heating', 'cooling'].includes(state);
}

function getStateColor(entity: HassEntity, customColor?: string): string {
  if (customColor) return customColor;
  
  const domain = getDomainFromEntity(entity.entity_id);
  const active = isEntityActive(entity);
  
  if (!active) return 'var(--state-inactive-color)';
  
  switch (domain) {
    case 'light':
      // Check for RGB color
      if (entity.attributes.rgb_color) {
        const [r, g, b] = entity.attributes.rgb_color;
        return `rgb(${r}, ${g}, ${b})`;
      }
      return 'var(--light-color)';
    case 'switch':
    case 'input_boolean':
      return 'var(--switch-color)';
    case 'climate':
      const hvacMode = entity.attributes.hvac_mode || entity.state;
      if (hvacMode === 'heat') return 'var(--climate-color)';
      if (hvacMode === 'cool') return '#03a9f4';
      return 'var(--climate-color)';
    case 'fan':
      return 'var(--fan-color)';
    case 'lock':
      return 'var(--lock-color)';
    case 'cover':
      return 'var(--cover-color)';
    case 'sensor':
    case 'binary_sensor':
      return 'var(--sensor-color)';
    default:
      return 'var(--primary-color)';
  }
}

function formatEntityState(entity: HassEntity, hass: HassContext): string {
  const domain = getDomainFromEntity(entity.entity_id);
  const state = entity.state;
  
  // Unit of measurement
  const unit = entity.attributes.unit_of_measurement;
  if (unit) {
    return `${state} ${unit}`;
  }
  
  // Translate common states
  const stateTranslations: Record<string, string> = {
    'on': 'Açık',
    'off': 'Kapalı',
    'open': 'Açık',
    'closed': 'Kapalı',
    'locked': 'Kilitli',
    'unlocked': 'Açık',
    'home': 'Evde',
    'not_home': 'Dışarıda',
    'playing': 'Oynatılıyor',
    'paused': 'Duraklatıldı',
    'idle': 'Boşta',
    'unavailable': 'Kullanılamaz',
    'unknown': 'Bilinmiyor',
    'heat': 'Isıtma',
    'cool': 'Soğutma',
    'auto': 'Otomatik',
    'fan_only': 'Sadece Fan',
    'dry': 'Nem Alma',
  };
  
  return stateTranslations[state.toLowerCase()] || state;
}

// ============================================
// Tile Card Component
// ============================================

export function HuiTileCard({ config, hass, onMoreInfo }: Props) {
  const entity = hass.states[config.entity];
  
  // Handle missing entity
  if (!entity) {
    return (
      <div className="ha-card tile-card">
        <div className="tile-card__content">
          <div className="tile-card__icon" style={{ '--tile-color': 'var(--warning-color)' } as React.CSSProperties}>
            <Zap size={20} />
          </div>
          <div className="tile-card__info">
            <div className="tile-card__name text-[var(--warning-color)]">Entity not found</div>
            <div className="tile-card__state">{config.entity}</div>
          </div>
        </div>
      </div>
    );
  }
  
  const active = isEntityActive(entity);
  const color = getStateColor(entity, config.color);
  const domain = getDomainFromEntity(entity.entity_id);
  const name = config.name || entity.attributes.friendly_name || config.entity;
  const stateText = config.hide_state ? '' : formatEntityState(entity, hass);
  
  // Handle icon click (toggle)
  const handleIconClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Toggle domains
    if (['light', 'switch', 'input_boolean', 'fan'].includes(domain)) {
      hass.callService(domain, 'toggle', { entity_id: config.entity });
    } else if (domain === 'lock') {
      hass.callService('lock', active ? 'unlock' : 'lock', { entity_id: config.entity });
    } else if (domain === 'cover') {
      hass.callService('cover', active ? 'close_cover' : 'open_cover', { entity_id: config.entity });
    }
  }, [config.entity, domain, active, hass]);
  
  // Handle card click (more info)
  const handleCardClick = useCallback(() => {
    onMoreInfo?.(config.entity);
  }, [config.entity, onMoreInfo]);
  
  // Check if icon should be interactive
  const isIconInteractive = ['light', 'switch', 'input_boolean', 'fan', 'lock', 'cover', 'scene', 'script', 'button'].includes(domain);
  
  return (
    <div 
      className={cn(
        'ha-card tile-card ha-card--clickable ripple',
        active && 'tile-card--active'
      )}
      style={{ '--tile-color': color } as React.CSSProperties}
      onClick={handleCardClick}
    >
      <div className={cn(
        'tile-card__content',
        config.vertical && 'flex-col text-center'
      )}>
        {/* Icon */}
        <div 
          className={cn(
            'tile-card__icon',
            isIconInteractive && 'tile-card__icon--interactive'
          )}
          onClick={isIconInteractive ? handleIconClick : undefined}
          role={isIconInteractive ? 'button' : undefined}
          tabIndex={isIconInteractive ? 0 : undefined}
        >
          <HaStateIcon 
            stateObj={entity} 
            size="md" 
            stateColor={active}
            icon={config.icon}
          />
        </div>
        
        {/* Info */}
        <div className="tile-card__info">
          <div className="tile-card__name">{name}</div>
          {stateText && (
            <div className="tile-card__state">{stateText}</div>
          )}
        </div>
      </div>
      
      {/* Brightness indicator for lights */}
      {domain === 'light' && active && entity.attributes.brightness && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-current opacity-30"
          style={{ 
            width: `${Math.round((entity.attributes.brightness / 255) * 100)}%`,
            backgroundColor: color
          }}
        />
      )}
    </div>
  );
}

export default HuiTileCard;
