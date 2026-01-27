'use client';

import React, { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { DeviceEntity } from '@/types/entity.types';
import { cn } from '@/lib/utils';

interface FanWidgetProps {
  entity: DeviceEntity;
  value: string | number | boolean | undefined;
  isOnline: boolean;
  isPending?: boolean;
  onControl?: (entityId: string, command: string | number | boolean) => void;
}

/**
 * FanWidget - Fan with speed control
 */
const FanWidget = memo<FanWidgetProps>(
  ({ entity, value, isOnline, isPending = false, onControl }) => {
    const speed = typeof value === 'number' ? value : (value === true || value === 'ON' ? 100 : 0);
    const isOn = speed > 0;
    const [localSpeed, setLocalSpeed] = useState(speed);

    const handleToggle = useCallback(() => {
      if (!isOnline || isPending) return;
      const newState = isOn ? 'OFF' : 'ON';
      onControl?.(entity.id, newState);
    }, [entity.id, isOn, isOnline, isPending, onControl]);

    const handleSpeedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10);
      setLocalSpeed(newValue);
    }, []);

    const handleSpeedCommit = useCallback(() => {
      if (!isOnline || isPending) return;
      onControl?.(entity.id, localSpeed);
    }, [entity.id, localSpeed, isOnline, isPending, onControl]);

    React.useEffect(() => {
      setLocalSpeed(speed);
    }, [speed]);

    // Animation speed based on fan speed
    const animationDuration = isOn ? Math.max(0.5, 3 - (localSpeed / 50)) : 0;

    return (
      <div
        className={cn(
          'glass-card p-4 relative',
          isOn && 'glass-card-active',
          !isOnline && 'device-offline',
          isPending && 'opacity-70'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-300 text-sm font-medium truncate">
            {entity.name}
          </span>
          <motion.span 
            className="text-xl cursor-pointer"
            onClick={handleToggle}
            animate={{ rotate: isOn ? 360 : 0 }}
            transition={{ 
              duration: animationDuration, 
              repeat: isOn ? Infinity : 0, 
              ease: 'linear' 
            }}
          >
            🌀
          </motion.span>
        </div>

        {/* Speed value */}
        <div className="text-center mb-2">
          <span className="text-2xl font-bold text-white">
            {localSpeed}%
          </span>
        </div>

        {/* Speed slider */}
        <input
          type="range"
          min={0}
          max={entity.max ?? 100}
          step={entity.step ?? 10}
          value={localSpeed}
          onChange={handleSpeedChange}
          onMouseUp={handleSpeedCommit}
          onTouchEnd={handleSpeedCommit}
          disabled={!isOnline || isPending}
          className={cn(
            'w-full h-2 rounded-full appearance-none cursor-pointer',
            'bg-gradient-to-r from-gray-700 to-cyan-400',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:shadow-md',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            (!isOnline || isPending) && 'opacity-50 cursor-not-allowed'
          )}
        />

        {/* Status label */}
        <p className="text-center text-xs text-gray-500 mt-2">
          {isOn ? 'Çalışıyor' : 'Kapalı'}
        </p>

        {/* Pending overlay */}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
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

FanWidget.displayName = 'FanWidget';
export default FanWidget;
