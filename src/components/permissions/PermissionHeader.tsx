'use client';

import React from 'react';
import { Plus, Search, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';

export function PermissionHeader() {
    const { isConnected } = useSocket();

    return (
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">İzinler</h1>
                    <span className="text-xs text-gray-500">Rol ve İzin Yönetimi</span>
                </div>
            </div>

            <div className="flex-1 max-w-md mx-8 hidden md:block">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Kullanıcı veya rol ara..."
                        className={cn(
                            "w-full pl-10 pr-4 py-2 rounded-xl text-sm",
                            "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
                            "focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none",
                            "placeholder-gray-400 text-gray-900 dark:text-white transition-all"
                        )}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className="text-xs font-medium text-gray-500">Sistem Durumu</span>
                    <div className="flex items-center gap-1.5">
                        {isConnected ? (
                            <>
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-semibold text-green-600 dark:text-green-400">Çevrimiçi</span>
                            </>
                        ) : (
                            <>
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-xs font-semibold text-red-600">Çevrimdışı</span>
                            </>
                        )}
                    </div>
                </div>

                <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                <button className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary hover:bg-blue-600 text-white px-4 py-2 shadow-sm transition-all active:scale-95 text-sm font-semibold">
                    Değişiklikleri Kaydet
                </button>
            </div>
        </header>
    );
}
