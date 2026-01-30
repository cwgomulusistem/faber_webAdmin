'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Home, Key, Clock, Bell } from 'lucide-react';
import api from '@/services/api.service';
import { cn, getActiveHomeId } from '@/lib/utils';
import { InviteMemberModal } from '@/components/members/InviteMemberModal';
import { MemberCard } from '@/components/members/MemberCard';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import { useSocket } from '@/hooks/useSocket';

export default function MembersPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const { isConnected } = useSocket();

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const homeId = getActiveHomeId();
            if (!homeId) return;

            const res = await api.get(`/users/sub?homeId=${homeId}`);
            const list = res.data.subUsers || res.data.data?.subUsers || [];

            const mapped = list.map((u: any) => ({
                id: u.id,
                name: u.fullName,
                role: u.role === 'master' ? 'Admin' : 'Resident',
                type: u.role,
                status: 'At Home',
                avatar: u.avatar,
                permissions: 'Control lights, locks',
                isGuest: !!u.accessExpiresAt
            }));

            setMembers(mapped);
        } catch (err) {
            console.error("Failed to fetch members", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const residents = members.filter(m => !m.isGuest);
    const guests = members.filter(m => m.isGuest);

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
            {/* Standard Header */}
            <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Üyeler</h1>
                        <span className="text-xs text-gray-500">Üye Yönetimi</span>
                    </div>
                </div>

                <div className="flex-1 max-w-md mx-8 hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Üye ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                        <ConnectionStatus />
                    </div>

                    <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Bell className="w-5 h-5 text-gray-500" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>

                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary hover:bg-blue-600 text-white px-4 py-2 shadow-sm transition-all active:scale-95 text-sm font-semibold"
                    >
                        <Plus size={18} />
                        <span>Üye Davet Et</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-[1200px] mx-auto flex flex-col gap-8 w-full">

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                    {['Tümü', 'Adminler', 'Sakinler', 'Misafirler'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "flex items-center px-4 h-10 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                                filter === f
                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold"
                                    : "bg-white dark:bg-surface-dark ring-1 ring-slate-200 dark:ring-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Residents Section */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Home className="text-primary" size={24} />
                            Family & Residents
                        </h2>
                        <span className="text-sm font-medium text-slate-500">{residents.length} Active</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {residents.map((member) => (
                            <MemberCard key={member.id} member={member} />
                        ))}
                        {residents.length === 0 && !loading && (
                            <div className="col-span-full py-10 text-center text-slate-500">No residents found. Invite someone!</div>
                        )}
                    </div>
                </section>

                {/* Guest Section */}
                <section className="pb-10">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Key className="text-primary" size={24} />
                            Guest Keys & Temporary Access
                        </h2>
                        <button className="text-sm font-bold text-primary hover:text-blue-600 transition-colors">History</button>
                    </div>
                    <div className="flex flex-col gap-4">
                        {guests.map((guest) => (
                            <div key={guest.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 gap-4 transition-all hover:border-primary/30">
                                {/* Guest Card Implementation */}
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-slate-900 dark:text-white">{guest.name}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Temporary Access</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {guests.length === 0 && (
                            <div className="p-5 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                No active guest keys.
                            </div>
                        )}
                    </div>
                </section>

                </div>
            </main>

            <InviteMemberModal open={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} onSuccess={fetchMembers} />
        </div>
    );
}
