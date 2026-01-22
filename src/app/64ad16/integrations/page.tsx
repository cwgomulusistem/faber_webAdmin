'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Puzzle, 
  Plus, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Trash2,
  RefreshCw,
  Cloud,
  Wifi,
  Bluetooth,
  Radio,
  X,
  ExternalLink,
} from 'lucide-react';
import styles from './page.module.css';

interface Integration {
  id: string;
  domain: string;
  name: string;
  description: string;
  type: 'device' | 'hub' | 'service' | 'helper';
  iotClass: string;
  version: string;
  isOfficial: boolean;
  isEnabled: boolean;
  iconUrl?: string;
  configCount: number;
  deviceCount: number;
}

const getIoTClassIcon = (iotClass: string) => {
  switch (iotClass) {
    case 'local_push':
    case 'local_polling':
      return <Wifi size={16} />;
    case 'cloud_push':
    case 'cloud_polling':
      return <Cloud size={16} />;
    case 'bluetooth':
      return <Bluetooth size={16} />;
    default:
      return <Radio size={16} />;
  }
};

const getIoTClassLabel = (iotClass: string) => {
  switch (iotClass) {
    case 'local_push': return 'Yerel Push';
    case 'local_polling': return 'Yerel Polling';
    case 'cloud_push': return 'Cloud Push';
    case 'cloud_polling': return 'Cloud Polling';
    case 'bluetooth': return 'Bluetooth';
    default: return iotClass;
  }
};

