'use client';

import React, { memo, useState, useCallback } from 'react';
import type { DeviceEntity } from '@/types/entity.types';
import { cn } from '@/lib/utils';

interface ClimateWidgetProps {
  entity: DeviceEntity;
  value: string | number | boolean | undefined;
  isOnline: boolean;
  isPending?: boolean;
  onControl?: (entityId: string, command: string | number | boolean) => void;
}

/**
 * ClimateWidget - Thermostat control
 * Features:
 * - Temperature display and adjustment
 * - Mode selection (heat/cool/auto)
 */
const ClimateWidget = memo<ClimateWidgetProps>(
  ({ entity, value, isOnline, isPending = false, onControl }) => {
    const temperature = typeof value === 'number' ? value : 20;
    const [localTemp, setLocalTemp] = useState(temperature);

    const handleTempChange = useCallback((delta: number) => {
      if (!isOnline || isPending) return;
      const min = entity.min ?? 10;
      const max = entity.max ?? 35;
      const step = entity.step ?? 0.5;
      const newTemp = Math.max(min, Math.min(max, localTemp + delta * step));
      setLocalTemp(newTemp);
      onControl?.(entity.id, newTemp);
    }, [entity, localTemp, isOnline, isPending, onControl]);

    React.useEffect(() => {
      setLocalTemp(temperature);
    }, [temperature]);

    return (
      <div
        className={cn(
          'glass-card p-4 relative',
          !isOnline && 'device-offline',
          isPending && 'opacity-70'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-xs uppercase tracking-wide truncate">
            {entity.name}
          </span>
          <span className="text-lg">🌡️</span>
        </div>

        {/* Temperature display */}
        <div className="flex items-center justify-center gap-4 my-4">
          <button
            onClick={() => handleTempChange(-1)}
            disabled={!isOnline || isPending}
            className={cn(
              'w-10 h-10 rounded-full bg-slate-700 text-white text-xl',
              'hover:bg-slate-600 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            -
          </button>

          <div className="text-center">
            <span className="text-3xl font-bold text-white">
              {localTemp.toFixed(1)}
            </span>
            <span className="text-lg text-gray-400 ml-1">
              {entity.unit || '°C'}
            </span>
          </div>

          <button
            onClick={() => handleTempChange(1)}
            disabled={!isOnline || isPending}
            className={cn(
              'w-10 h-10 rounded-full bg-slate-700 text-white text-xl',
              'hover:bg-slate-600 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            +
          </button>
        </div>

        {/* Mode indicator */}
        <div className="text-center">
          <span className="text-xs text-gray-500">
            Hedef Sıcaklık
          </span>
        </div>

        {/* Pending overlay */}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Offline overlay */}
        {!isOnline && !isPending && (
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
      prevProps.isOnline === nextProps.isOnline &&
      prevProps.isPending === nextProps.isPending
    );
  }
);

ClimateWidget.displayName = 'ClimateWidget';
export default ClimateWidget;
