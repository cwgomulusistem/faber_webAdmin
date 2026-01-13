'use client';

// Device Card Component
// Card for displaying device status and controls

import React, { useState } from 'react';
import { Power, MoreVertical, Wifi, WifiOff } from 'lucide-react';
import { getDeviceIcon } from '../../utils/formatters';
import type { Device } from '../../types/device.types';
import styles from './DeviceCard.module.css';

interface DeviceCardProps {
  device: Device;
  onToggle?: (device: Device) => Promise<void>;
  onEdit?: (device: Device) => void;
}

export function DeviceCard({ device, onToggle, onEdit }: DeviceCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isOn = device.attributes?.on ?? false;

  const handleToggle = async () => {
    if (isLoading || !onToggle) return;
    
    setIsLoading(true);
    try {
      await onToggle(device);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.card} ${isOn ? styles.active : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.deviceIcon}>
          <span>{getDeviceIcon(device.type)}</span>
        </div>
        <div className={styles.status}>
          {device.isOnline ? (
            <Wifi size={14} className={styles.online} />
          ) : (
            <WifiOff size={14} className={styles.offline} />
          )}
        </div>
        {onEdit && (
          <button 
            className={styles.menuBtn}
            onClick={() => onEdit(device)}
            title="Düzenle"
          >
            <MoreVertical size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.name}>{device.name}</h3>
        <span className={styles.type}>
          {device.type.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        {/* Brightness Slider (if dimmer) */}
        {device.capabilities?.includes('DIM') && (
          <div className={styles.sliderWrapper}>
            <input
              type="range"
              min="0"
              max="100"
              value={device.attributes?.brightness ?? 100}
              className={styles.slider}
              disabled={!isOn}
            />
            <span className={styles.sliderValue}>
              {device.attributes?.brightness ?? 100}%
            </span>
          </div>
        )}

        {/* Power Toggle */}
        <button 
          className={`${styles.powerBtn} ${isOn ? styles.on : ''}`}
          onClick={handleToggle}
          disabled={isLoading || !device.isOnline}
          title={isOn ? 'Kapat' : 'Aç'}
        >
          <Power size={20} className={isLoading ? styles.spinning : ''} />
        </button>
      </div>
    </div>
  );
}

export default DeviceCard;
