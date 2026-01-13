'use client';

// Sidebar Component
// Main navigation sidebar for the admin panel

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTenant } from '../../hooks/useTenant';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Cpu,
  Home,
  Layers,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import styles from './Sidebar.module.css';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Cihazlar', href: '/dashboard/devices', icon: <Cpu size={20} /> },
  { label: 'Odalar', href: '/dashboard/rooms', icon: <Home size={20} /> },
  { label: 'Senaryolar', href: '/dashboard/scenes', icon: <Layers size={20} /> },
  { label: 'Kullanıcılar', href: '/dashboard/users', icon: <Users size={20} /> },
  { label: 'Ayarlar', href: '/dashboard/settings', icon: <Settings size={20} /> },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { tenant } = useTenant();
  const { logout, user } = useAuth();
  const { isConnected } = useSocket();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logoContainer}>
        <div className={styles.logo}>
          {!isCollapsed && (
            <span className={styles.logoText}>{tenant.name}</span>
          )}
          {isCollapsed && <span className={styles.logoIcon}>F</span>}
        </div>
        <button 
          className={styles.collapseBtn}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Connection Status */}
      <div className={styles.connectionStatus}>
        {isConnected ? (
          <div className={styles.connected}>
            <Wifi size={14} />
            {!isCollapsed && <span>Bağlı</span>}
          </div>
        ) : (
          <div className={styles.disconnected}>
            <WifiOff size={14} />
            {!isCollapsed && <span>Bağlantı Yok</span>}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
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
      </nav>

      {/* User Info & Logout */}
      <div className={styles.footer}>
        {!isCollapsed && user && (
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>
                {'fullName' in user ? user.fullName : user.email}
              </span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          </div>
        )}
        <button 
          className={styles.logoutBtn}
          onClick={handleLogout}
          title="Çıkış Yap"
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Çıkış Yap</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
