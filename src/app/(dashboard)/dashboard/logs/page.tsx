'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Download, Search, AlertTriangle, CheckCircle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';

export default function AuditLogsPage() {
    const router = useRouter();
    const { isConnected } = useSocket();

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden">
            {/* Standard Header */}
            <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Kayıtlar</h1>
                        <span className="text-xs text-gray-500">Güvenlik ve Aktivite Logları</span>
                    </div>
                </div>

                <div className="flex-1 max-w-md mx-8 hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Log ara..."
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
                        <Download size={18} />
                        <span>Dışa Aktar</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 md:p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-6 overflow-y-auto">

                <div className="flex flex-col gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                        <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Search logs..." />
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <LogEntry
                                    time="2023-10-27 10:42:15"
                                    user="Sarah J."
                                    action="Unlocked Front Door"
                                    status="Success"
                                />
                                <LogEntry
                                    time="2023-10-27 10:40:02"
                                    user="Unknown"
                                    action="Failed PIN Attempt (Garage)"
                                    status="Failed"
                                    critical
                                />
                                <LogEntry
                                    time="2023-10-27 09:15:00"
                                    user="System"
                                    action="Firmware Update"
                                    status="Success"
                                />
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

function LogEntry({ time, user, action, status, critical }: any) {
    return (
        <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${critical ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
            <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-400">{time}</td>
            <td className="px-6 py-4 text-sm font-medium">{user}</td>
            <td className={`px-6 py-4 text-sm font-medium ${critical ? 'text-red-600' : ''}`}>{action}</td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${critical ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {critical ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                    {status}
                </span>
            </td>
        </tr>
    );
}
