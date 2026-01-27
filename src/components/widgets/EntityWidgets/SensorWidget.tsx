'use client';

import React, { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DeviceEntity } from '@/types/entity.types';
import { formatEntityValue, getEntityIcon } from '@/types/entity.types';
import { cn } from '@/lib/utils';

interface SensorWidgetProps {
  entity: DeviceEntity;
  value: string | number | boolean | undefined;
  isOnline: boolean;
  isPending?: boolean;
  onControl?: (entityId: string, command: string | number | boolean) => void;
}

/**
 * SensorWidget - Display sensor values with animations
 * Features:
 * - Pulse animation when value changes
 * - Sliding number transition
 * - Offline state handling
 */
const SensorWidget = memo<SensorWidgetProps>(
  ({ entity, value, isOnline }) => {
    const [showPulse, setShowPulse] = useState(false);
    const [prevValue, setPrevValue] = useState(value);

    // Trigger pulse animation when value changes
    useEffect(() => {
      if (value !== prevValue && prevValue !== undefined) {
        setShowPulse(true);
        const timer = setTimeout(() => setShowPulse(false), 1000);
        setPrevValue(value);
        return () => clearTimeout(timer);
      }
      setPrevValue(value);
    }, [value, prevValue]);

    const formattedValue = value !== undefined 
      ? formatEntityValue(value, entity) 
      : '--';

    const iconName = getEntityIcon(entity);

    return (
      <div
        className={cn(
          'glass-card p-4 relative',
          !isOnline && 'device-offline',
          showPulse && 'value-update-pulse'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-xs uppercase tracking-wide truncate">
            {entity.name}
          </span>
          <span className="text-indigo-400 text-lg">
            {/* Icon placeholder - replace with actual icon component */}
            {entity.device_class === 'temperature' && '🌡️'}
            {entity.device_class === 'humidity' && '💧'}
            {entity.device_class === 'power' && '⚡'}
            {entity.device_class === 'battery' && '🔋'}
            {!entity.device_class && '📊'}
          </span>
        </div>

        {/* Value with slide animation */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={String(value)}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex items-baseline gap-1"
          >
            <span className="text-3xl font-bold text-white tabular-nums">
              {formattedValue}
            </span>
            {entity.unit && (
              <span className="text-sm text-gray-400">
                {entity.unit}
              </span>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Device class label */}
        {entity.device_class && (
          <p className="text-[10px] text-gray-500 mt-2 capitalize">
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

SensorWidget.displayName = 'SensorWidget';
export default SensorWidget;
