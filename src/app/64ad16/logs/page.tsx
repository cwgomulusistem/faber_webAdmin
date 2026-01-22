'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ScrollText, 
  Filter, 
  Download,
  Calendar,
  User,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
} from 'lucide-react';
import { DataTable, Column } from '../../../components/admin';
import { adminService, AuditLog } from '../../../services/admin.service';
import styles from './page.module.css';

const actionTypes = [
  { value: '', label: 'Tüm İşlemler' },
  { value: 'BAN_DEVICE', label: 'Cihaz Yasakla' },
  { value: 'UNBAN_DEVICE', label: 'Yasak Kaldır' },
  { value: 'CONTROL_DEVICE', label: 'Cihaz Kontrol' },
  { value: 'EXECUTE_SCENE', label: 'Senaryo Çalıştır' },
  { value: 'UPDATE_USER', label: 'Kullanıcı Güncelle' },
  { value: 'DELETE_USER', label: 'Kullanıcı Sil' },
  { value: 'ACTIVATE_USER', label: 'Kullanıcı Aktif Et' },
  { value: 'DEACTIVATE_USER', label: 'Kullanıcı Pasif Et' },
  { value: 'FIRMWARE_UPLOAD', label: 'Firmware Yükle' },
  { value: 'ROLLOUT_START', label: 'Rollout Başlat' },
];

const entityTypes = [
  { value: '', label: 'Tüm Kaynaklar' },
  { value: 'device', label: 'Cihaz' },
  { value: 'user', label: 'Kullanıcı' },
  { value: 'scene', label: 'Senaryo' },
  { value: 'firmware', label: 'Firmware' },
  { value: 'rollout', label: 'Rollout' },
];

const getActionIcon = (action: string) => {
  if (action.includes('BAN') || action.includes('DELETE') || action.includes('DEACTIVATE')) {
    return <AlertTriangle size={14} className={styles.iconWarning} />;
  }
  if (action.includes('UNBAN') || action.includes('ACTIVATE') || action.includes('CREATE')) {
    return <CheckCircle size={14} className={styles.iconSuccess} />;
  }
  if (action.includes('CONTROL') || action.includes('EXECUTE')) {
    return <Activity size={14} className={styles.iconPrimary} />;
  }
  return <Info size={14} className={styles.iconInfo} />;
};

