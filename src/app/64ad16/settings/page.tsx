'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Bell,
  Mail,
  Database,
  Cloud,
  Lock,
  Save,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import styles from './page.module.css';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const sections: SettingSection[] = [
  {
    id: 'general',
    title: 'Genel Ayarlar',
    description: 'Sistem genel ayarları ve yapılandırma',
    icon: <Settings size={20} />,
  },
  {
    id: 'security',
    title: 'Güvenlik',
    description: 'Kimlik doğrulama ve erişim kontrolü',
    icon: <Shield size={20} />,
  },
  {
    id: 'notifications',
    title: 'Bildirimler',
    description: 'E-posta ve push bildirim ayarları',
    icon: <Bell size={20} />,
  },
  {
    id: 'email',
    title: 'E-posta',
    description: 'SMTP ve e-posta şablonları',
    icon: <Mail size={20} />,
  },
  {
    id: 'database',
    title: 'Veritabanı',
    description: 'Yedekleme ve bakım ayarları',
    icon: <Database size={20} />,
  },
  {
    id: 'mqtt',
    title: 'MQTT',
    description: 'Broker ve cihaz iletişim ayarları',
    icon: <Cloud size={20} />,
  },
];

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Faber IoT',
    siteUrl: 'https://iot.faber.com',
    adminEmail: 'admin@faber.com',
    timezone: 'Europe/Istanbul',
    language: 'tr',
    maintenanceMode: false,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorRequired: false,
    passwordMinLength: 8,
    ipWhitelist: '',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    deviceOfflineAlert: true,
    firmwareUpdateAlert: true,
    securityAlert: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className={styles.settingsContent}>
            <div className={styles.formGroup}>
              <label>Site Adı</label>
              <input
                type="text"
                value={generalSettings.siteName}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Site URL</label>
              <input
                type="url"
                value={generalSettings.siteUrl}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Admin E-posta</label>
              <input
                type="email"
                value={generalSettings.adminEmail}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Saat Dilimi</label>
                <select
                  value={generalSettings.timezone}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}
                >
                  <option value="Europe/Istanbul">Türkiye (UTC+3)</option>
                  <option value="Europe/London">Londra (UTC+0)</option>
                  <option value="America/New_York">New York (UTC-5)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Dil</label>
                <select
                  value={generalSettings.language}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, language: e.target.value }))}
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={generalSettings.maintenanceMode}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
              />
              <span>Bakım Modu</span>
              <small>Aktif edildiğinde kullanıcılar sisteme erişemez</small>
            </label>
          </div>
        );

      case 'security':
        return (
          <div className={styles.settingsContent}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Oturum Zaman Aşımı (dakika)</label>
                <input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Maksimum Giriş Denemesi</label>
                <input
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Minimum Şifre Uzunluğu</label>
              <input
                type="number"
                value={securitySettings.passwordMinLength}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label>IP Beyaz Liste (virgülle ayır)</label>
              <input
                type="text"
                placeholder="192.168.1.100, 10.0.0.1"
                value={securitySettings.ipWhitelist}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
              />
              <small>Boş bırakılırsa tüm IP adreslerine izin verilir</small>
            </div>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={securitySettings.twoFactorRequired}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorRequired: e.target.checked }))}
              />
              <span>İki Faktörlü Doğrulama Zorunlu</span>
              <small>Tüm admin kullanıcıları için 2FA zorunlu olur</small>
            </label>
          </div>
        );

      case 'notifications':
        return (
          <div className={styles.settingsContent}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
              />
              <span>E-posta Bildirimleri</span>
              <small>Önemli olaylar için e-posta gönderilir</small>
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={notificationSettings.pushNotifications}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
              />
              <span>Push Bildirimleri</span>
              <small>Tarayıcı push bildirimleri</small>
            </label>
            <div className={styles.divider} />
            <h4>Bildirim Türleri</h4>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={notificationSettings.deviceOfflineAlert}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, deviceOfflineAlert: e.target.checked }))}
              />
              <span>Cihaz Çevrimdışı Uyarısı</span>
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={notificationSettings.firmwareUpdateAlert}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, firmwareUpdateAlert: e.target.checked }))}
              />
              <span>Firmware Güncelleme Uyarısı</span>
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={notificationSettings.securityAlert}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, securityAlert: e.target.checked }))}
              />
              <span>Güvenlik Uyarısı</span>
            </label>
          </div>
        );

      default:
        return (
          <div className={styles.comingSoon}>
            <Lock size={48} />
            <h3>Yakında</h3>
            <p>Bu bölüm henüz yapım aşamasındadır.</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sistem Ayarları</h1>
          <p className={styles.subtitle}>Sistem yapılandırması ve tercihler</p>
        </div>
        <button 
          className={styles.saveBtn} 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <RefreshCw size={18} className={styles.spinning} />
              <span>Kaydediliyor...</span>
            </>
          ) : saved ? (
            <>
              <CheckCircle size={18} />
              <span>Kaydedildi!</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Kaydet</span>
            </>
          )}
        </button>
      </div>

      <div className={styles.settingsLayout}>
        {/* Sidebar */}
        <div className={styles.settingsSidebar}>
          {sections.map(section => (
            <button
              key={section.id}
              className={`${styles.sectionBtn} ${activeSection === section.id ? styles.active : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className={styles.sectionIcon}>{section.icon}</span>
              <div className={styles.sectionInfo}>
                <span className={styles.sectionTitle}>{section.title}</span>
                <span className={styles.sectionDesc}>{section.description}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={styles.settingsMain}>
          <div className={styles.sectionHeader}>
            <h2>{sections.find(s => s.id === activeSection)?.title}</h2>
            <p>{sections.find(s => s.id === activeSection)?.description}</p>
          </div>
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
}
