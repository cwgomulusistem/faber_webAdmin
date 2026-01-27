'use client';

import React, { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DeviceEntity, EntityType } from '@/types/entity.types';
import { formatEntityValue } from '@/types/entity.types';
import { WidgetErrorBoundary } from '@/components/ErrorBoundary';

// Import Entity Widgets
import SensorWidget from './EntityWidgets/SensorWidget';
import SwitchWidget from './EntityWidgets/SwitchWidget';
import LightWidget from './EntityWidgets/LightWidget';
import ClimateWidget from './EntityWidgets/ClimateWidget';
import CoverWidget from './EntityWidgets/CoverWidget';
import BinarySensorWidget from './EntityWidgets/BinarySensorWidget';
import FanWidget from './EntityWidgets/FanWidget';
import LockWidget from './EntityWidgets/LockWidget';
import GenericWidget from './EntityWidgets/GenericWidget';

// Widget registry - maps entity type to component
const EntityWidgetMap: Record<EntityType, React.ComponentType<EntityWidgetProps>> = {
  switch: SwitchWidget,
  sensor: SensorWidget,
  light: LightWidget,
  climate: ClimateWidget,
  cover: CoverWidget,
  binary_sensor: BinarySensorWidget,
  fan: FanWidget,
  lock: LockWidget,
};

export interface EntityWidgetProps {
  entity: DeviceEntity;
  value: string | number | boolean | undefined;
  isOnline: boolean;
  isPending?: boolean; // Optimistic UI: Command in flight
  onControl?: (entityId: string, command: string | number | boolean) => void;
}

interface WidgetFactoryProps {
  entity: DeviceEntity;
  value: string | number | boolean | undefined;
  isOnline?: boolean;
  isPending?: boolean;
  onControl?: (entityId: string, command: string | number | boolean) => void;
}

/**
 * WidgetFactory - Dynamically renders widgets based on entity type
 * Uses React.memo for performance optimization
 * Wrapped with ErrorBoundary to prevent single widget crash from taking down dashboard
 */
const WidgetFactory = memo<WidgetFactoryProps>(
  ({ entity, value, isOnline = true, isPending = false, onControl }) => {
    // Get the appropriate widget component
    const Component = EntityWidgetMap[entity.type] || GenericWidget;

    return (
      <WidgetErrorBoundary
        entityId={entity.id}
        entityName={entity.name}
        onError={(error, errorInfo) => {
          // Log to analytics/monitoring in production
          console.error(`[Widget Error] ${entity.id}:`, error.message);
        }}
      >
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="widget-card"
        >
          <Component
            entity={entity}
            value={value}
            isOnline={isOnline}
            isPending={isPending}
            onControl={onControl}
          />
        </motion.div>
      </WidgetErrorBoundary>
    );
  },
  // Custom comparison - only re-render when value, isOnline, or isPending changes
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.isOnline === nextProps.isOnline &&
      prevProps.isPending === nextProps.isPending &&
      prevProps.entity.id === nextProps.entity.id
    );
  }
);

WidgetFactory.displayName = 'WidgetFactory';

/**
 * WidgetGrid - Renders a grid of widgets for a device
 */
interface WidgetGridProps {
  entities: DeviceEntity[];
  values: Record<string, string | number | boolean | undefined>;
  isOnline?: boolean;
  pendingCommands?: Set<string>;
  onControl?: (entityId: string, command: string | number | boolean) => void;
  deviceMac?: string;
}

export const WidgetGrid = memo<WidgetGridProps>(
  ({ entities, values, isOnline = true, pendingCommands, onControl, deviceMac }) => {
    if (entities.length === 0) {
      // Show discovery pending state
      return (
        <DiscoveryPendingWidget mac={deviceMac || 'unknown'} />
      );
    }

    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
        <AnimatePresence mode="popLayout">
          {entities.map((entity) => (
            <WidgetFactory
              key={entity.id}
              entity={entity}
              value={values[entity.id]}
              isOnline={isOnline}
              isPending={pendingCommands?.has(entity.id)}
              onControl={onControl}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  }
);

WidgetGrid.displayName = 'WidgetGrid';

/**
 * DiscoveryPendingWidget - Shown when device hasn't announced entities yet
 */
interface DiscoveryPendingProps {
  mac: string;
}

export const DiscoveryPendingWidget = memo<DiscoveryPendingProps>(({ mac }) => {
  return (
    <div className="glass-card animate-pulse p-4 col-span-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-700 rounded w-1/2" />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Cihaz özellikleri tanımlanıyor...
      </p>
      <p className="text-[10px] text-gray-600 font-mono mt-1">
        MAC: {mac}
      </p>
    </div>
  );
});

DiscoveryPendingWidget.displayName = 'DiscoveryPendingWidget';

export default WidgetFactory;
