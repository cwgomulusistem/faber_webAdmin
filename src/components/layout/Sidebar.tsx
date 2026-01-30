'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Router,
  DoorOpen,
  Zap,
  Users,
  Settings,
  LogOut,
  Home,
  WifiOff,
  ShieldCheck,
  ChevronDown,
  Check,
  Plus
} from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { cn, getActiveHomeId, setActiveHomeId } from '@/lib/utils';
import api from '@/services/api.service';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Evlerim', href: '/dashboard/homes', icon: <Home size={20} /> },
  { label: 'Cihazlar', href: '/dashboard/devices', icon: <Router size={20} /> },
  { label: 'Üyeler', href: '/dashboard/members', icon: <Users size={20} /> },
  { label: 'Odalar', href: '/dashboard/rooms', icon: <DoorOpen size={20} /> },
  { label: 'Otomasyon', href: '/dashboard/scenes', icon: <Zap size={20} /> },
  { label: 'İzinler', href: '/dashboard/permissions', icon: <ShieldCheck size={20} /> },
  { label: 'Kayıtlar', href: '/dashboard/logs', icon: <ShieldCheck size={20} /> },
  { label: 'Ayarlar', href: '/dashboard/settings', icon: <Settings size={20} /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { isConnected } = useSocket();

  const [deviceCount, setDeviceCount] = useState<number>(0);
  const [homes, setHomes] = useState<any[]>([]);
  const [activeHome, setActiveHome] = useState<any>(null);
  const [isHomeMenuOpen, setIsHomeMenuOpen] = useState(false);

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
        {/* Home Switcher / Header */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-gray-800 relative select-none">
          <button
            onClick={() => setIsHomeMenuOpen(!isHomeMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <Home className="text-white w-5 h-5" />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[120px]">
                  {activeHome ? activeHome.name : 'Yükleniyor...'}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold group-hover:text-primary transition-colors">
                  Aktif Konum
                </span>
              </div>
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
                  className="absolute top-16 left-4 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 py-1"
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
          {/* Connection Status */}
          {!isConnected && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-3 flex items-center gap-3 mb-8">
              <div className="bg-red-100 dark:bg-red-800 p-2 rounded-lg text-red-600 dark:text-red-200">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-red-700 dark:text-red-300">Bağlantı Hatası</span>
                <span className="text-xs text-red-500 dark:text-red-400">Sunucuya erişilemiyor</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1.5">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menü</p>
            {navItems.map((item) => {
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
