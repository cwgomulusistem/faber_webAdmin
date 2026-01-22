'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileCode2, 
  Upload, 
  Play,
  Pause,
  XCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  X,
  RefreshCw,
  Rocket,
  Download,
  HardDrive,
  TestTube,
  Send,
  Wifi,
} from 'lucide-react';
import { DataTable, Column } from '../../../components/admin';
import { 
  firmwareService, 
  FirmwareVersion, 
  FirmwareRollout, 
  RolloutStatus,
  CheckUpdateResponse,
} from '../../../services/firmware.service';
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

const rolloutStatusLabels: Record<RolloutStatus, { label: string; color: string }> = {
  pending: { label: 'Bekliyor', color: 'gray' },
  in_progress: { label: 'Devam Ediyor', color: 'blue' },
  paused: { label: 'Duraklatıldı', color: 'orange' },
  completed: { label: 'Tamamlandı', color: 'green' },
  failed: { label: 'Başarısız', color: 'red' },
  cancelled: { label: 'İptal Edildi', color: 'gray' },
};

type TabType = 'versions' | 'rollouts' | 'ota-test';

export default function AdminFirmwarePage() {
  const [activeTab, setActiveTab] = useState<TabType>('versions');
  const [firmwares, setFirmwares] = useState<FirmwareVersion[]>([]);
  const [rollouts, setRollouts] = useState<FirmwareRollout[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRolloutModal, setShowRolloutModal] = useState(false);
  const [selectedFirmware, setSelectedFirmware] = useState<FirmwareVersion | null>(null);
  
  // Upload form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    deviceType: 'RELAY',
    version: '',
    releaseNote: '',
    isBeta: false,
  });
  const [uploading, setUploading] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');

  // OTA Test states
  const [otaTestData, setOtaTestData] = useState({
    deviceType: 'RELAY',
    currentVersion: '',
    macAddress: '',
    includeBeta: false,
  });
  const [otaTestResult, setOtaTestResult] = useState<CheckUpdateResponse | null>(null);
  const [otaTestLoading, setOtaTestLoading] = useState(false);

  const loadFirmwares = useCallback(async () => {
    setLoading(true);
    try {
      // Simüle edilmiş veri
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockFirmwares: FirmwareVersion[] = [
        {
          id: 'fw-1',
          deviceType: 'RELAY',
          version: 'v2.3.1',
          fileName: 'relay_v2.3.1.bin',
          fileSize: 524288,
          checksum: 'a1b2c3d4e5f6',
          releaseNote: 'Bug fixes and performance improvements',
          isActive: true,
          isBeta: false,
          createdBy: 'admin',
          createdAt: '2024-12-15T10:30:00Z',
          updatedAt: '2024-12-15T10:30:00Z',
        },
        {
          id: 'fw-2',
          deviceType: 'DIMMER',
          version: 'v2.2.0',
          fileName: 'dimmer_v2.2.0.bin',
          fileSize: 612345,
          checksum: 'b2c3d4e5f6g7',
          releaseNote: 'New dimming curve support',
          isActive: true,
          isBeta: false,
          createdBy: 'admin',
          createdAt: '2024-12-10T14:20:00Z',
          updatedAt: '2024-12-10T14:20:00Z',
        },
        {
          id: 'fw-3',
          deviceType: 'RELAY',
          version: 'v2.4.0-beta',
          fileName: 'relay_v2.4.0-beta.bin',
          fileSize: 545000,
          checksum: 'c3d4e5f6g7h8',
          releaseNote: 'Beta: New scheduling features',
          isActive: true,
          isBeta: true,
          createdBy: 'admin',
          createdAt: '2024-12-20T09:15:00Z',
          updatedAt: '2024-12-20T09:15:00Z',
        },
      ];

      let filtered = mockFirmwares;
      if (typeFilter) {
        filtered = filtered.filter(f => f.deviceType === typeFilter);
      }

      setFirmwares(filtered);
    } catch (error) {
      console.error('Firmware listesi yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  const loadRollouts = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockRollouts: FirmwareRollout[] = [
        {
          id: 'ro-1',
          firmwareId: 'fw-1',
          deviceType: 'RELAY',
          status: 'completed',
          targetDevices: 150,
          updatedDevices: 148,
          failedDevices: 2,
          targetPercentage: 100,
          startedAt: '2024-12-16T10:00:00Z',
          completedAt: '2024-12-16T14:30:00Z',
          createdBy: 'admin',
          createdAt: '2024-12-15T15:00:00Z',
          updatedAt: '2024-12-16T14:30:00Z',
        },
        {
          id: 'ro-2',
          firmwareId: 'fw-2',
          deviceType: 'DIMMER',
          status: 'in_progress',
          targetDevices: 80,
          updatedDevices: 45,
          failedDevices: 1,
          targetPercentage: 50,
          startedAt: '2024-12-21T09:00:00Z',
          createdBy: 'admin',
          createdAt: '2024-12-20T16:00:00Z',
          updatedAt: '2024-12-21T11:00:00Z',
        },
        {
          id: 'ro-3',
          firmwareId: 'fw-3',
          deviceType: 'RELAY',
          status: 'pending',
          targetDevices: 150,
          updatedDevices: 0,
          failedDevices: 0,
          targetPercentage: 10,
          createdBy: 'admin',
          createdAt: '2024-12-21T10:00:00Z',
          updatedAt: '2024-12-21T10:00:00Z',
        },
      ];

      setRollouts(mockRollouts);
    } catch (error) {
      console.error('Rollout listesi yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'versions') {
      loadFirmwares();
    } else {
      loadRollouts();
    }
  }, [activeTab, loadFirmwares, loadRollouts]);

  const handleUpload = async () => {
    if (!uploadFile || !uploadData.version) return;
    
    setUploading(true);
    try {
      // await firmwareService.uploadFirmware(uploadFile, uploadData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add to list
      const newFirmware: FirmwareVersion = {
        id: `fw-${Date.now()}`,
        deviceType: uploadData.deviceType,
        version: uploadData.version,
        fileName: uploadFile.name,
        fileSize: uploadFile.size,
        checksum: 'new-checksum',
        releaseNote: uploadData.releaseNote,
        isActive: true,
        isBeta: uploadData.isBeta,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setFirmwares(prev => [newFirmware, ...prev]);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadData({ deviceType: 'RELAY', version: '', releaseNote: '', isBeta: false });
    } catch (error) {
      console.error('Upload başarısız:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateRollout = async () => {
    if (!selectedFirmware) return;
    
    try {
      const newRollout: FirmwareRollout = {
        id: `ro-${Date.now()}`,
        firmwareId: selectedFirmware.id,
        deviceType: selectedFirmware.deviceType,
        status: 'pending',
        targetDevices: 100,
        updatedDevices: 0,
        failedDevices: 0,
        targetPercentage: 100,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setRollouts(prev => [newRollout, ...prev]);
      setShowRolloutModal(false);
      setSelectedFirmware(null);
      setActiveTab('rollouts');
    } catch (error) {
      console.error('Rollout oluşturulamadı:', error);
    }
  };

  const handleOtaTest = async () => {
    if (!otaTestData.deviceType || !otaTestData.currentVersion || !otaTestData.macAddress) {
      return;
    }

    setOtaTestLoading(true);
    setOtaTestResult(null);

    try {
      // Simüle edilmiş API çağrısı - gerçek implementasyonda firmwareService.checkForUpdate kullanılacak
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock response
      const mockResponse: CheckUpdateResponse = {
        updateAvailable: Math.random() > 0.3, // %70 ihtimalle güncelleme var
        currentVersion: otaTestData.currentVersion,
        latestVersion: 'v2.5.0',
        downloadUrl: '/api/v1/firmware/download/fw-123',
        fileSize: 524288,
        checksum: 'abc123def456',
        releaseNote: 'Bug fixes and performance improvements',
        firmwareId: 'fw-123',
      };

      setOtaTestResult(mockResponse);
    } catch (error) {
      console.error('OTA test başarısız:', error);
    } finally {
      setOtaTestLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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

  const firmwareColumns: Column<FirmwareVersion>[] = [
    {
      key: 'status',
      title: 'Durum',
      width: '80px',
      render: (_, fw) => (
        <div className={styles.statusCell}>
          {fw.isActive ? (
            <span className={`${styles.statusBadge} ${styles.active}`}>
              <CheckCircle size={14} />
            </span>
          ) : (
            <span className={`${styles.statusBadge} ${styles.inactive}`}>
              <XCircle size={14} />
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'version',
      title: 'Versiyon',
      sortable: true,
      render: (_, fw) => (
        <div className={styles.versionInfo}>
          <span className={styles.versionNumber}>{fw.version}</span>
          {fw.isBeta && <span className={styles.betaBadge}>BETA</span>}
        </div>
      ),
    },
    {
      key: 'deviceType',
      title: 'Cihaz Tipi',
      sortable: true,
      render: (value) => (
        <span className={styles.deviceType}>
          {deviceTypes.find(t => t.value === value)?.label || value}
        </span>
      ),
    },
    {
      key: 'fileSize',
      title: 'Boyut',
      render: (value) => formatFileSize(value),
    },
    {
      key: 'createdAt',
      title: 'Yükleme Tarihi',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      title: 'İşlemler',
      width: '140px',
      render: (_, fw) => (
        <div className={styles.actions}>
          <button 
            className={styles.actionBtn}
            onClick={() => { setSelectedFirmware(fw); setShowRolloutModal(true); }}
            title="Rollout Başlat"
          >
            <Rocket size={16} />
          </button>
          <button 
            className={styles.actionBtn}
            title="İndir"
          >
            <Download size={16} />
          </button>
          <button 
            className={`${styles.actionBtn} ${styles.delete}`}
            title="Sil"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const rolloutColumns: Column<FirmwareRollout>[] = [
    {
      key: 'status',
      title: 'Durum',
      width: '140px',
      render: (value: RolloutStatus) => {
        const statusInfo = rolloutStatusLabels[value];
        return (
          <span className={`${styles.rolloutStatus} ${styles[statusInfo.color]}`}>
            {value === 'in_progress' && <RefreshCw size={14} className={styles.spinning} />}
            {value === 'completed' && <CheckCircle size={14} />}
            {value === 'failed' && <XCircle size={14} />}
            {value === 'pending' && <Clock size={14} />}
            {value === 'paused' && <Pause size={14} />}
            {value === 'cancelled' && <XCircle size={14} />}
            <span>{statusInfo.label}</span>
          </span>
        );
      },
    },
    {
      key: 'deviceType',
      title: 'Cihaz Tipi',
      sortable: true,
      render: (value) => (
        <span className={styles.deviceType}>
          {deviceTypes.find(t => t.value === value)?.label || value}
        </span>
      ),
    },
    {
      key: 'progress',
      title: 'İlerleme',
      render: (_, ro) => {
        const total = ro.updatedDevices + ro.failedDevices;
        const percent = ro.targetDevices > 0 ? Math.round((total / ro.targetDevices) * 100) : 0;
        return (
          <div className={styles.progressCell}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className={styles.progressText}>
              {ro.updatedDevices}/{ro.targetDevices}
            </span>
          </div>
        );
      },
    },
    {
      key: 'failedDevices',
      title: 'Başarısız',
      render: (value) => (
        <span className={value > 0 ? styles.failedCount : ''}>
          {value}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Oluşturulma',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      title: 'İşlemler',
      width: '120px',
      render: (_, ro) => (
        <div className={styles.actions}>
          {ro.status === 'pending' && (
            <button 
              className={`${styles.actionBtn} ${styles.start}`}
              title="Başlat"
            >
              <Play size={16} />
            </button>
          )}
          {ro.status === 'in_progress' && (
            <button 
              className={`${styles.actionBtn} ${styles.pause}`}
              title="Duraklat"
            >
              <Pause size={16} />
            </button>
          )}
          <button 
            className={styles.actionBtn}
            title="Detay"
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Firmware Yönetimi</h1>
          <p className={styles.subtitle}>OTA güncelleme ve firmware versiyonlarını yönet</p>
        </div>
        <button 
          className={styles.uploadBtn} 
          onClick={() => setShowUploadModal(true)}
        >
          <Upload size={18} />
          <span>Firmware Yükle</span>
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'versions' ? styles.active : ''}`}
          onClick={() => setActiveTab('versions')}
        >
          <FileCode2 size={18} />
          <span>Versiyonlar</span>
          <span className={styles.tabBadge}>{firmwares.length}</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'rollouts' ? styles.active : ''}`}
          onClick={() => setActiveTab('rollouts')}
        >
          <Rocket size={18} />
          <span>Rolloutlar</span>
          <span className={styles.tabBadge}>{rollouts.length}</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'ota-test' ? styles.active : ''}`}
          onClick={() => setActiveTab('ota-test')}
        >
          <TestTube size={18} />
          <span>OTA Test</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'versions' && (
        <DataTable
          data={firmwares}
          columns={firmwareColumns}
          loading={loading}
          searchable={true}
          searchPlaceholder="Versiyon veya dosya adı ara..."
          pageSize={10}
          onRefresh={loadFirmwares}
          actions={
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={styles.filterSelect}
            >
              {deviceTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          }
          emptyMessage="Firmware versiyonu bulunamadı"
        />
      )}
      
      {activeTab === 'rollouts' && (
        <DataTable
          data={rollouts}
          columns={rolloutColumns}
          loading={loading}
          searchable={false}
          pageSize={10}
          onRefresh={loadRollouts}
          emptyMessage="Rollout bulunamadı"
        />
      )}

      {activeTab === 'ota-test' && (
        <div className={styles.otaTestSection}>
          <div className={styles.otaTestCard}>
            <div className={styles.otaTestHeader}>
              <Wifi size={24} />
              <div>
                <h3>Güncelleme Kontrolü Testi</h3>
                <p>Cihaz bilgilerini girerek OTA güncelleme akışını test edin</p>
              </div>
            </div>

            <div className={styles.otaTestForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Cihaz Tipi *</label>
                  <select
                    value={otaTestData.deviceType}
                    onChange={(e) => setOtaTestData(prev => ({ ...prev, deviceType: e.target.value }))}
                  >
                    {deviceTypes.slice(1).map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Mevcut Versiyon *</label>
                  <input
                    type="text"
                    value={otaTestData.currentVersion}
                    onChange={(e) => setOtaTestData(prev => ({ ...prev, currentVersion: e.target.value }))}
                    placeholder="ör: v2.1.0"
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>MAC Adresi *</label>
                <input
                  type="text"
                  value={otaTestData.macAddress}
                  onChange={(e) => setOtaTestData(prev => ({ ...prev, macAddress: e.target.value }))}
                  placeholder="ör: AA:BB:CC:DD:EE:FF"
                />
              </div>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={otaTestData.includeBeta}
                  onChange={(e) => setOtaTestData(prev => ({ ...prev, includeBeta: e.target.checked }))}
                />
                <span>Beta sürümlerini dahil et</span>
              </label>

              <button 
                className={styles.testBtn}
                onClick={handleOtaTest}
                disabled={otaTestLoading || !otaTestData.currentVersion || !otaTestData.macAddress}
              >
                {otaTestLoading ? (
                  <>
                    <RefreshCw size={18} className={styles.spinning} />
                    <span>Kontrol Ediliyor...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Güncelleme Kontrolü Yap</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Result */}
            {otaTestResult && (
              <div className={styles.otaTestResult}>
                <h4>Test Sonucu</h4>
                
                <div className={`${styles.resultStatus} ${otaTestResult.updateAvailable ? styles.hasUpdate : styles.noUpdate}`}>
                  {otaTestResult.updateAvailable ? (
                    <>
                      <CheckCircle size={24} />
                      <span>Güncelleme Mevcut!</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={24} />
                      <span>Cihaz Güncel</span>
                    </>
                  )}
                </div>

                <div className={styles.resultDetails}>
                  <div className={styles.resultRow}>
                    <span>Mevcut Versiyon:</span>
                    <strong>{otaTestResult.currentVersion}</strong>
                  </div>
                  
                  {otaTestResult.updateAvailable && (
                    <>
                      <div className={styles.resultRow}>
                        <span>Yeni Versiyon:</span>
                        <strong className={styles.newVersion}>{otaTestResult.latestVersion}</strong>
                      </div>
                      <div className={styles.resultRow}>
                        <span>Dosya Boyutu:</span>
                        <strong>{formatFileSize(otaTestResult.fileSize || 0)}</strong>
                      </div>
                      <div className={styles.resultRow}>
                        <span>Checksum:</span>
                        <code>{otaTestResult.checksum}</code>
                      </div>
                      <div className={styles.resultRow}>
                        <span>İndirme URL:</span>
                        <code className={styles.downloadUrl}>{otaTestResult.downloadUrl}</code>
                      </div>
                      {otaTestResult.releaseNote && (
                        <div className={styles.resultRow}>
                          <span>Sürüm Notları:</span>
                          <p>{otaTestResult.releaseNote}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className={styles.apiExample}>
                  <h5>API İstek Örneği</h5>
                  <pre>
{`POST /api/v1/firmware/check-update
Content-Type: application/json

{
  "deviceType": "${otaTestData.deviceType}",
  "currentVersion": "${otaTestData.currentVersion}",
  "macAddress": "${otaTestData.macAddress}",
  "includeBeta": ${otaTestData.includeBeta}
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* OTA Flow Explanation */}
          <div className={styles.otaFlowCard}>
            <h3>OTA Güncelleme Akışı</h3>
            <div className={styles.flowSteps}>
              <div className={styles.flowStep}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Versiyon Kontrolü</h4>
                  <p>Cihaz <code>POST /firmware/check-update</code> endpoint&apos;ine mevcut versiyonunu gönderir</p>
                </div>
              </div>
              <div className={styles.flowStep}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Karşılaştırma</h4>
                  <p>Sunucu, cihaz tipi için en son versiyonu bulur ve karşılaştırır</p>
                </div>
              </div>
              <div className={styles.flowStep}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>İndirme</h4>
                  <p>Yeni versiyon varsa, cihaz verilen URL&apos;den dosyayı indirir (GUID isimli dosya)</p>
                </div>
              </div>
              <div className={styles.flowStep}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Durum Raporu</h4>
                  <p>Cihaz güncelleme durumunu <code>POST /firmware/report-status</code> ile bildirir</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUploadModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Firmware Yükle</h2>
              <button className={styles.closeBtn} onClick={() => setShowUploadModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.uploadZone} onClick={() => document.getElementById('fileInput')?.click()}>
                <input
                  id="fileInput"
                  type="file"
                  accept=".bin,.elf,.hex"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  hidden
                />
                {uploadFile ? (
                  <div className={styles.selectedFile}>
                    <HardDrive size={32} />
                    <span>{uploadFile.name}</span>
                    <span className={styles.fileSize}>{formatFileSize(uploadFile.size)}</span>
                  </div>
                ) : (
                  <>
                    <Upload size={40} />
                    <p>Firmware dosyasını seçin veya sürükleyin</p>
                    <span>.bin, .elf, .hex formatları desteklenir</span>
                  </>
                )}
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Cihaz Tipi *</label>
                  <select
                    value={uploadData.deviceType}
                    onChange={(e) => setUploadData(prev => ({ ...prev, deviceType: e.target.value }))}
                  >
                    {deviceTypes.slice(1).map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Versiyon *</label>
                  <input
                    type="text"
                    value={uploadData.version}
                    onChange={(e) => setUploadData(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="ör: v2.3.1"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Sürüm Notları</label>
                <textarea
                  value={uploadData.releaseNote}
                  onChange={(e) => setUploadData(prev => ({ ...prev, releaseNote: e.target.value }))}
                  placeholder="Bu sürümde yapılan değişiklikler..."
                  rows={3}
                />
              </div>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={uploadData.isBeta}
                  onChange={(e) => setUploadData(prev => ({ ...prev, isBeta: e.target.checked }))}
                />
                <span>Beta sürümü olarak işaretle</span>
              </label>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={`${styles.modalBtn} ${styles.secondary}`}
                onClick={() => setShowUploadModal(false)}
              >
                İptal
              </button>
              <button 
                className={`${styles.modalBtn} ${styles.primary}`}
                onClick={handleUpload}
                disabled={!uploadFile || !uploadData.version || uploading}
              >
                {uploading ? (
                  <>
                    <RefreshCw size={16} className={styles.spinning} />
                    <span>Yükleniyor...</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Yükle</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rollout Modal */}
      {showRolloutModal && selectedFirmware && (
        <div className={styles.modalOverlay} onClick={() => setShowRolloutModal(false)}>
          <div className={`${styles.modal} ${styles.confirmModal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Rollout Oluştur</h2>
              <button className={styles.closeBtn} onClick={() => setShowRolloutModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p className={styles.confirmText}>
                <strong>{selectedFirmware.version}</strong> versiyonunu 
                <strong> {deviceTypes.find(t => t.value === selectedFirmware.deviceType)?.label}</strong> cihazlarına 
                dağıtmak için rollout oluşturulacak.
              </p>
              {selectedFirmware.isBeta && (
                <p className={styles.warningText}>
                  <AlertTriangle size={16} />
                  Bu bir beta sürümüdür. Dikkatli olun!
                </p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={`${styles.modalBtn} ${styles.secondary}`}
                onClick={() => setShowRolloutModal(false)}
              >
                İptal
              </button>
              <button 
                className={`${styles.modalBtn} ${styles.primary}`}
                onClick={handleCreateRollout}
              >
                <Rocket size={16} />
                <span>Rollout Oluştur</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
