'use client';

// Sidebar Component
// Main navigation sidebar for the admin panel

import React, { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { cn } from '@/lib/utils';
// import styles from './Sidebar.module.css'; // Removed CSS modules in favor of Tailwind

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Devices', href: '/dashboard/devices', icon: <Router size={20} />, badge: 12 },
  { label: 'Rooms', href: '/dashboard/rooms', icon: <DoorOpen size={20} /> },
  { label: 'Automations', href: '/dashboard/scenes', icon: <Zap size={20} /> },
  { label: 'Permissions', href: '/dashboard/permissions', icon: <ShieldCheck size={20} /> },
  { label: 'Audit Logs', href: '/dashboard/logs', icon: <ShieldCheck size={20} /> },
  { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={20} /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { isConnected } = useSocket();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside className="w-72 bg-white dark:bg-sidebar-dark h-full flex flex-col justify-between shrink-0 shadow-soft z-30 border-r border-gray-200 dark:border-gray-800">
      <div>
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-glow">
            <Home className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            SmartHome<span className="text-primary">.HD</span>
          </span>
        </div>

        <div className="px-4 py-6">
          {/* Connection Status */}
          {!isConnected && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-3 flex items-center gap-3 mb-8">
              <div className="bg-red-100 dark:bg-red-800 p-2 rounded-lg text-red-600 dark:text-red-200">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-red-700 dark:text-red-300">Connection Issues</span>
                <span className="text-xs text-red-500 dark:text-red-400">Main Gateway unreachable</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1.5">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main Menu</p>
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

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
                  {item.badge !== undefined && (
                    <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">
                      {item.badge}
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
            <p className="text-xs text-gray-500 truncate">{user?.email || 'email@home.local'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
