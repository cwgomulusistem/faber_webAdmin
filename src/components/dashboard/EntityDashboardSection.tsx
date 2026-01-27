'use client';

import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WidgetFactory, { WidgetGrid, DiscoveryPendingWidget } from '../widgets/WidgetFactory';
import type { DeviceWithEntities } from '@/contexts/entity.context';
import { cn } from '@/lib/utils';

interface EntityDashboardSectionProps {
  title: string;
  devices: DeviceWithEntities[];
  entityValues: Record<string, string | number | boolean | undefined>;
  pendingCommands: Set<string>;
  onControl: (deviceId: string, entityId: string, command: string | number | boolean) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

/**
 * EntityDashboardSection - Renders a section of entity-based widgets
 * Groups devices and renders widgets based on their entities
 */
export const EntityDashboardSection = memo<EntityDashboardSectionProps>(
  ({ 
    title, 
    devices, 
    entityValues, 
    pendingCommands, 
    onControl,
    isCollapsed = false,
    onToggleCollapse,
  }) => {
    // Calculate total entity count for section header
    const totalEntities = useMemo(() => 
      devices.reduce((sum, d) => sum + d.entities.length, 0), 
      [devices]
    );

    const onlineDevices = useMemo(() => 
      devices.filter(d => d.isOnline).length, 
      [devices]
    );

    return (
      <div className="mb-6">
        {/* Section Header */}
        <div 
          className={cn(
            'flex items-center justify-between mb-4 px-2 cursor-pointer',
            'hover:opacity-80 transition-opacity'
          )}
          onClick={onToggleCollapse}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">
              {title}
            </h2>
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-gray-400">
              {totalEntities} kontrol
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className={cn(
                'w-2 h-2 rounded-full',
                onlineDevices > 0 ? 'bg-green-500' : 'bg-gray-600'
              )} />
              {onlineDevices}/{devices.length} çevrimiçi
            </span>
            <motion.span
              animate={{ rotate: isCollapsed ? -90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▼
            </motion.span>
          </div>
        </div>

        {/* Section Content */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="widget-grid">
                {devices.map((device) => (
                  <DeviceWidgetGroup
                    key={device.id}
                    device={device}
                    entityValues={entityValues}
                    pendingCommands={pendingCommands}
                    onControl={onControl}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

EntityDashboardSection.displayName = 'EntityDashboardSection';

/**
 * DeviceWidgetGroup - Renders all widgets for a single device
 */
interface DeviceWidgetGroupProps {
  device: DeviceWithEntities;
  entityValues: Record<string, string | number | boolean | undefined>;
  pendingCommands: Set<string>;
  onControl: (deviceId: string, entityId: string, command: string | number | boolean) => void;
}

const DeviceWidgetGroup = memo<DeviceWidgetGroupProps>(
  ({ device, entityValues, pendingCommands, onControl }) => {
    const handleControl = (entityId: string, command: string | number | boolean) => {
      onControl(device.id, entityId, command);
    };

    // No entities yet - show discovery pending
    if (device.entities.length === 0) {
      return <DiscoveryPendingWidget mac={device.mac} />;
    }

    return (
      <>
        {device.entities.map((entity) => (
          <WidgetFactory
            key={entity.id}
            entity={entity}
            value={entityValues[entity.id]}
            isOnline={device.isOnline}
            isPending={pendingCommands.has(entity.id)}
            onControl={handleControl}
          />
        ))}
      </>
    );
  }
);

DeviceWidgetGroup.displayName = 'DeviceWidgetGroup';

/**
 * EntityDashboard - Full entity-based dashboard
 */
interface EntityDashboardProps {
  deviceEntities: Map<string, DeviceWithEntities>;
  entityValues: Record<string, string | number | boolean | undefined>;
  pendingCommands: Set<string>;
  onControl: (deviceId: string, entityId: string, command: string | number | boolean) => void;
  groupByRoom?: boolean;
}

export const EntityDashboard = memo<EntityDashboardProps>(
  ({ 
    deviceEntities, 
    entityValues, 
    pendingCommands, 
    onControl,
    groupByRoom = true,
  }) => {
    // Group devices by room
    const groupedDevices = useMemo(() => {
      const groups = new Map<string, { name: string; devices: DeviceWithEntities[] }>();
      
      deviceEntities.forEach((device) => {
        const roomId = device.roomId || 'unassigned';
        const roomName = device.roomName || 'Diğer Cihazlar';
        
        if (!groups.has(roomId)) {
          groups.set(roomId, { name: roomName, devices: [] });
        }
        groups.get(roomId)!.devices.push(device);
      });
      
      return groups;
    }, [deviceEntities]);

    // Flat list (no grouping)
    const allDevices = useMemo(() => 
      Array.from(deviceEntities.values()), 
      [deviceEntities]
    );

    if (deviceEntities.size === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <span className="text-4xl">🏠</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Henüz cihaz bulunamadı
          </h3>
          <p className="text-sm text-gray-400 max-w-md">
            Akıllı cihazlarınızı ekleyerek başlayın. Cihazlar otomatik olarak
            sistemle entegre olacaktır.
          </p>
        </div>
      );
    }

    if (groupByRoom) {
      return (
        <div className="space-y-6">
          {Array.from(groupedDevices.entries()).map(([roomId, { name, devices }]) => (
            <EntityDashboardSection
              key={roomId}
              title={name}
              devices={devices}
              entityValues={entityValues}
              pendingCommands={pendingCommands}
              onControl={onControl}
            />
          ))}
        </div>
      );
    }

    // Flat view
    return (
      <div className="widget-grid">
        {allDevices.map((device) => (
          <DeviceWidgetGroup
            key={device.id}
            device={device}
            entityValues={entityValues}
            pendingCommands={pendingCommands}
            onControl={onControl}
          />
        ))}
      </div>
    );
  }
);

EntityDashboard.displayName = 'EntityDashboard';

export default EntityDashboardSection;
