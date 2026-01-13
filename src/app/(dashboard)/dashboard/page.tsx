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
import { StatsCard } from '../../../components/common';
import { DeviceCard } from '../../../components/devices';
import { useDevices } from '../../../hooks/useDevices';
import { homeService } from '../../../services/home.service';
import { sceneService } from '../../../services/scene.service';
import type { Home as HomeType } from '../../../types/home.types';
import type { Scene } from '../../../types/scene.types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import styles from './page.module.css';

// Chart colors
const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6'];

export default function DashboardPage() {
  const [homes, setHomes] = useState<HomeType[]>([]);
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null);
  const [activeScenes, setActiveScenes] = useState<Scene[]>([]);
  
  const { devices, isLoading, toggleDevice } = useDevices({ 
    homeId: selectedHomeId || undefined 
  });

  // Fetch homes and active scenes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userHomes = await homeService.getHomes();
        setHomes(userHomes);
        if (userHomes.length > 0 && !selectedHomeId) {
          const defaultHome = userHomes.find(h => h.isDefault) || userHomes[0];
          setSelectedHomeId(defaultHome.id);
          
          const scenes = await sceneService.getActiveScenes(defaultHome.id);
          setActiveScenes(scenes);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchData();
  }, [selectedHomeId]);

  // Calculations
  const onlineCount = devices.filter(d => d.isOnline).length;
  const currentTotalPower = devices.reduce((sum, d) => sum + (d.attributes?.power || 0), 0);
  
  // Chart Data: Device Status Distribution
  const deviceStatusData = [
    { name: 'Çevrimiçi', value: onlineCount },
    { name: 'Çevrimdışı', value: devices.length - onlineCount },
  ];

  // Display devices (limited to 6 for dashboard)
  const displayDevices = devices.slice(0, 6);

  return (
    <div className={styles.dashboard}>
      {/* Home Selector */}
      {homes.length > 1 && (
        <div className={styles.homeSelector}>
          <select 
            value={selectedHomeId || ''} 
            onChange={(e) => setSelectedHomeId(e.target.value)}
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
          value={devices.length}
          icon={Cpu}
          iconColor="#3b82f6"
        />
        <StatsCard
          title="Çevrimiçi"
          value={onlineCount}
          icon={Activity}
          iconColor="#22c55e"
          subtitle={`${devices.length ? Math.round((onlineCount / devices.length) * 100) : 0}% aktif`}
        />
        <StatsCard
          title="Odalar"
          value={homes.find(h => h.id === selectedHomeId)?.rooms?.length || 0}
          icon={Home}
          iconColor="#8b5cf6"
        />
        <StatsCard
          title="Aktif Senaryolar"
          value={activeScenes.length}
          icon={Layers}
          iconColor="#f59e0b"
        />
        <StatsCard
          title="Anlık Güç"
          value={`${currentTotalPower.toFixed(1)} W`}
          icon={Zap}
          iconColor="#06b6d4"
        />
        <StatsCard
          title="Uyarılar"
          value={0} // No alerts endpoint yet
          icon={AlertCircle}
          iconColor="#ef4444"
        />
      </section>

      {/* Charts Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
           <h2 className={styles.sectionTitle}>Cihaz Durumu</h2>
        </div>
        <div className={styles.chartContainer} style={{ height: 300, background: 'white', borderRadius: 16, padding: '1rem' }}>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
             </ResponsiveContainer>
        </div>
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
