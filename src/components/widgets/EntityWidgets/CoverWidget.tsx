'use client';

import React, { memo, useCallback } from 'react';
import type { DeviceEntity } from '@/types/entity.types';
import { cn } from '@/lib/utils';

interface CoverWidgetProps {
  entity: DeviceEntity;
  value: string | number | boolean | undefined;
  isOnline: boolean;
  isPending?: boolean;
  onControl?: (entityId: string, command: string | number | boolean) => void;
}

/**
 * CoverWidget - Blinds, curtains, garage doors control
 */
const CoverWidget = memo<CoverWidgetProps>(
  ({ entity, value, isOnline, isPending = false, onControl }) => {
    // Value can be 'open', 'closed', 'opening', 'closing', or position 0-100
    const position = typeof value === 'number' ? value : (value === 'open' || value === 'opened' ? 100 : 0);
    const state = typeof value === 'string' ? value : (position > 0 ? 'open' : 'closed');

    const handleCommand = useCallback((cmd: string) => {
      if (!isOnline || isPending) return;
      onControl?.(entity.id, cmd);
    }, [entity.id, isOnline, isPending, onControl]);

    return (
      <div
        className={cn(
          'glass-card p-4 relative',
          !isOnline && 'device-offline',
          isPending && 'opacity-70'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-300 text-sm font-medium truncate">
            {entity.name}
          </span>
          <span className="text-lg">🚪</span>
        </div>

        {/* Status */}
        <div className="text-center mb-3">
          <span className={cn(
            'text-xl font-medium capitalize',
            state === 'open' || state === 'opened' ? 'text-green-400' : 
            state === 'closed' ? 'text-gray-400' :
            'text-yellow-400'
          )}>
            {state === 'opening' && '↑ Açılıyor...'}
            {state === 'closing' && '↓ Kapanıyor...'}
            {state === 'open' || state === 'opened' ? 'Açık' : ''}
            {state === 'closed' && 'Kapalı'}
          </span>
          {typeof value === 'number' && (
            <p className="text-xs text-gray-500 mt-1">{position}%</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleCommand('open')}
            disabled={!isOnline || isPending}
            className={cn(
              'px-3 py-1.5 rounded-lg bg-slate-700 text-white text-sm',
              'hover:bg-slate-600 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            ↑ Aç
          </button>
          <button
            onClick={() => handleCommand('stop')}
            disabled={!isOnline || isPending}
            className={cn(
              'px-3 py-1.5 rounded-lg bg-slate-700 text-white text-sm',
              'hover:bg-red-600 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            ⏹ Dur
          </button>
          <button
            onClick={() => handleCommand('close')}
            disabled={!isOnline || isPending}
            className={cn(
              'px-3 py-1.5 rounded-lg bg-slate-700 text-white text-sm',
              'hover:bg-slate-600 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            ↓ Kapat
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

CoverWidget.displayName = 'CoverWidget';
export default CoverWidget;
