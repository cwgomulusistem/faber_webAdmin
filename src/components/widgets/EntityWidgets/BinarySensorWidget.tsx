'use client';

import React, { memo } from 'react';
import type { DeviceEntity } from '@/types/entity.types';
import { cn } from '@/lib/utils';

interface BinarySensorWidgetProps {
  entity: DeviceEntity;
  value: string | number | boolean | undefined;
  isOnline: boolean;
  isPending?: boolean;
  onControl?: (entityId: string, command: string | number | boolean) => void;
}

/**
 * BinarySensorWidget - Display binary sensor states (motion, door, etc.)
 */
const BinarySensorWidget = memo<BinarySensorWidgetProps>(
  ({ entity, value, isOnline }) => {
    const isActive = value === true || value === 'ON' || value === 'on' || value === 1 || 
                     value === 'open' || value === 'detected';

    // Get icon and label based on device class
    const getDisplayInfo = () => {
      switch (entity.device_class) {
        case 'motion':
          return { icon: isActive ? '🏃' : '⏸️', label: isActive ? 'Hareket Algılandı' : 'Hareket Yok' };
        case 'door':
          return { icon: isActive ? '🚪' : '🔒', label: isActive ? 'Açık' : 'Kapalı' };
        case 'window':
          return { icon: isActive ? '🪟' : '⬜', label: isActive ? 'Açık' : 'Kapalı' };
        default:
          return { icon: isActive ? '🟢' : '⚪', label: isActive ? 'Aktif' : 'Pasif' };
      }
    };

    const { icon, label } = getDisplayInfo();

    return (
      <div
        className={cn(
          'glass-card p-4 relative',
          isActive && 'glass-card-active',
          !isOnline && 'device-offline'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-xs uppercase tracking-wide truncate">
            {entity.name}
          </span>
          <span className="text-xl">{icon}</span>
        </div>

        {/* Status */}
        <div className="text-center">
          <span className={cn(
            'text-lg font-medium',
            isActive ? 'text-green-400' : 'text-gray-400'
          )}>
            {label}
          </span>
        </div>

        {/* Device class indicator */}
        {entity.device_class && (
          <p className="text-[10px] text-gray-500 mt-2 text-center capitalize">
            {entity.device_class.replace('_', ' ')}
          </p>
        )}

        {/* Offline overlay */}
        {!isOnline && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 rounded-xl backdrop-blur-sm">
            <span className="text-xs text-gray-400">Çevrimdışı</span>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.isOnline === nextProps.isOnline
    );
  }
);

BinarySensorWidget.displayName = 'BinarySensorWidget';
export default BinarySensorWidget;
