'use client';

// Users Page
// Manage system users

import React, { useEffect, useState } from 'react';
import { UserPlus, Search, Loader2 } from 'lucide-react';
import { userService } from '../../../../services/user.service';
import type { User, AdminUser } from '../../../../types/auth.types';
import styles from './page.module.css';

export default function UsersPage() {
  const [users, setUsers] = useState<(User | AdminUser)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRole = (user: User | AdminUser) => {
    if ('role' in user) return user.role;
    return 'USER';
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Kullanıcılar</h1>
          <p className={styles.subtitle}>Sistem kullanıcılarını yönet</p>
        </div>
        <button className={styles.addBtn}>
          <UserPlus size={18} />
          <span>Kullanıcı Ekle</span>
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="İsim veya e-posta ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <Loader2 className={styles.spinner} size={24} />
            <p>Kullanıcılar yükleniyor...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Rol</th>
                <th>Kayıt Tarihi</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>
                        {(user.fullName || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.userName}>{user.fullName || 'İsimsiz Kullanıcı'}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[getRole(user).toLowerCase()]}`}>
                      {getRole(user)}
                    </span>
                  </td>
                  <td className={styles.date}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}
                  </td>
                  <td>
                    <span className={styles.statusActive}>Aktif</span>
                  </td>
                  <td>
                    <button className={styles.actionBtn}>Düzenle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <p>Kullanıcı bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
