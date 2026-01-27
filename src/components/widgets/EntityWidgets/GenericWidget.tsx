'use client';

import React, { memo } from 'react';
import type { DeviceEntity } from '@/types/entity.types';
import { formatEntityValue } from '@/types/entity.types';
import { cn } from '@/lib/utils';

interface GenericWidgetProps {
  entity: DeviceEntity;
  value: string | number | boolean | undefined;
  isOnline: boolean;
  isPending?: boolean;
  onControl?: (entityId: string, command: string | number | boolean) => void;
}

/**
 * GenericWidget - Fallback widget for unknown entity types
 * Shows raw value and entity info
 */
const GenericWidget = memo<GenericWidgetProps>(
  ({ entity, value, isOnline }) => {
    const formattedValue = value !== undefined 
      ? formatEntityValue(value, entity) 
      : '--';

    return (
      <div
        className={cn(
          'glass-card p-4 relative',
          !isOnline && 'device-offline'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-xs uppercase tracking-wide truncate">
            {entity.name}
          </span>
          <span className="text-lg">📊</span>
        </div>

        {/* Value */}
        <div className="text-center">
          <span className="text-2xl font-bold text-white">
            {formattedValue}
          </span>
          {entity.unit && (
            <span className="text-sm text-gray-400 ml-1">
              {entity.unit}
            </span>
          )}
        </div>

        {/* Type info */}
        <div className="mt-3 pt-2 border-t border-white/5">
          <p className="text-[10px] text-gray-500">
            Tip: <span className="text-gray-400">{entity.type}</span>
          </p>
          {entity.device_class && (
            <p className="text-[10px] text-gray-500">
              Sınıf: <span className="text-gray-400">{entity.device_class}</span>
            </p>
          )}
        </div>

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

GenericWidget.displayName = 'GenericWidget';
export default GenericWidget;
