'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  Users,
  Home,
  FileCode2,
  ScrollText,
  Puzzle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/64ad16', icon: <LayoutDashboard size={20} /> },
  { label: 'Cihazlar', href: '/64ad16/devices', icon: <Cpu size={20} /> },
  { label: 'Kullanıcılar', href: '/64ad16/users', icon: <Users size={20} /> },
  { label: 'Evler', href: '/64ad16/homes', icon: <Home size={20} /> },
  { label: 'Firmware', href: '/64ad16/firmware', icon: <FileCode2 size={20} /> },
  { label: 'Loglar', href: '/64ad16/logs', icon: <ScrollText size={20} /> },
  { label: 'Entegrasyonlar', href: '/64ad16/integrations', icon: <Puzzle size={20} /> },
  { label: 'Ayarlar', href: '/64ad16/settings', icon: <Settings size={20} /> },
];

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    // Admin çıkışı - ana sayfaya yönlendir
    window.location.href = '/dashboard';
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logoContainer}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Shield size={20} />
          </div>
          {!isCollapsed && (
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>Faber Admin</span>
              <span className={styles.logoSubtitle}>IoT Yönetim Paneli</span>
            </div>
          )}
        </div>
        <button 
          className={styles.collapseBtn}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Status Indicator */}
      <div className={styles.statusBar}>
        <div className={styles.statusItem}>
          <Activity size={14} />
          {!isCollapsed && <span>Sistem Aktif</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navSection}>
          {!isCollapsed && <span className={styles.navSectionTitle}>Yönetim</span>}
          {navItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/64ad16' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className={styles.navLabel}>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={styles.badge}>{item.badge}</span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>

        <div className={styles.navSection}>
          {!isCollapsed && <span className={styles.navSectionTitle}>Sistem</span>}
          {navItems.slice(4).map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/64ad16' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className={styles.navLabel}>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={styles.badge}>{item.badge}</span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        {!isCollapsed && (
          <div className={styles.adminInfo}>
            <div className={styles.avatar}>A</div>
            <div className={styles.adminDetails}>
              <span className={styles.adminName}>Admin</span>
              <span className={styles.adminRole}>Sistem Yöneticisi</span>
            </div>
          </div>
        )}
        <button 
          className={styles.exitBtn}
          onClick={handleLogout}
          title="Kullanıcı Paneline Dön"
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Panele Dön</span>}
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