export default function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadIntegrations = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockIntegrations: Integration[] = [
        {
          id: 'int-1',
          domain: 'faber',
          name: 'Faber IoT',
          description: 'Faber akıllı ev cihazları entegrasyonu. Röle, dimmer, RGB ışık ve sensör cihazlarını destekler.',
          type: 'device',
          iotClass: 'local_push',
          version: '2.3.0',
          isOfficial: true,
          isEnabled: true,
          iconUrl: '/icons/faber.png',
          configCount: 1,
          deviceCount: 156,
        },
        {
          id: 'int-2',
          domain: 'mqtt',
          name: 'MQTT',
          description: 'MQTT protokolü üzerinden cihaz bağlantısı. Üçüncü parti cihazları entegre etmek için kullanılır.',
          type: 'hub',
          iotClass: 'local_push',
          version: '1.5.0',
          isOfficial: true,
          isEnabled: true,
          configCount: 1,
          deviceCount: 0,
        },
        {
          id: 'int-3',
          domain: 'tuya',
          name: 'Tuya',
          description: 'Tuya/Smart Life cihazları için cloud entegrasyonu. Yakında!',
          type: 'hub',
          iotClass: 'cloud_polling',
          version: '0.0.1',
          isOfficial: false,
          isEnabled: false,
          configCount: 0,
          deviceCount: 0,
        },
        {
          id: 'int-4',
          domain: 'zigbee',
          name: 'Zigbee',
          description: 'Zigbee protokolü desteği. Zigbee koordinatör gerektirir. Yakında!',
          type: 'hub',
          iotClass: 'local_push',
          version: '0.0.1',
          isOfficial: false,
          isEnabled: false,
          configCount: 0,
          deviceCount: 0,
        },
        {
          id: 'int-5',
          domain: 'zwave',
          name: 'Z-Wave',
          description: 'Z-Wave protokolü desteği. Z-Wave controller gerektirir. Yakında!',
          type: 'hub',
          iotClass: 'local_push',
          version: '0.0.1',
          isOfficial: false,
          isEnabled: false,
          configCount: 0,
          deviceCount: 0,
        },
        {
          id: 'int-6',
          domain: 'google_assistant',
          name: 'Google Assistant',
          description: 'Google Home ve Assistant entegrasyonu. Sesli kontrol desteği. Yakında!',
          type: 'service',
          iotClass: 'cloud_push',
          version: '0.0.1',
          isOfficial: false,
          isEnabled: false,
          configCount: 0,
          deviceCount: 0,
        },
      ];

      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Entegrasyonlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  const handleToggleIntegration = (integration: Integration) => {
    setIntegrations(prev => prev.map(i => 
      i.id === integration.id ? { ...i, isEnabled: !i.isEnabled } : i
    ));
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Entegrasyonlar</h1>
          <p className={styles.subtitle}>Cihaz ve servis entegrasyonlarını yönet</p>
        </div>
        <button 
          className={styles.addBtn} 
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} />
          <span>Entegrasyon Ekle</span>
        </button>
      </div>

      {/* Info Card */}
      <div className={styles.infoCard}>
        <div className={styles.infoIcon}>
          <Puzzle size={24} />
        </div>
        <div className={styles.infoContent}>
          <h3>Home Assistant Benzeri Entegrasyon Sistemi</h3>
          <p>
            Bu bölüm, Faber IoT cihazlarının yanı sıra üçüncü parti cihaz ve servisleri de 
            sisteme entegre etmenizi sağlar. Şu an aktif olan entegrasyonlar listelenmektedir.
            Yeni entegrasyonlar yakında eklenecektir.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{integrations.filter(i => i.isEnabled).length}</span>
          <span className={styles.statLabel}>Aktif Entegrasyon</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{integrations.reduce((sum, i) => sum + i.configCount, 0)}</span>
          <span className={styles.statLabel}>Yapılandırma</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{integrations.reduce((sum, i) => sum + i.deviceCount, 0)}</span>
          <span className={styles.statLabel}>Toplam Cihaz</span>
        </div>
      </div>

      {/* Integration List */}
      <div className={styles.integrationGrid}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`${styles.integrationCard} ${styles.skeleton}`}>
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonText} />
              </div>
            </div>
          ))
        ) : (
          integrations.map(integration => (
            <div 
              key={integration.id} 
              className={`${styles.integrationCard} ${!integration.isEnabled ? styles.disabled : ''}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.integrationIcon}>
                  {integration.iconUrl ? (
                    <img src={integration.iconUrl} alt={integration.name} />
                  ) : (
                    <Puzzle size={24} />
                  )}
                </div>
                <div className={styles.integrationInfo}>
                  <div className={styles.integrationTitle}>
                    <h3>{integration.name}</h3>
                    {integration.isOfficial && (
                      <span className={styles.officialBadge}>Resmi</span>
                    )}
                  </div>
                  <span className={styles.integrationDomain}>{integration.domain}</span>
                </div>
                <div className={styles.integrationStatus}>
                  {integration.isEnabled ? (
                    <CheckCircle size={20} className={styles.statusEnabled} />
                  ) : (
                    <XCircle size={20} className={styles.statusDisabled} />
                  )}
                </div>
              </div>

              <p className={styles.integrationDesc}>{integration.description}</p>

              <div className={styles.integrationMeta}>
                <div className={styles.metaItem}>
                  {getIoTClassIcon(integration.iotClass)}
                  <span>{getIoTClassLabel(integration.iotClass)}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.versionBadge}>v{integration.version}</span>
                </div>
              </div>

              <div className={styles.integrationStats}>
                <div className={styles.integrationStat}>
                  <span className={styles.integrationStatValue}>{integration.configCount}</span>
                  <span className={styles.integrationStatLabel}>Yapılandırma</span>
                </div>
                <div className={styles.integrationStat}>
                  <span className={styles.integrationStatValue}>{integration.deviceCount}</span>
                  <span className={styles.integrationStatLabel}>Cihaz</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <button 
                  className={styles.cardBtn}
                  onClick={() => handleToggleIntegration(integration)}
                >
                  {integration.isEnabled ? 'Devre Dışı Bırak' : 'Etkinleştir'}
                </button>
                <button className={`${styles.cardBtn} ${styles.iconBtn}`}>
                  <Settings size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Entegrasyon Ekle</h2>
              <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.comingSoon}>
                <AlertTriangle size={48} />
                <h3>Yakında!</h3>
                <p>
                  Yeni entegrasyon ekleme özelliği henüz geliştirme aşamasındadır. 
                  Tuya, Zigbee, Z-Wave ve diğer popüler protokoller yakında eklenecektir.
                </p>
                <a 
                  href="https://www.home-assistant.io/integrations/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.externalLink}
                >
                  <span>Home Assistant Entegrasyonlarına Göz At</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={`${styles.modalBtn} ${styles.secondary}`}
                onClick={() => setShowAddModal(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
