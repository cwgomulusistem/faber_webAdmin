'use client';

// Devices Page
// Full device management page

import React, { useState } from 'react';
import { Plus, Filter, Grid, List, Search } from 'lucide-react';
import { DeviceCard } from '../../../../components/devices';
import { useDevices } from '../../../../hooks/useDevices';
import { DeviceType } from '../../../../types/device.types';
import styles from './page.module.css';

const deviceTypes: { value: DeviceType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tümü' },
  { value: DeviceType.RELAY, label: 'Röle' },
  { value: DeviceType.DIMMER, label: 'Dimmer' },
  { value: DeviceType.RGB_LIGHT, label: 'RGB Işık' },
  { value: DeviceType.SWITCH, label: 'Anahtar' },
  { value: DeviceType.OUTLET, label: 'Priz' },
  { value: DeviceType.SENSOR, label: 'Sensör' },
  { value: DeviceType.THERMOSTAT, label: 'Termostat' },
];

export default function DevicesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<DeviceType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { devices, isLoading, error, toggleDevice, refresh } = useDevices();

  // Filter devices
  const filteredDevices = devices.filter(device => {
    const matchesType = typeFilter === 'ALL' || device.type === typeFilter;
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const onlineCount = filteredDevices.filter(d => d.isOnline).length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Cihazlar</h1>
          <span className={styles.count}>
            {filteredDevices.length} cihaz ({onlineCount} çevrimiçi)
          </span>
        </div>
        <button className={styles.addBtn}>
          <Plus size={18} />
          <span>Cihaz Ekle</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* Search */}
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Cihaz ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Type Filter */}
        <div className={styles.filterGroup}>
          <Filter size={16} />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as DeviceType | 'ALL')}
            className={styles.filterSelect}
          >
            {deviceTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid görünümü"
          >
            <Grid size={18} />
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
            title="Liste görünümü"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={refresh}>Tekrar Dene</button>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Cihazlar yükleniyor...</p>
        </div>
      ) : filteredDevices.length > 0 ? (
        <div className={viewMode === 'grid' ? styles.grid : styles.list}>
          {filteredDevices.map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              onToggle={toggleDevice}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>
            {searchQuery || typeFilter !== 'ALL' 
              ? 'Filtrelere uygun cihaz bulunamadı' 
              : 'Henüz cihaz eklenmemiş'}
          </p>
        </div>
      )}
    </div>
  );
}
