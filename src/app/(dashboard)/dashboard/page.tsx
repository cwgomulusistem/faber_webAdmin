'use client';

// Dashboard Page
// Main dashboard with stats and device overview

import React, { useEffect, useState } from 'react';
import { 
  Cpu, 
  Home, 
  Layers, 
  Zap, 
  Activity,
  AlertCircle,
} from 'lucide-react';
import { StatsCard, TelemetryChart } from '../../../components/common';
import { DeviceCard } from '../../../components/devices';
import { useDevices } from '../../../hooks/useDevices';
import { homeService } from '../../../services/home.service';
import type { Home as HomeType } from '../../../types/home.types';
import styles from './page.module.css';

// Mock data for initial development
const mockStats = {
  totalDevices: 24,
  onlineDevices: 21,
  totalRooms: 8,
  activeScenes: 5,
  energyToday: 12.5,
  alerts: 2,
};

// Mock chart data
const mockEnergyData = [
  { time: '00:00', value: 0.5 },
  { time: '04:00', value: 0.4 },
  { time: '08:00', value: 1.2 },
  { time: '12:00', value: 2.8 },
  { time: '16:00', value: 2.5 },
  { time: '20:00', value: 3.5 },
  { time: '23:59', value: 1.8 },
];

export default function DashboardPage() {
  const [homes, setHomes] = useState<HomeType[]>([]);
  const [selectedHome, setSelectedHome] = useState<string | null>(null);
  const { devices, isLoading, toggleDevice } = useDevices({ 
    homeId: selectedHome || undefined 
  });

  // Fetch homes on mount
  useEffect(() => {
    const fetchHomes = async () => {
      try {
        const userHomes = await homeService.getHomes();
        setHomes(userHomes);
        if (userHomes.length > 0) {
          const defaultHome = userHomes.find(h => h.isDefault) || userHomes[0];
          setSelectedHomeId(defaultHome.id);
        }
      } catch (error) {
        console.error('Failed to fetch homes:', error);
      }
    };
    fetchHomes();
  }, []);

  // Display devices (limited to 6 for dashboard)
  const displayDevices = devices.slice(0, 6);
  const onlineCount = devices.filter(d => d.isOnline).length;
  
  // Helper to safely set selected home
  const setSelectedHomeId = (id: string) => {
    setSelectedHome(id);
  };

  return (
    <div className={styles.dashboard}>
      {/* Home Selector */}
      {homes.length > 1 && (
        <div className={styles.homeSelector}>
          <select 
            value={selectedHome || ''} 
            onChange={(e) => setSelectedHome(e.target.value)}
            className={styles.homeSelect}
          >
            {homes.map(home => (
              <option key={home.id} value={home.id}>{home.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Stats Grid */}
      <section className={styles.statsGrid}>
        <StatsCard
          title="Toplam Cihaz"
          value={devices.length || mockStats.totalDevices}
          icon={Cpu}
          iconColor="#3b82f6"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Çevrimiçi"
          value={onlineCount || mockStats.onlineDevices}
          icon={Activity}
          iconColor="#22c55e"
          subtitle={`${devices.length ? Math.round((onlineCount / devices.length) * 100) : 87}% aktif`}
        />
        <StatsCard
          title="Odalar"
          value={homes.find(h => h.id === selectedHome)?.rooms?.length || mockStats.totalRooms}
          icon={Home}
          iconColor="#8b5cf6"
        />
        <StatsCard
          title="Aktif Senaryolar"
          value={mockStats.activeScenes}
          icon={Layers}
          iconColor="#f59e0b"
        />
        <StatsCard
          title="Bugünkü Enerji"
          value={`${mockStats.energyToday} kWh`}
          icon={Zap}
          iconColor="#06b6d4"
          trend={{ value: 5, isPositive: false }}
        />
        <StatsCard
          title="Uyarılar"
          value={mockStats.alerts}
          icon={AlertCircle}
          iconColor="#ef4444"
        />
      </section>

      {/* Charts Section */}
      <section className={styles.section}>
        <TelemetryChart 
          title="Günlük Enerji Tüketimi" 
          data={mockEnergyData} 
          unit="kWh"
          color="#06b6d4"
        />
      </section>

      {/* Devices Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Cihazlar</h2>
          <a href="/dashboard/devices" className={styles.sectionLink}>
            Tümünü Gör →
          </a>
        </div>
        
        {isLoading ? (
          <div className={styles.loading}>Yükleniyor...</div>
        ) : displayDevices.length > 0 ? (
          <div className={styles.devicesGrid}>
            {displayDevices.map(device => (
              <DeviceCard
                key={device.id}
                device={device}
                onToggle={toggleDevice}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Cpu size={48} />
            <p>Henüz cihaz eklenmemiş</p>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Hızlı İşlemler</h2>
        </div>
        <div className={styles.quickActions}>
          <button className={styles.actionBtn}>
            <span className={styles.actionIcon}>💡</span>
            <span>Tüm Işıkları Kapat</span>
          </button>
          <button className={styles.actionBtn}>
            <span className={styles.actionIcon}>🏠</span>
            <span>Evden Ayrıl Modu</span>
          </button>
          <button className={styles.actionBtn}>
            <span className={styles.actionIcon}>🌙</span>
            <span>Gece Modu</span>
          </button>
          <button className={styles.actionBtn}>
            <span className={styles.actionIcon}>🎬</span>
            <span>Film Modu</span>
          </button>
        </div>
      </section>
    </div>
  );
}
