'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, Search, Lightbulb, Power, Thermometer, Fan, 
  Lock, Camera, Gauge, DoorOpen, Activity, 
  Droplets, CloudSun, Volume2, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HassContext, HassEntity } from '@/types/hass';

// ============================================
// Types
// ============================================

export interface DeviceConfig {
  id: string;
  entity_id: string;
  name: string;
  type: 'light' | 'switch' | 'climate' | 'sensor' | 'cover' | 'lock' | 'camera' | 'fan' | 'media_player';
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (device: Omit<DeviceConfig, 'id'>) => void;
  hass: HassContext;
  existingEntityIds: string[];
}

// ============================================
// Device Type Mapping
// ============================================

const DEVICE_TYPES: Record<string, { 
  label: string; 
  icon: React.ReactNode; 
  domains: string[];
  color: string;
}> = {
  light: { 
    label: 'Işık', 
    icon: <Lightbulb size={20} />, 
    domains: ['light'],
    color: '#ffd700'
  },
  switch: { 
    label: 'Anahtar', 
    icon: <Power size={20} />, 
    domains: ['switch', 'input_boolean'],
    color: '#03a9f4'
  },
  climate: { 
    label: 'Klima', 
    icon: <Thermometer size={20} />, 
    domains: ['climate'],
    color: '#ff9800'
  },
  fan: { 
    label: 'Fan', 
    icon: <Fan size={20} />, 
    domains: ['fan'],
    color: '#00bcd4'
  },
  cover: { 
    label: 'Perde/Kapı', 
    icon: <DoorOpen size={20} />, 
    domains: ['cover'],
    color: '#ff5722'
  },
  lock: { 
    label: 'Kilit', 
    icon: <Lock size={20} />, 
    domains: ['lock'],
    color: '#795548'
  },
  sensor: { 
    label: 'Sensör', 
    icon: <Gauge size={20} />, 
    domains: ['sensor', 'binary_sensor'],
    color: '#4caf50'
  },
  camera: { 
    label: 'Kamera', 
    icon: <Camera size={20} />, 
    domains: ['camera'],
    color: '#607d8b'
  },
  media_player: { 
    label: 'Medya', 
    icon: <Volume2 size={20} />, 
    domains: ['media_player'],
    color: '#9c27b0'
  },
};

function getDeviceType(entityId: string): keyof typeof DEVICE_TYPES {
  const domain = entityId.split('.')[0];
  for (const [type, config] of Object.entries(DEVICE_TYPES)) {
    if (config.domains.includes(domain)) {
      return type as keyof typeof DEVICE_TYPES;
    }
  }
  return 'sensor';
}

// ============================================
// Add Device Dialog Component
// ============================================

