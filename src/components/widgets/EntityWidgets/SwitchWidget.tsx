'use client';

import React, { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { DeviceEntity } from '@/types/entity.types';
import { cn } from '@/lib/utils';

interface SwitchWidgetProps {
  entity: DeviceEntity;
  value: string | number | boolean | undefined;
  isOnline: boolean;
  isPending?: boolean;
  onControl?: (entityId: string, command: string | number | boolean) => void;
}

/**
 * SwitchWidget - Toggle switch for on/off entities
 * Features:
 * - Optimistic UI with pending state
 * - Glow effect when ON
 * - Smooth toggle animation
 */
const SwitchWidget = memo<SwitchWidgetProps>(
  ({ entity, value, isOnline, isPending = false, onControl }) => {
    const isOn = value === true || value === 'ON' || value === 'on' || value === 1;

    const handleToggle = useCallback(() => {
      if (!isOnline || isPending) return;
      const newState = isOn ? 'OFF' : 'ON';
      onControl?.(entity.id, newState);
    }, [entity.id, isOn, isOnline, isPending, onControl]);

    return (
      <div
        className={cn(
          'glass-card p-4 relative cursor-pointer transition-all duration-200',
          isOn && 'glass-card-active',
          !isOnline && 'device-offline',
          isPending && 'opacity-70'
        )}
        onClick={handleToggle}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-300 text-sm font-medium truncate">
            {entity.name}
          </span>
          <span className="text-lg">
            {isOn ? '💡' : '🔌'}
          </span>
        </div>

        {/* Toggle switch */}
        <div className="flex items-center justify-between">
          <span className={cn(
            'text-xs font-medium',
            isOn ? 'text-green-400' : 'text-gray-500'
          )}>
            {isOn ? 'AÇIK' : 'KAPALI'}
          </span>
          
          {/* Custom toggle button */}
          <button
            disabled={!isOnline || isPending}
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors duration-200',
              isOn ? 'bg-indigo-500' : 'bg-slate-600',
              (!isOnline || isPending) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <motion.div
              layout
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
              animate={{
                left: isOn ? 'calc(100% - 20px)' : '4px',
              }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
            />
          </button>
        </div>

        {/* Pending overlay */}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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

SwitchWidget.displayName = 'SwitchWidget';
export default SwitchWidget;
