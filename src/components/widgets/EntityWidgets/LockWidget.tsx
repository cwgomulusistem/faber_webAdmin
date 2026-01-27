'use client';

import React, { memo, useCallback } from 'react';
import type { DeviceEntity } from '@/types/entity.types';
import { cn } from '@/lib/utils';

interface LockWidgetProps {
  entity: DeviceEntity;
  value: string | number | boolean | undefined;
  isOnline: boolean;
  isPending?: boolean;
  onControl?: (entityId: string, command: string | number | boolean) => void;
}

/**
 * LockWidget - Door lock control
 */
const LockWidget = memo<LockWidgetProps>(
  ({ entity, value, isOnline, isPending = false, onControl }) => {
    const isLocked = value === true || value === 'locked' || value === 'LOCKED' || value === 1;

    const handleToggle = useCallback(() => {
      if (!isOnline || isPending) return;
      const newState = isLocked ? 'unlock' : 'lock';
      onControl?.(entity.id, newState);
    }, [entity.id, isLocked, isOnline, isPending, onControl]);

    return (
      <div
        className={cn(
          'glass-card p-4 relative cursor-pointer transition-all duration-200',
          isLocked && 'border-green-500/30',
          !isLocked && 'border-red-500/30',
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
          <span className="text-2xl">
            {isLocked ? '🔒' : '🔓'}
          </span>
        </div>

        {/* Status */}
        <div className="text-center">
          <span className={cn(
            'text-lg font-medium',
            isLocked ? 'text-green-400' : 'text-red-400'
          )}>
            {isLocked ? 'Kilitli' : 'Açık'}
          </span>
        </div>

        {/* Action hint */}
        <p className="text-center text-xs text-gray-500 mt-2">
          {isLocked ? 'Kilidi açmak için tıkla' : 'Kilitlemek için tıkla'}
        </p>

        {/* Pending overlay */}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
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

LockWidget.displayName = 'LockWidget';
export default LockWidget;
