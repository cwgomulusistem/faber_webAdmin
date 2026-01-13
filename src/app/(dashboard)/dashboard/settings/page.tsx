'use client';

// Settings Page
// App configuration

import React from 'react';
import { Globe, Moon, Bell, Shield, Smartphone } from 'lucide-react';
import { useTenant } from '../../../../hooks/useTenant';
import styles from './page.module.css';

export default function SettingsPage() {
  const { tenant } = useTenant();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Ayarlar</h1>
        <p className={styles.subtitle}>Uygulama ve hesap ayarları</p>
      </div>

      <div className={styles.grid}>
        {/* Tenant Info */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Organizasyon Bilgileri</h2>
          <div className={styles.card}>
            <div className={styles.field}>
              <label>Tenant Adı</label>
              <div className={styles.value}>{tenant.name}</div>
            </div>
            <div className={styles.field}>
              <label>Tenant ID</label>
              <div className={styles.value}>{tenant.id}</div>
            </div>
            <div className={styles.field}>
              <label>Ana Renk</label>
              <div className={styles.colorPreview}>
                <span 
                  className={styles.colorDot} 
                  style={{ backgroundColor: tenant.primaryColor }}
                />
                {tenant.primaryColor}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Tercihler</h2>
          <div className={styles.card}>
            <button className={styles.settingItem}>
              <div className={styles.settingIcon}><Globe size={20} /></div>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>Dil / Language</span>
                <span className={styles.settingDesc}>Türkçe (TR)</span>
              </div>
            </button>
            <button className={styles.settingItem}>
              <div className={styles.settingIcon}><Moon size={20} /></div>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>Görünüm</span>
                <span className={styles.settingDesc}>Koyu Tema</span>
              </div>
            </button>
            <button className={styles.settingItem}>
              <div className={styles.settingIcon}><Bell size={20} /></div>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>Bildirimler</span>
                <span className={styles.settingDesc}>Aktif</span>
              </div>
            </button>
          </div>
        </div>

        {/* System */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Sistem</h2>
          <div className={styles.card}>
            <button className={styles.settingItem}>
              <div className={styles.settingIcon}><Shield size={20} /></div>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>Güvenlik</span>
                <span className={styles.settingDesc}>Şifre ve 2FA</span>
              </div>
            </button>
            <button className={styles.settingItem}>
              <div className={styles.settingIcon}><Smartphone size={20} /></div>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>Mobil Uygulama</span>
                <span className={styles.settingDesc}>Sürüm 2.1.0</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
