'use client';

import React, { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { DeviceEntity } from '@/types/entity.types';
import { cn } from '@/lib/utils';

interface LightWidgetProps {
  entity: DeviceEntity;
  value: string | number | boolean | undefined;
  isOnline: boolean;
  isPending?: boolean;
  onControl?: (entityId: string, command: string | number | boolean) => void;
}

/**
 * LightWidget - Dimmable light control
 * Features:
 * - Toggle on/off
 * - Brightness slider
 * - Dynamic glow effect
 */
const LightWidget = memo<LightWidgetProps>(
  ({ entity, value, isOnline, isPending = false, onControl }) => {
    // Value can be boolean (on/off) or number (brightness 0-255 or 0-100)
    const brightness = typeof value === 'number' ? value : (value === true || value === 'ON' ? 100 : 0);
    const isOn = brightness > 0;
    
    const [localBrightness, setLocalBrightness] = useState(brightness);

    const handleToggle = useCallback(() => {
      if (!isOnline || isPending) return;
      const newState = isOn ? 'OFF' : 'ON';
      onControl?.(entity.id, newState);
    }, [entity.id, isOn, isOnline, isPending, onControl]);

    const handleBrightnessChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10);
      setLocalBrightness(newValue);
    }, []);

    const handleBrightnessCommit = useCallback(() => {
      if (!isOnline || isPending) return;
      onControl?.(entity.id, localBrightness);
    }, [entity.id, localBrightness, isOnline, isPending, onControl]);

    // Sync local state with prop
    React.useEffect(() => {
      setLocalBrightness(brightness);
    }, [brightness]);

    const glowIntensity = (localBrightness / 100) * 0.5;

    return (
      <div
        className={cn(
          'glass-card p-4 relative transition-all duration-200',
          isOn && 'glass-card-active',
          !isOnline && 'device-offline',
          isPending && 'opacity-70'
        )}
        style={{
          boxShadow: isOn 
            ? `0 0 ${20 + localBrightness / 5}px rgba(255, 220, 100, ${glowIntensity})`
            : undefined,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-300 text-sm font-medium truncate">
            {entity.name}
          </span>
          <button
            onClick={handleToggle}
            disabled={!isOnline || isPending}
            className="text-lg hover:scale-110 transition-transform"
          >
            {isOn ? '💡' : '🔌'}
          </button>
        </div>

        {/* Brightness value */}
        <div className="text-center mb-2">
          <span className="text-2xl font-bold text-white">
            {localBrightness}%
          </span>
        </div>

        {/* Brightness slider */}
        <input
          type="range"
          min={entity.min ?? 0}
          max={entity.max ?? 100}
          step={entity.step ?? 1}
          value={localBrightness}
          onChange={handleBrightnessChange}
          onMouseUp={handleBrightnessCommit}
          onTouchEnd={handleBrightnessCommit}
          disabled={!isOnline || isPending}
          className={cn(
            'w-full h-2 rounded-full appearance-none cursor-pointer',
            'bg-gradient-to-r from-gray-700 to-yellow-400',
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

        {/* Pending overlay */}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
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

LightWidget.displayName = 'LightWidget';
export default LightWidget;