const getActionLabel = (action: string) => {
  const found = actionTypes.find(a => a.value === action);
  return found?.label || action;
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockLogs: AuditLog[] = [
        {
          id: 'log-1',
          action: 'BAN_DEVICE',
          entityType: 'device',
          entityId: 'device-123',
          userId: 'admin-1',
          userEmail: 'admin@faber.com',
          details: { reason: 'Şüpheli aktivite tespit edildi' },
          ipAddress: '192.168.1.100',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'log-2',
          action: 'CONTROL_DEVICE',
          entityType: 'device',
          entityId: 'device-456',
          userId: 'admin-1',
          userEmail: 'admin@faber.com',
          details: { command: 'toggle', params: { state: true } },
          ipAddress: '192.168.1.100',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'log-3',
          action: 'EXECUTE_SCENE',
          entityType: 'scene',
          entityId: 'scene-789',
          userId: 'admin-2',
          userEmail: 'support@faber.com',
          details: { sceneName: 'Gece Modu' },
          ipAddress: '192.168.1.101',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'log-4',
          action: 'DEACTIVATE_USER',
          entityType: 'user',
          entityId: 'user-321',
          userId: 'admin-1',
          userEmail: 'admin@faber.com',
          details: { reason: 'Kullanıcı talebi' },
          ipAddress: '192.168.1.100',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'log-5',
          action: 'FIRMWARE_UPLOAD',
          entityType: 'firmware',
          entityId: 'fw-001',
          userId: 'admin-1',
          userEmail: 'admin@faber.com',
          details: { version: 'v2.3.1', deviceType: 'RELAY' },
          ipAddress: '192.168.1.100',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'log-6',
          action: 'ROLLOUT_START',
          entityType: 'rollout',
          entityId: 'ro-001',
          userId: 'admin-1',
          userEmail: 'admin@faber.com',
          details: { firmwareId: 'fw-001', targetDevices: 150 },
          ipAddress: '192.168.1.100',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
        {
          id: 'log-7',
          action: 'UNBAN_DEVICE',
          entityType: 'device',
          entityId: 'device-123',
          userId: 'admin-2',
          userEmail: 'support@faber.com',
          details: { reason: 'Yanlış alarm' },
          ipAddress: '192.168.1.101',
          createdAt: new Date(Date.now() - 345600000).toISOString(),
        },
      ];

      // Apply filters
      let filtered = mockLogs;
      
      if (actionFilter) {
        filtered = filtered.filter(l => l.action === actionFilter);
      }
      if (entityFilter) {
        filtered = filtered.filter(l => l.entityType === entityFilter);
      }
      if (startDate) {
        filtered = filtered.filter(l => new Date(l.createdAt) >= new Date(startDate));
      }
      if (endDate) {
        filtered = filtered.filter(l => new Date(l.createdAt) <= new Date(endDate + 'T23:59:59'));
      }

      setLogs(filtered);
    } catch (error) {
      console.error('Loglar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, entityFilter, startDate, endDate]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleExport = () => {
    // CSV export
    const headers = ['Tarih', 'İşlem', 'Kaynak', 'Kaynak ID', 'Kullanıcı', 'IP Adresi'];
    const rows = logs.map(log => [
      formatDate(log.createdAt),
      getActionLabel(log.action),
      log.entityType,
      log.entityId,
      log.userEmail || '-',
      log.ipAddress || '-',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'createdAt',
      title: 'Tarih',
      sortable: true,
      width: '180px',
      render: (value) => (
        <span className={styles.timestamp}>{formatDate(value)}</span>
      ),
    },
    {
      key: 'action',
      title: 'İşlem',
      sortable: true,
      render: (value) => (
        <div className={styles.actionCell}>
          {getActionIcon(value)}
          <span>{getActionLabel(value)}</span>
        </div>
      ),
    },
    {
      key: 'entityType',
      title: 'Kaynak',
      sortable: true,
      render: (value, log) => (
        <div className={styles.entityCell}>
          <span className={styles.entityType}>{value}</span>
          <span className={styles.entityId}>{log.entityId}</span>
        </div>
      ),
    },
    {
      key: 'userEmail',
      title: 'Kullanıcı',
      sortable: true,
      render: (value) => (
        <div className={styles.userCell}>
          <User size={14} />
          <span>{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'ipAddress',
      title: 'IP Adresi',
      render: (value) => (
        <span className={styles.ipAddress}>{value || '-'}</span>
      ),
    },
    {
      key: 'details',
      title: 'Detay',
      render: (value) => value ? (
        <span className={styles.detailsPreview}>
          {JSON.stringify(value).substring(0, 50)}...
        </span>
      ) : '-',
    },
  ];

  const filterActions = (
    <div className={styles.filtersRow}>
      <select
        value={actionFilter}
        onChange={(e) => setActionFilter(e.target.value)}
        className={styles.filterSelect}
      >
        {actionTypes.map(type => (
          <option key={type.value} value={type.value}>{type.label}</option>
        ))}
      </select>
      <select
        value={entityFilter}
        onChange={(e) => setEntityFilter(e.target.value)}
        className={styles.filterSelect}
      >
        {entityTypes.map(type => (
          <option key={type.value} value={type.value}>{type.label}</option>
        ))}
      </select>
      <div className={styles.dateFilter}>
        <Calendar size={14} />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={styles.dateInput}
        />
        <span>-</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={styles.dateInput}
        />
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Audit Logları</h1>
          <p className={styles.subtitle}>Sistem işlemlerini incele</p>
        </div>
        <button className={styles.exportBtn} onClick={handleExport}>
          <Download size={18} />
          <span>CSV İndir</span>
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filtersContainer}>
        {filterActions}
        {(actionFilter || entityFilter || startDate || endDate) && (
          <button 
            className={styles.clearFilters}
            onClick={() => {
              setActionFilter('');
              setEntityFilter('');
              setStartDate('');
              setEndDate('');
            }}
          >
            <X size={14} />
            Filtreleri Temizle
          </button>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        data={logs}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="Kullanıcı veya kaynak ID ara..."
        pageSize={15}
        onRefresh={loadLogs}
        emptyMessage="Log kaydı bulunamadı"
      />
    </div>
  );
}