export function AddDeviceDialog({ open, onClose, onAdd, hass, existingEntityIds }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  
  // Get available entities
  const availableEntities = useMemo(() => {
    const entities = Object.entries(hass.states)
      .filter(([id]) => !existingEntityIds.includes(id))
      .map(([id, entity]) => ({
        id,
        name: entity.attributes.friendly_name || id,
        type: getDeviceType(id),
        state: entity.state,
        domain: id.split('.')[0],
      }));
    
    // Filter by search
    let filtered = entities;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = entities.filter(e => 
        e.name.toLowerCase().includes(query) || 
        e.id.toLowerCase().includes(query)
      );
    }
    
    // Filter by type
    if (selectedType) {
      const typeConfig = DEVICE_TYPES[selectedType];
      if (typeConfig) {
        filtered = filtered.filter(e => typeConfig.domains.includes(e.domain));
      }
    }
    
    return filtered;
  }, [hass.states, existingEntityIds, searchQuery, selectedType]);
  
  // Group entities by type
  const groupedEntities = useMemo(() => {
    const groups: Record<string, typeof availableEntities> = {};
    availableEntities.forEach(entity => {
      if (!groups[entity.type]) {
        groups[entity.type] = [];
      }
      groups[entity.type].push(entity);
    });
    return groups;
  }, [availableEntities]);
  
  // Handle add
  const handleAdd = () => {
    if (!selectedEntity) return;
    
    const entity = availableEntities.find(e => e.id === selectedEntity);
    if (!entity) return;
    
    onAdd({
      entity_id: entity.id,
      name: customName || entity.name,
      type: entity.type as DeviceConfig['type'],
    });
    
    // Reset
    setSelectedEntity(null);
    setCustomName('');
    onClose();
  };
  
  if (!open) return null;
  
  const selectedEntityData = selectedEntity 
    ? availableEntities.find(e => e.id === selectedEntity)
    : null;
  
  return (
    <div className="ha-dialog-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ha-dialog" style={{ maxWidth: '700px', maxHeight: '80vh' }}>
        <div className="ha-dialog__header">
          <h2 className="ha-dialog__title">Cihaz Ekle</h2>
          <button className="ha-dialog__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="ha-dialog__content" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Search & Filters */}
          <div className="p-4 border-b border-[var(--divider-color)]">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary-text-color)]" />
              <input
                type="text"
                placeholder="Cihaz ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 rounded-lg',
                  'bg-[var(--secondary-background-color)]',
                  'border border-[var(--divider-color)]',
                  'focus:border-[var(--primary-color)] focus:outline-none',
                  'text-[var(--primary-text-color)]'
                )}
              />
            </div>
            
            {/* Type Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType(null)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  selectedType === null
                    ? 'bg-[var(--primary-color)] text-white'
                    : 'bg-[var(--divider-color)] text-[var(--secondary-text-color)] hover:bg-[var(--secondary-background-color)]'
                )}
              >
                Tümü
              </button>
              {Object.entries(DEVICE_TYPES).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    selectedType === type
                      ? 'text-white'
                      : 'bg-[var(--divider-color)] text-[var(--secondary-text-color)] hover:bg-[var(--secondary-background-color)]'
                  )}
                  style={selectedType === type ? { backgroundColor: config.color } : undefined}
                >
                  {config.icon}
                  {config.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Entity List */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: '300px' }}>
            {availableEntities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity size={48} className="text-[var(--divider-color)] mb-4" />
                <p className="text-[var(--secondary-text-color)]">
                  {searchQuery ? 'Arama sonucu bulunamadı' : 'Eklenecek cihaz yok'}
                </p>
              </div>
            ) : (
              Object.entries(groupedEntities).map(([type, entities]) => (
                <div key={type} className="border-b border-[var(--divider-color)] last:border-0">
                  {/* Group Header */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--secondary-background-color)]">
                    <span style={{ color: DEVICE_TYPES[type]?.color }}>
                      {DEVICE_TYPES[type]?.icon}
                    </span>
                    <span className="text-sm font-medium text-[var(--primary-text-color)]">
                      {DEVICE_TYPES[type]?.label || type}
                    </span>
                    <span className="text-xs text-[var(--secondary-text-color)]">
                      ({entities.length})
                    </span>
                  </div>
                  
                  {/* Entities */}
                  {entities.map(entity => (
                    <button
                      key={entity.id}
                      onClick={() => {
                        setSelectedEntity(entity.id);
                        setCustomName(entity.name);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3',
                        'hover:bg-[var(--divider-color)] transition-colors',
                        selectedEntity === entity.id && 'bg-[var(--primary-color)]/10'
                      )}
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ 
                          backgroundColor: `${DEVICE_TYPES[entity.type]?.color}20`,
                          color: DEVICE_TYPES[entity.type]?.color
                        }}
                      >
                        {DEVICE_TYPES[entity.type]?.icon}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium text-[var(--primary-text-color)] truncate">
                          {entity.name}
                        </div>
                        <div className="text-xs text-[var(--secondary-text-color)] truncate">
                          {entity.id}
                        </div>
                      </div>
                      <div className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        entity.state === 'on' || entity.state === 'home'
                          ? 'bg-[var(--success-color)]/10 text-[var(--success-color)]'
                          : 'bg-[var(--divider-color)] text-[var(--secondary-text-color)]'
                      )}>
                        {entity.state}
                      </div>
                      {selectedEntity === entity.id && (
                        <Check size={20} className="text-[var(--primary-color)]" />
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
          
          {/* Selected Entity Config */}
          {selectedEntityData && (
            <div className="p-4 border-t border-[var(--divider-color)] bg-[var(--secondary-background-color)]">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: DEVICE_TYPES[selectedEntityData.type]?.color }}
                >
                  {DEVICE_TYPES[selectedEntityData.type]?.icon}
                </div>
                <div>
                  <div className="font-medium text-[var(--primary-text-color)]">
                    {selectedEntityData.name}
                  </div>
                  <div className="text-xs text-[var(--secondary-text-color)]">
                    {selectedEntityData.id}
                  </div>
                </div>
              </div>
              
              {/* Custom Name */}
              <label className="block text-sm font-medium text-[var(--primary-text-color)] mb-2">
                Özel İsim (Opsiyonel)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={selectedEntityData.name}
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg',
                  'bg-[var(--card-background-color)]',
                  'border border-[var(--divider-color)]',
                  'focus:border-[var(--primary-color)] focus:outline-none',
                  'text-[var(--primary-text-color)]'
                )}
              />
            </div>
          )}
        </div>
        
        <div className="ha-dialog__footer">
          <button onClick={onClose} className="ha-btn ha-btn--secondary">
            İptal
          </button>
          <button 
            onClick={handleAdd} 
            className="ha-btn ha-btn--primary"
            disabled={!selectedEntity}
          >
            Ekle
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddDeviceDialog;
