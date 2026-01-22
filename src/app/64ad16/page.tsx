'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Users, 
  Home, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { StatsCard } from '../../components/admin';
import styles from './page.module.css';

// Mock data - gerçek uygulamada API'den gelecek
interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  totalUsers: number;
  activeUsers: number;
  totalHomes: number;
  pendingUpdates: number;
  criticalAlerts: number;
}

interface RecentActivity {
  id: string;
  type: 'device_online' | 'device_offline' | 'user_register' | 'firmware_update' | 'error';
  message: string;
  timestamp: string;
}

interface DeviceTypeStats {
  type: string;
  count: number;
  online: number;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeStats[]>([]);

  useEffect(() => {
    // Simüle edilmiş veri yükleme
    const loadData = async () => {
      setLoading(true);
      
      // API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats({
        totalDevices: 1247,
        onlineDevices: 1089,
        offlineDevices: 158,
        totalUsers: 342,
        activeUsers: 289,
        totalHomes: 156,
        pendingUpdates: 23,
        criticalAlerts: 5,
      });

      setRecentActivity([
        { id: '1', type: 'device_online', message: 'Cihaz "Salon Lambası" çevrimiçi oldu', timestamp: '2 dakika önce' },
        { id: '2', type: 'user_register', message: 'Yeni kullanıcı kaydı: ahmet@example.com', timestamp: '15 dakika önce' },
        { id: '3', type: 'firmware_update', message: 'Firmware v2.3.1 yayınlandı', timestamp: '1 saat önce' },
        { id: '4', type: 'device_offline', message: '3 cihaz çevrimdışı oldu', timestamp: '2 saat önce' },
        { id: '5', type: 'error', message: 'MQTT bağlantı hatası algılandı', timestamp: '3 saat önce' },
        { id: '6', type: 'device_online', message: '12 yeni cihaz eklendi', timestamp: '5 saat önce' },
      ]);

      setDeviceTypes([
        { type: 'Röle', count: 456, online: 412 },
        { type: 'Dimmer', count: 234, online: 201 },
        { type: 'RGB Işık', count: 189, online: 178 },
        { type: 'Sensör', count: 312, online: 256 },
        { type: 'Termostat', count: 56, online: 42 },
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'device_online': return <Wifi size={16} className={styles.activityIconOnline} />;
      case 'device_offline': return <WifiOff size={16} className={styles.activityIconOffline} />;
      case 'user_register': return <Users size={16} className={styles.activityIconUser} />;
      case 'firmware_update': return <TrendingUp size={16} className={styles.activityIconUpdate} />;
      case 'error': return <AlertTriangle size={16} className={styles.activityIconError} />;
      default: return <Activity size={16} />;
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Sistem durumu ve genel bakış</p>
        </div>
        <button className={styles.refreshBtn} onClick={handleRefresh} disabled={loading}>
          <RefreshCw size={18} className={loading ? styles.spinning : ''} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatsCard
          title="Toplam Cihaz"
          value={stats?.totalDevices ?? 0}
          icon={Cpu}
          color="purple"
          trend={{ value: 12, isPositive: true }}
          subtitle={`${stats?.onlineDevices ?? 0} çevrimiçi`}
          loading={loading}
        />
        <StatsCard
          title="Toplam Kullanıcı"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          color="blue"
          trend={{ value: 8, isPositive: true }}
          subtitle={`${stats?.activeUsers ?? 0} aktif`}
          loading={loading}
        />
        <StatsCard
          title="Toplam Ev"
          value={stats?.totalHomes ?? 0}
          icon={Home}
          color="green"
          trend={{ value: 5, isPositive: true }}
          loading={loading}
        />
        <StatsCard
          title="Kritik Uyarı"
          value={stats?.criticalAlerts ?? 0}
          icon={AlertTriangle}
          color="red"
          subtitle="Acil müdahale gerekli"
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Device Status */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Cihaz Durumu</h2>
            <span className={styles.cardBadge}>Anlık</span>
          </div>
          <div className={styles.deviceStatusContent}>
            <div className={styles.statusCircle}>
              <svg viewBox="0 0 36 36" className={styles.statusSvg}>
                <path
                  className={styles.statusBg}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={styles.statusProgress}
                  strokeDasharray={`${((stats?.onlineDevices ?? 0) / (stats?.totalDevices || 1)) * 100}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className={styles.statusValue}>
                <span className={styles.statusPercent}>
                  {stats ? Math.round((stats.onlineDevices / stats.totalDevices) * 100) : 0}%
                </span>
                <span className={styles.statusLabel}>Çevrimiçi</span>
              </div>
            </div>
            <div className={styles.statusLegend}>
              <div className={styles.legendItem}>
                <CheckCircle size={16} className={styles.legendIconOnline} />
                <span>Çevrimiçi</span>
                <strong>{stats?.onlineDevices ?? 0}</strong>
              </div>
              <div className={styles.legendItem}>
                <XCircle size={16} className={styles.legendIconOffline} />
                <span>Çevrimdışı</span>
                <strong>{stats?.offlineDevices ?? 0}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Device Types */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Cihaz Tipleri</h2>
          </div>
          <div className={styles.deviceTypesContent}>
            {deviceTypes.map((dt) => (
              <div key={dt.type} className={styles.deviceTypeItem}>
                <div className={styles.deviceTypeInfo}>
                  <span className={styles.deviceTypeName}>{dt.type}</span>
                  <span className={styles.deviceTypeCount}>{dt.count} cihaz</span>
                </div>
                <div className={styles.deviceTypeBar}>
                  <div 
                    className={styles.deviceTypeProgress}
                    style={{ width: `${(dt.online / dt.count) * 100}%` }}
                  />
                </div>
                <span className={styles.deviceTypePercent}>
                  {Math.round((dt.online / dt.count) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${styles.card} ${styles.activityCard}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Son Aktiviteler</h2>
            <Clock size={16} className={styles.cardIcon} />
          </div>
          <div className={styles.activityList}>
            {recentActivity.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className={styles.activityContent}>
                  <span className={styles.activityMessage}>{activity.message}</span>
                  <span className={styles.activityTime}>{activity.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Hızlı İşlemler</h2>
          </div>
          <div className={styles.quickActions}>
            <a href="/64ad16/devices" className={styles.quickActionBtn}>
              <Cpu size={20} />
              <span>Cihazları Yönet</span>
            </a>
            <a href="/64ad16/users" className={styles.quickActionBtn}>
              <Users size={20} />
              <span>Kullanıcıları Gör</span>
            </a>
            <a href="/64ad16/firmware" className={styles.quickActionBtn}>
              <TrendingUp size={20} />
              <span>Firmware Güncelle</span>
            </a>
            <a href="/64ad16/logs" className={styles.quickActionBtn}>
              <Activity size={20} />
              <span>Logları İncele</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
