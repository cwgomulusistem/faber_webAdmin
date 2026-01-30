'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../contexts/PermissionContext';
import {
  LayoutDashboard,
  Router,
  DoorOpen,
  Zap,
  Users,
  Settings,
  LogOut,
  Home,
  ShieldCheck,
  ChevronDown,
  Check,
  Plus,
  FileText
} from 'lucide-react';
import { cn, getActiveHomeId, setActiveHomeId } from '@/lib/utils';
import api from '@/services/api.service';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  menuKey: string; // PBAC v2.0: Menu permission key
  badge?: number;
}

// PBAC v2.0: Each nav item has a menuKey for permission checking
const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} />, menuKey: 'dashboard' },
  { label: 'Evlerim', href: '/dashboard/homes', icon: <Home size={20} />, menuKey: 'homes' },
  { label: 'Cihazlar', href: '/dashboard/devices', icon: <Router size={20} />, menuKey: 'devices' },
  { label: 'Üyeler', href: '/dashboard/members', icon: <Users size={20} />, menuKey: 'members' },
  { label: 'Odalar', href: '/dashboard/rooms', icon: <DoorOpen size={20} />, menuKey: 'rooms' },
  { label: 'Otomasyon', href: '/dashboard/scenes', icon: <Zap size={20} />, menuKey: 'scenes' },
  { label: 'İzinler', href: '/dashboard/permissions', icon: <ShieldCheck size={20} />, menuKey: 'members' },
  { label: 'Kayıtlar', href: '/dashboard/logs', icon: <FileText size={20} />, menuKey: 'logs' },
  { label: 'Ayarlar', href: '/dashboard/settings', icon: <Settings size={20} />, menuKey: 'settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { can, isLoading: permissionsLoading } = usePermission();

  const [deviceCount, setDeviceCount] = useState<number>(0);
  const [homes, setHomes] = useState<any[]>([]);
  const [activeHome, setActiveHome] = useState<any>(null);
  const [isHomeMenuOpen, setIsHomeMenuOpen] = useState(false);

  // PBAC v2.0: Filter nav items based on permissions
  const visibleNavItems = useMemo(() => {
    if (permissionsLoading) return navItems; // Show all while loading
    return navItems.filter(item => can('view', 'menu', item.menuKey));
  }, [can, permissionsLoading]);

  useEffect(() => {
    const fetchHomes = async () => {
      try {
        const res = await api.get('/homes');
        const homeList = res.data?.data || [];
        setHomes(homeList);

        const currentId = getActiveHomeId();
        if (currentId && homeList.length > 0) {
          const current = homeList.find((h: any) => h.id === currentId) || homeList[0];
          setActiveHome(current);
          if (current.id !== currentId) {
            setActiveHomeId(current.id);
          }
        } else if (homeList.length > 0) {
          setActiveHome(homeList[0]);
          setActiveHomeId(homeList[0].id);
        }
      } catch (e) {
        console.error("Sidebar home fetch error", e);
      }
    };
    fetchHomes();
  }, []);

  // Fetch device count when activeHome changes
  useEffect(() => {
    const fetchDeviceCount = async () => {
      if (!activeHome?.id) return;
      try {
        const res = await api.get(`/homes/${activeHome.id}/devices`);
        if (res.data?.success) {
          setDeviceCount(res.data.data?.length || 0);
        }
      } catch (e) {
        console.error("Failed to fetch device count", e);
        setDeviceCount(0);
      }
    };

    fetchDeviceCount();
  }, [activeHome]);

  const handleSwitchHome = (home: any) => {
    setActiveHomeId(home.id);
    setActiveHome(home);
    setIsHomeMenuOpen(false);
    // Hard reload to ensure all data contexts refresh
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn("Logout API failed, ensuring local cleanup", e);
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <aside className="w-72 bg-white dark:bg-sidebar-dark h-full flex flex-col justify-between shrink-0 shadow-soft z-30 border-r border-gray-200 dark:border-gray-800">
      <div>
        {/* Faber Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M3 9.5L12 4L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="3" fill="currentColor" opacity="0.9" />
                  <path d="M12 10V7M15 13H18M12 16V19M6 13H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                </svg>
              </div>
            </div>
            {/* Brand Text */}
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                FABER
              </span>
              <span className="text-[9px] font-semibold tracking-[0.2em] text-gray-400 uppercase">
                Smart Home
              </span>
            </div>
          </div>
        </div>

        {/* Home Switcher */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 relative select-none">
          <p className="px-2 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Aktif Konum</p>
          <button
            onClick={() => setIsHomeMenuOpen(!isHomeMenuOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
                <Home className="text-white w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[130px]">
                {activeHome ? activeHome.name : 'Yükleniyor...'}
              </span>
            </div>
            <ChevronDown size={16} className={cn("text-gray-400 transition-transform duration-300", isHomeMenuOpen && "rotate-180 text-primary")} />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isHomeMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsHomeMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 py-1"
                >
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mevcut Evler</div>
                  {homes.map(home => (
                    <button
                      key={home.id}
                      onClick={() => handleSwitchHome(home)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                        activeHome?.id === home.id && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        activeHome?.id === home.id ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                      )}>
                        <Home size={16} />
                      </div>
                      <span className={cn("flex-1 text-left text-sm font-medium", activeHome?.id === home.id ? "text-primary" : "text-gray-700 dark:text-gray-300")}>
                        {home.name}
                      </span>
                      {activeHome?.id === home.id && <Check size={16} className="text-primary" />}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                    <Link
                      href="/dashboard/homes"
                      onClick={() => setIsHomeMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg border flex items-center justify-center border-dashed border-gray-300">
                        <Plus size={16} />
                      </div>
                      <span className="text-sm font-medium">Yeni Ev Ekle</span>
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="px-4 py-6 flex-1 overflow-y-auto custom-scrollbar">
          {/* Navigation - PBAC v2.0: Only show items user has permission for */}
          <nav className="space-y-1.5">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menü</p>
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              
              const badge = item.href === '/dashboard/devices' ? deviceCount : item.badge;

              if (isActive) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-semibold shadow-sm border border-primary/20 relative"
                  >
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition group"
                >
                  <span className="w-5 h-5 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Info & Logout */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold border-2 border-white shadow-sm">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {user?.fullName || user?.email?.split('@')[0] || 'Kullanıcı'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'Giriş Yapılmadı'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition"
            title="Çıkış Yap"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
