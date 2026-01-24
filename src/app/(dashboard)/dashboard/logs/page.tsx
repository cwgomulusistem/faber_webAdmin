'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Download, Search, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AuditLogsPage() {
    const router = useRouter();
    const handleBack = () => router.back();

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
            <header className="flex items-center justify-between px-10 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Shield className="text-primary w-8 h-8" />
                    <h2 className="text-lg font-bold">Security Audit Logs</h2>
                </div>
                <button onClick={handleBack} className="text-sm font-medium text-slate-500 hover:text-slate-900">Back</button>
            </header>

            <main className="flex-1 p-6 md:p-10 max-w-[1440px] mx-auto w-full flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black">Audit Logs</h1>
                        <p className="text-slate-500">Track user activity and system events.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-600 transition-colors">
                        <Download size={20} /> Export Logs
                    </button>
                </div>

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
