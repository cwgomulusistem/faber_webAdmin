'use client';

// Header Component
// Top header bar for the admin panel

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTenant } from '../../hooks/useTenant';
import { useSocket } from '../../hooks/useSocket';
import {
  Bell,
  Search,
  Moon,
  Sun,
  Menu,
  RefreshCw,
} from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  onMenuClick?: () => void;
}

// Page titles mapping
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/devices': 'Cihazlar',
  '/dashboard/rooms': 'Odalar',
  '/dashboard/scenes': 'Senaryolar',
  '/dashboard/users': 'Kullanıcılar',
  '/dashboard/settings': 'Ayarlar',
};

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { tenant } = useTenant();
  const { isConnected } = useSocket();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const pageTitle = pageTitles[pathname] || 'Dashboard';

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Implement theme switching via context
  };

  return (
    <header className={styles.header}>
      {/* Left Section */}
      <div className={styles.left}>
        <button 
          className={styles.menuBtn}
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <span className={styles.breadcrumb}>
            {tenant.name} / {pageTitle}
          </span>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className={styles.center}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cihaz veya oda ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <kbd className={styles.kbd}>⌘K</kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className={styles.right}>
        {/* Refresh Button */}
        <button className={styles.iconBtn} title="Yenile">
          <RefreshCw size={18} />
        </button>

        {/* Theme Toggle */}
        <button 
          className={styles.iconBtn}
          onClick={toggleTheme}
          title={isDarkMode ? 'Açık Tema' : 'Koyu Tema'}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className={styles.iconBtn} title="Bildirimler">
          <Bell size={18} />
          <span className={styles.notificationBadge}>3</span>
        </button>

        {/* Connection Status Indicator */}
        <div className={styles.statusIndicator}>
          <span 
            className={`${styles.statusDot} ${isConnected ? styles.online : styles.offline}`}
          />
          <span className={styles.statusText}>
            {isConnected ? 'Canlı' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
