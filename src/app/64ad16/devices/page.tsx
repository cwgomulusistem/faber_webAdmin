'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  Ban, 
  MoreVertical,
  Power,
  RefreshCw,
  Filter,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  X,
} from 'lucide-react';
import { DataTable, Column } from '../../../components/admin';
import { adminService, AdminDevice } from '../../../services/admin.service';
import styles from './page.module.css';

// Device Type Options
const deviceTypes = [
  { value: '', label: 'Tüm Tipler' },
  { value: 'RELAY', label: 'Röle' },
  { value: 'DIMMER', label: 'Dimmer' },
  { value: 'RGB_LIGHT', label: 'RGB Işık' },
  { value: 'SWITCH', label: 'Anahtar' },
  { value: 'OUTLET', label: 'Priz' },
  { value: 'SENSOR', label: 'Sensör' },
  { value: 'THERMOSTAT', label: 'Termostat' },
];

const statusOptions = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'online', label: 'Çevrimiçi' },
  { value: 'offline', label: 'Çevrimdışı' },
  { value: 'banned', label: 'Yasaklı' },
];

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<AdminDevice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadDevices = useCallback(async () => {
    setLoading(true);
    try {
      // Simüle edilmiş veri - gerçek API bağlantısı için adminService.getDevices() kullanılacak
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockDevices: AdminDevice[] = [
        {
          id: '1',
          macAddress: 'AA:BB:CC:DD:EE:01',
          name: 'Salon Lambası',
          type: 'RELAY',
          firmwareVersion: 'v2.3.1',
          isOnline: true,
          isBanned: false,
          lastSeen: new Date().toISOString(),
          homeId: 'home-1',
          homeName: 'Ahmet Ev',
          roomId: 'room-1',
          roomName: 'Salon',
          userId: 'user-1',
          userEmail: 'ahmet@example.com',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          macAddress: 'AA:BB:CC:DD:EE:02',
          name: 'Yatak Odası Dimmer',
          type: 'DIMMER',
          firmwareVersion: 'v2.2.0',
          isOnline: true,
          isBanned: false,
          lastSeen: new Date().toISOString(),
          homeId: 'home-1',
          homeName: 'Ahmet Ev',
          roomId: 'room-2',
          roomName: 'Yatak Odası',
          userId: 'user-1',
          userEmail: 'ahmet@example.com',
          createdAt: '2024-02-10T14:20:00Z',
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          macAddress: 'AA:BB:CC:DD:EE:03',
          name: 'Mutfak RGB',
          type: 'RGB_LIGHT',
          firmwareVersion: 'v2.1.5',
          isOnline: false,
          isBanned: false,
          lastSeen: '2024-12-01T08:45:00Z',
          homeId: 'home-2',
          homeName: 'Mehmet Daire',
          roomId: 'room-3',
          roomName: 'Mutfak',
          userId: 'user-2',
          userEmail: 'mehmet@example.com',
          createdAt: '2024-03-05T09:15:00Z',
          updatedAt: '2024-12-01T08:45:00Z',
        },
        {
          id: '4',
          macAddress: 'AA:BB:CC:DD:EE:04',
          name: 'Sıcaklık Sensörü',
          type: 'SENSOR',
          firmwareVersion: 'v1.8.2',
          isOnline: true,
          isBanned: true,
          lastSeen: new Date().toISOString(),
          homeId: 'home-3',
          homeName: 'Ayşe Villa',
          roomId: 'room-4',
          roomName: 'Bahçe',
          userId: 'user-3',
          userEmail: 'ayse@example.com',
          createdAt: '2024-01-20T11:00:00Z',
          updatedAt: new Date().toISOString(),
        },
        {
          id: '5',
          macAddress: 'AA:BB:CC:DD:EE:05',
          name: 'Termostat',
          type: 'THERMOSTAT',
          firmwareVersion: 'v2.0.0',
          isOnline: true,
          isBanned: false,
          lastSeen: new Date().toISOString(),
          homeId: 'home-1',
          homeName: 'Ahmet Ev',
          roomId: 'room-1',
          roomName: 'Salon',
          userId: 'user-1',
          userEmail: 'ahmet@example.com',
          createdAt: '2024-04-12T16:30:00Z',
          updatedAt: new Date().toISOString(),
        },
      ];

      // Filter devices
      let filtered = mockDevices;
      
      if (typeFilter) {
        filtered = filtered.filter(d => d.type === typeFilter);
      }
      
      if (statusFilter === 'online') {
        filtered = filtered.filter(d => d.isOnline && !d.isBanned);
      } else if (statusFilter === 'offline') {
        filtered = filtered.filter(d => !d.isOnline);
      } else if (statusFilter === 'banned') {
        filtered = filtered.filter(d => d.isBanned);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(d => 
          d.name.toLowerCase().includes(query) ||
          d.macAddress.toLowerCase().includes(query) ||
          d.userEmail?.toLowerCase().includes(query)
        );
      }

      setDevices(filtered);
    } catch (error) {
      console.error('Cihazlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, searchQuery]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const handleBanDevice = async (device: AdminDevice) => {
    try {
      // await adminService.banDevice(device.id, !device.isBanned);
      setDevices(prev => prev.map(d => 
        d.id === device.id ? { ...d, isBanned: !d.isBanned } : d
      ));
      setShowBanModal(false);
      setSelectedDevice(null);
    } catch (error) {
      console.error('Ban işlemi başarısız:', error);
    }
  };

  const handleControlDevice = async (device: AdminDevice, action: string) => {
    try {
      // await adminService.controlDevice(device.id, { action });
      console.log(`Cihaz kontrolü: ${device.name} - ${action}`);
    } catch (error) {
      console.error('Kontrol işlemi başarısız:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns: Column<AdminDevice>[] = [
    {
      key: 'status',
      title: 'Durum',
      width: '80px',
      render: (_, device) => (
        <div className={styles.statusCell}>
          {device.isBanned ? (
            <span className={styles.statusBanned} title="Yasaklı">
              <Ban size={16} />
            </span>
          ) : device.isOnline ? (
            <span className={styles.statusOnline} title="Çevrimiçi">
              <Wifi size={16} />
            </span>
          ) : (
            <span className={styles.statusOffline} title="Çevrimdışı">
              <WifiOff size={16} />
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      title: 'Cihaz Adı',
      sortable: true,
      render: (_, device) => (
        <div className={styles.deviceInfo}>
          <span className={styles.deviceName}>{device.name}</span>
          <span className={styles.deviceMac}>{device.macAddress}</span>
        </div>
      ),
    },
    {
      key: 'type',
      title: 'Tip',
      sortable: true,
      render: (value) => (
        <span className={styles.deviceType}>
          {deviceTypes.find(t => t.value === value)?.label || value}
        </span>
      ),
    },
    {
      key: 'firmwareVersion',
      title: 'Firmware',
      sortable: true,
    },
    {
      key: 'homeName',
      title: 'Ev / Oda',
      render: (_, device) => (
        <div className={styles.locationInfo}>
          <span>{device.homeName || '-'}</span>
          <span className={styles.roomName}>{device.roomName || '-'}</span>
        </div>
      ),
    },
    {
      key: 'userEmail',
      title: 'Kullanıcı',
      sortable: true,
    },
    {
      key: 'lastSeen',
      title: 'Son Görülme',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      title: 'İşlemler',
      width: '120px',
      render: (_, device) => (
        <div className={styles.actions}>
          <button 
            className={styles.actionBtn}
            onClick={() => { setSelectedDevice(device); setShowDetailModal(true); }}
            title="Detay"
          >
            <Eye size={16} />
          </button>
          <button 
            className={`${styles.actionBtn} ${device.isBanned ? styles.unban : styles.ban}`}
            onClick={() => { setSelectedDevice(device); setShowBanModal(true); }}
            title={device.isBanned ? 'Yasağı Kaldır' : 'Yasakla'}
          >
            <Ban size={16} />
          </button>
          <button 
            className={styles.actionBtn}
            onClick={() => handleControlDevice(device, 'toggle')}
            title="Aç/Kapat"
            disabled={device.isBanned || !device.isOnline}
          >
            <Power size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filterActions = (
    <>
      <select
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
        className={styles.filterSelect}
      >
        {deviceTypes.map(type => (
          <option key={type.value} value={type.value}>{type.label}</option>
        ))}
      </select>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className={styles.filterSelect}
      >
        {statusOptions.map(status => (
          <option key={status.value} value={status.value}>{status.label}</option>
        ))}
      </select>
    </>
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cihaz Yönetimi</h1>
          <p className={styles.subtitle}>Tüm cihazları görüntüle ve yönet</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statItem}>
            <Cpu size={18} />
            <span>{devices.length} Cihaz</span>
          </div>
          <div className={`${styles.statItem} ${styles.online}`}>
            <CheckCircle size={18} />
            <span>{devices.filter(d => d.isOnline && !d.isBanned).length} Çevrimiçi</span>
          </div>
          <div className={`${styles.statItem} ${styles.offline}`}>
            <XCircle size={18} />
            <span>{devices.filter(d => !d.isOnline).length} Çevrimdışı</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={devices}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="Cihaz adı, MAC veya kullanıcı ara..."
        pageSize={10}
        onRefresh={loadDevices}
        onExport={() => console.log('Export devices')}
        actions={filterActions}
        emptyMessage="Filtrelere uygun cihaz bulunamadı"
      />

      {/* Detail Modal */}
      {showDetailModal && selectedDevice && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Cihaz Detayı</h2>
              <button className={styles.closeBtn} onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <label>Cihaz Adı</label>
                  <span>{selectedDevice.name}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>MAC Adresi</label>
                  <span className={styles.mono}>{selectedDevice.macAddress}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Tip</label>
                  <span>{deviceTypes.find(t => t.value === selectedDevice.type)?.label}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Firmware</label>
                  <span>{selectedDevice.firmwareVersion}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Durum</label>
                  <span className={selectedDevice.isBanned ? styles.textBanned : selectedDevice.isOnline ? styles.textOnline : styles.textOffline}>
                    {selectedDevice.isBanned ? 'Yasaklı' : selectedDevice.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <label>Ev</label>
                  <span>{selectedDevice.homeName || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Oda</label>
                  <span>{selectedDevice.roomName || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Kullanıcı</label>
                  <span>{selectedDevice.userEmail || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Son Görülme</label>
                  <span>{formatDate(selectedDevice.lastSeen)}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Kayıt Tarihi</label>
                  <span>{formatDate(selectedDevice.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={`${styles.modalBtn} ${styles.secondary}`}
                onClick={() => setShowDetailModal(false)}
              >
                Kapat
              </button>
              <button 
                className={`${styles.modalBtn} ${selectedDevice.isBanned ? styles.success : styles.danger}`}
                onClick={() => { setShowDetailModal(false); setShowBanModal(true); }}
              >
                {selectedDevice.isBanned ? 'Yasağı Kaldır' : 'Yasakla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Confirmation Modal */}
      {showBanModal && selectedDevice && (
        <div className={styles.modalOverlay} onClick={() => setShowBanModal(false)}>
          <div className={`${styles.modal} ${styles.confirmModal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedDevice.isBanned ? 'Yasağı Kaldır' : 'Cihazı Yasakla'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowBanModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p className={styles.confirmText}>
                <strong>{selectedDevice.name}</strong> ({selectedDevice.macAddress}) cihazını 
                {selectedDevice.isBanned ? ' yasak listesinden çıkarmak' : ' yasaklamak'} istediğinize emin misiniz?
              </p>
              {!selectedDevice.isBanned && (
                <p className={styles.warningText}>
                  Yasaklanan cihazlar sisteme bağlanamaz ve kontrol edilemez.
                </p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={`${styles.modalBtn} ${styles.secondary}`}
                onClick={() => setShowBanModal(false)}
              >
                İptal
              </button>
              <button 
                className={`${styles.modalBtn} ${selectedDevice.isBanned ? styles.success : styles.danger}`}
                onClick={() => handleBanDevice(selectedDevice)}
              >
                {selectedDevice.isBanned ? 'Yasağı Kaldır' : 'Yasakla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
