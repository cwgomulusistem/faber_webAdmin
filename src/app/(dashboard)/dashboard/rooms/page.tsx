'use client';

// Rooms Page
// Manage homes and rooms

import React, { useEffect, useState } from 'react';
import { Plus, Home as HomeIcon, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { homeService } from '../../../../services/home.service';
import type { Home, Room } from '../../../../types/home.types';
import styles from './page.module.css';

export default function RoomsPage() {
  const [homes, setHomes] = useState<Home[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null);

  useEffect(() => {
    loadHomes();
  }, []);

  const loadHomes = async () => {
    try {
      setIsLoading(true);
      const data = await homeService.getHomes();
      setHomes(data);
      if (data.length > 0 && !selectedHomeId) {
        setSelectedHomeId(data.find(h => h.isDefault)?.id || data[0].id);
      }
    } catch (error) {
      console.error('Failed to load homes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedHome = homes.find(h => h.id === selectedHomeId);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Odalar</h1>
          <p className={styles.subtitle}>Ev ve oda yönetimi</p>
        </div>
        <button className={styles.addBtn}>
          <Plus size={18} />
          <span>Oda Ekle</span>
        </button>
      </div>

      {/* Home Tabs */}
      {homes.length > 0 && (
        <div className={styles.tabs}>
          {homes.map(home => (
            <button
              key={home.id}
              className={`${styles.tab} ${selectedHomeId === home.id ? styles.activeTab : ''}`}
              onClick={() => setSelectedHomeId(home.id)}
            >
              <HomeIcon size={16} />
              <span>{home.name}</span>
            </button>
          ))}
          <button className={styles.addHomeBtn}>
            <Plus size={14} />
          </button>
        </div>
      )}

      {/* Rooms Grid */}
      {isLoading ? (
        <div className={styles.loading}>Yükleniyor...</div>
      ) : selectedHome?.rooms && selectedHome.rooms.length > 0 ? (
        <div className={styles.grid}>
          {selectedHome.rooms.map((room) => (
            <div key={room.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.roomIcon}>{room.icon || '🚪'}</span>
                <div className={styles.actions}>
                  <button className={styles.actionBtn}>
                    <Edit2 size={14} />
                  </button>
                  <button className={`${styles.actionBtn} ${styles.delete}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className={styles.roomName}>{room.name}</h3>
              <p className={styles.deviceCount}>
                {room.deviceCount || 0} Cihaz
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <HomeIcon size={48} />
          <p>Bu evde henüz oda bulunmuyor</p>
          <button className={styles.createBtn}>İlk Odayı Oluştur</button>
        </div>
      )}
    </div>
  );
}
