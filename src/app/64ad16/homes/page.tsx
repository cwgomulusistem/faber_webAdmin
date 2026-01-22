'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Home, 
  User, 
  Cpu, 
  Layers,
  DoorOpen,
  Eye,
  X,
  Calendar,
  Mail,
} from 'lucide-react';
import { DataTable, Column } from '../../../components/admin';
import { adminService, AdminHome } from '../../../services/admin.service';
import styles from './page.module.css';

export default function AdminHomesPage() {
  const [homes, setHomes] = useState<AdminHome[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHome, setSelectedHome] = useState<AdminHome | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadHomes = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockHomes: AdminHome[] = [
        {
          id: 'home-1',
          name: 'Ahmet Ev',
          userId: 'user-1',
          userEmail: 'ahmet@example.com',
          roomCount: 5,
          deviceCount: 15,
          sceneCount: 4,
          isDefault: true,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'home-2',
          name: 'Ahmet Yazlık',
          userId: 'user-1',
          userEmail: 'ahmet@example.com',
          roomCount: 3,
          deviceCount: 8,
          sceneCount: 2,
          isDefault: false,
          createdAt: '2024-02-10T14:20:00Z',
          updatedAt: '2024-12-01T08:45:00Z',
        },
        {
          id: 'home-3',
          name: 'Mehmet Daire',
          userId: 'user-2',
          userEmail: 'mehmet@example.com',
          roomCount: 4,
          deviceCount: 12,
          sceneCount: 3,
          isDefault: true,
          createdAt: '2024-03-05T09:15:00Z',
          updatedAt: '2024-12-15T12:00:00Z',
        },
        {
          id: 'home-4',
          name: 'Ayşe Villa',
          userId: 'user-3',
          userEmail: 'ayse@example.com',
          roomCount: 7,
          deviceCount: 25,
          sceneCount: 6,
          isDefault: true,
          createdAt: '2024-01-20T11:00:00Z',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'home-5',
          name: 'Fatma Ofis',
          userId: 'user-4',
          userEmail: 'fatma@example.com',
          roomCount: 2,
          deviceCount: 6,
          sceneCount: 1,
          isDefault: false,
          createdAt: '2024-04-12T16:30:00Z',
          updatedAt: '2024-11-20T10:00:00Z',
        },
      ];

      setHomes(mockHomes);
    } catch (error) {
      console.error('Evler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomes();
  }, [loadHomes]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns: Column<AdminHome>[] = [
    {
      key: 'name',
      title: 'Ev Adı',
      sortable: true,
      render: (_, home) => (
        <div className={styles.homeInfo}>
          <div className={styles.homeIcon}>
            <Home size={18} />
          </div>
          <div className={styles.homeDetails}>
            <span className={styles.homeName}>{home.name}</span>
            {home.isDefault && <span className={styles.defaultBadge}>Varsayılan</span>}
          </div>
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
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'roomCount',
      title: 'Odalar',
      sortable: true,
      render: (value) => (
        <div className={styles.countCell}>
          <DoorOpen size={14} />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'deviceCount',
      title: 'Cihazlar',
      sortable: true,
      render: (value) => (
        <div className={styles.countCell}>
          <Cpu size={14} />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'sceneCount',
      title: 'Senaryolar',
      sortable: true,
      render: (value) => (
        <div className={styles.countCell}>
          <Layers size={14} />
          <span>{value}</span>
        </div>
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
      width: '80px',
      render: (_, home) => (
        <div className={styles.actions}>
          <button 
            className={styles.actionBtn}
            onClick={() => { setSelectedHome(home); setShowDetailModal(true); }}
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
          <h1 className={styles.title}>Ev Yönetimi</h1>
          <p className={styles.subtitle}>Tüm evleri görüntüle</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statItem}>
            <Home size={18} />
            <span>{homes.length} Ev</span>
          </div>
          <div className={styles.statItem}>
            <DoorOpen size={18} />
            <span>{homes.reduce((sum, h) => sum + h.roomCount, 0)} Oda</span>
          </div>
          <div className={styles.statItem}>
            <Cpu size={18} />
            <span>{homes.reduce((sum, h) => sum + h.deviceCount, 0)} Cihaz</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={homes}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="Ev adı veya kullanıcı ara..."
        pageSize={10}
        onRefresh={loadHomes}
        emptyMessage="Ev bulunamadı"
      />

      {/* Detail Modal */}
      {showDetailModal && selectedHome && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Ev Detayı</h2>
              <button className={styles.closeBtn} onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.homeProfileHeader}>
                <div className={styles.profileIcon}>
                  <Home size={28} />
                </div>
                <div className={styles.profileInfo}>
                  <h3>{selectedHome.name}</h3>
                  {selectedHome.isDefault && (
                    <span className={styles.defaultBadge}>Varsayılan Ev</span>
                  )}
                </div>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <DoorOpen size={20} />
                  <span className={styles.statValue}>{selectedHome.roomCount}</span>
                  <span className={styles.statLabel}>Oda</span>
                </div>
                <div className={styles.statCard}>
                  <Cpu size={20} />
                  <span className={styles.statValue}>{selectedHome.deviceCount}</span>
                  <span className={styles.statLabel}>Cihaz</span>
                </div>
                <div className={styles.statCard}>
                  <Layers size={20} />
                  <span className={styles.statValue}>{selectedHome.sceneCount}</span>
                  <span className={styles.statLabel}>Senaryo</span>
                </div>
              </div>

              <div className={styles.detailList}>
                <div className={styles.detailItem}>
                  <Mail size={16} />
                  <div>
                    <label>Kullanıcı</label>
                    <span>{selectedHome.userEmail}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Calendar size={16} />
                  <div>
                    <label>Oluşturulma Tarihi</label>
                    <span>{formatDate(selectedHome.createdAt)}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Calendar size={16} />
                  <div>
                    <label>Son Güncelleme</label>
                    <span>{formatDate(selectedHome.updatedAt)}</span>
                  </div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
