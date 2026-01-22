'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  MoreVertical,
  Eye,
  Trash2,
  Shield,
  Home,
  Cpu,
  X,
  Mail,
  Phone,
  Calendar,
  Clock,
} from 'lucide-react';
import { DataTable, Column } from '../../../components/admin';
import { adminService, AdminUser } from '../../../services/admin.service';
import styles from './page.module.css';

const statusOptions = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Pasif' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Simüle edilmiş veri
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockUsers: AdminUser[] = [
        {
          id: 'user-1',
          email: 'ahmet@example.com',
          fullName: 'Ahmet Yılmaz',
          phone: '+90 532 123 4567',
          isActive: true,
          provider: 'email',
          homeCount: 2,
          deviceCount: 15,
          lastLogin: new Date().toISOString(),
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'user-2',
          email: 'mehmet@example.com',
          fullName: 'Mehmet Demir',
          phone: '+90 533 234 5678',
          isActive: true,
          provider: 'google',
          homeCount: 1,
          deviceCount: 8,
          lastLogin: '2024-12-20T14:30:00Z',
          createdAt: '2024-02-10T14:20:00Z',
          updatedAt: '2024-12-20T14:30:00Z',
        },
        {
          id: 'user-3',
          email: 'ayse@example.com',
          fullName: 'Ayşe Kaya',
          phone: '+90 534 345 6789',
          isActive: false,
          provider: 'email',
          homeCount: 1,
          deviceCount: 5,
          lastLogin: '2024-11-15T09:00:00Z',
          createdAt: '2024-03-05T09:15:00Z',
          updatedAt: '2024-11-15T09:00:00Z',
        },
        {
          id: 'user-4',
          email: 'fatma@example.com',
          fullName: 'Fatma Öz',
          phone: undefined,
          isActive: true,
          provider: 'apple',
          homeCount: 3,
          deviceCount: 22,
          lastLogin: new Date().toISOString(),
          createdAt: '2024-01-20T11:00:00Z',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'user-5',
          email: 'ali@example.com',
          fullName: 'Ali Veli',
          phone: '+90 535 456 7890',
          isActive: true,
          provider: 'email',
          homeCount: 1,
          deviceCount: 4,
          lastLogin: '2024-12-22T16:45:00Z',
          createdAt: '2024-04-12T16:30:00Z',
          updatedAt: '2024-12-22T16:45:00Z',
        },
      ];

      // Filter users
      let filtered = mockUsers;
      
      if (statusFilter === 'active') {
        filtered = filtered.filter(u => u.isActive);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(u => !u.isActive);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(u => 
          u.email.toLowerCase().includes(query) ||
          u.fullName?.toLowerCase().includes(query) ||
          u.phone?.includes(query)
        );
      }

      setUsers(filtered);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleActive = async (user: AdminUser) => {
    try {
      // await adminService.updateUser(user.id, { isActive: !user.isActive });
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, isActive: !u.isActive } : u
      ));
    } catch (error) {
      console.error('Güncelleme başarısız:', error);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    try {
      // await adminService.deleteUser(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Silme işlemi başarısız:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'email': return 'E-posta';
      case 'google': return 'Google';
      case 'apple': return 'Apple';
      default: return provider;
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'status',
      title: 'Durum',
      width: '80px',
      render: (_, user) => (
        <div className={styles.statusCell}>
          {user.isActive ? (
            <span className={styles.statusActive} title="Aktif">
              <UserCheck size={16} />
            </span>
          ) : (
            <span className={styles.statusInactive} title="Pasif">
              <UserX size={16} />
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'fullName',
      title: 'Kullanıcı',
      sortable: true,
      render: (_, user) => (
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user.fullName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{user.fullName || '-'}</span>
            <span className={styles.userEmail}>{user.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'provider',
      title: 'Kayıt Yöntemi',
      render: (value) => (
        <span className={styles.provider}>
          {getProviderLabel(value)}
        </span>
      ),
    },
    {
      key: 'homeCount',
      title: 'Ev',
      sortable: true,
      render: (value) => (
        <div className={styles.countCell}>
          <Home size={14} />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'deviceCount',
      title: 'Cihaz',
      sortable: true,
      render: (value) => (
        <div className={styles.countCell}>
          <Cpu size={14} />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'lastLogin',
      title: 'Son Giriş',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'createdAt',
      title: 'Kayıt Tarihi',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      title: 'İşlemler',
      width: '120px',
      render: (_, user) => (
        <div className={styles.actions}>
          <button 
            className={styles.actionBtn}
            onClick={() => { setSelectedUser(user); setShowDetailModal(true); }}
            title="Detay"
          >
            <Eye size={16} />
          </button>
          <button 
            className={`${styles.actionBtn} ${user.isActive ? styles.deactivate : styles.activate}`}
            onClick={() => handleToggleActive(user)}
            title={user.isActive ? 'Pasif Yap' : 'Aktif Yap'}
          >
            {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
          </button>
          <button 
            className={`${styles.actionBtn} ${styles.delete}`}
            onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
            title="Sil"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filterActions = (
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className={styles.filterSelect}
    >
      {statusOptions.map(status => (
        <option key={status.value} value={status.value}>{status.label}</option>
      ))}
    </select>
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Kullanıcı Yönetimi</h1>
          <p className={styles.subtitle}>Tüm kullanıcıları görüntüle ve yönet</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statItem}>
            <Users size={18} />
            <span>{users.length} Kullanıcı</span>
          </div>
          <div className={`${styles.statItem} ${styles.active}`}>
            <UserCheck size={18} />
            <span>{users.filter(u => u.isActive).length} Aktif</span>
          </div>
          <div className={`${styles.statItem} ${styles.inactive}`}>
            <UserX size={18} />
            <span>{users.filter(u => !u.isActive).length} Pasif</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="E-posta, isim veya telefon ara..."
        pageSize={10}
        onRefresh={loadUsers}
        onExport={() => console.log('Export users')}
        actions={filterActions}
        emptyMessage="Filtrelere uygun kullanıcı bulunamadı"
      />

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Kullanıcı Detayı</h2>
              <button className={styles.closeBtn} onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.userProfileHeader}>
                <div className={styles.profileAvatar}>
                  {selectedUser.fullName?.charAt(0).toUpperCase() || selectedUser.email.charAt(0).toUpperCase()}
                </div>
                <div className={styles.profileInfo}>
                  <h3>{selectedUser.fullName || 'İsimsiz Kullanıcı'}</h3>
                  <span className={`${styles.profileStatus} ${selectedUser.isActive ? styles.active : styles.inactive}`}>
                    {selectedUser.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <Mail size={16} />
                  <div>
                    <label>E-posta</label>
                    <span>{selectedUser.email}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Phone size={16} />
                  <div>
                    <label>Telefon</label>
                    <span>{selectedUser.phone || '-'}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Shield size={16} />
                  <div>
                    <label>Kayıt Yöntemi</label>
                    <span>{getProviderLabel(selectedUser.provider)}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Home size={16} />
                  <div>
                    <label>Ev Sayısı</label>
                    <span>{selectedUser.homeCount}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Cpu size={16} />
                  <div>
                    <label>Cihaz Sayısı</label>
                    <span>{selectedUser.deviceCount}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Clock size={16} />
                  <div>
                    <label>Son Giriş</label>
                    <span>{formatDate(selectedUser.lastLogin)}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Calendar size={16} />
                  <div>
                    <label>Kayıt Tarihi</label>
                    <span>{formatDate(selectedUser.createdAt)}</span>
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
              <button 
                className={`${styles.modalBtn} ${selectedUser.isActive ? styles.warning : styles.success}`}
                onClick={() => { handleToggleActive(selectedUser); setShowDetailModal(false); }}
              >
                {selectedUser.isActive ? 'Pasif Yap' : 'Aktif Yap'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={`${styles.modal} ${styles.confirmModal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Kullanıcıyı Sil</h2>
              <button className={styles.closeBtn} onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p className={styles.confirmText}>
                <strong>{selectedUser.fullName || selectedUser.email}</strong> kullanıcısını silmek istediğinize emin misiniz?
              </p>
              <p className={styles.warningText}>
                Bu işlem geri alınamaz. Kullanıcının tüm evleri, cihazları ve verileri silinecektir.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={`${styles.modalBtn} ${styles.secondary}`}
                onClick={() => setShowDeleteModal(false)}
              >
                İptal
              </button>
              <button 
                className={`${styles.modalBtn} ${styles.danger}`}
                onClick={() => handleDeleteUser(selectedUser)}
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
