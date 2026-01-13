'use client';

// Users Page
// Manage system users

import React, { useEffect, useState } from 'react';
import { UserPlus, Search, User as UserIcon, Shield, ShieldAlert } from 'lucide-react';
import styles from './page.module.css';

// Mock users until we have a proper UserService for listing users
const MOCK_USERS = [
  { id: '1', email: 'admin@faber.app', fullName: 'Faber Admin', role: 'ADMIN', lastLogin: '2024-03-15T10:30:00' },
  { id: '2', email: 'user@demo.com', fullName: 'Demo User', role: 'USER', lastLogin: '2024-03-14T15:45:00' },
  { id: '3', email: 'tech@faber.app', fullName: 'Teknik Servis', role: 'SUPPORT', lastLogin: '2024-03-10T09:15:00' },
];

export default function UsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>Rol</th>
              <th>Son Giriş</th>
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
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className={styles.userName}>{user.fullName}</div>
                      <div className={styles.userEmail}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.badge} ${styles[user.role.toLowerCase()]}`}>
                    {user.role}
                  </span>
                </td>
                <td className={styles.date}>
                  {new Date(user.lastLogin).toLocaleDateString('tr-TR')}
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
      </div>
    </div>
  );
}
