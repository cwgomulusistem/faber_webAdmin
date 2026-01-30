'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Home, MoreVertical, Key, Clock, Copy, Share, Trash2 } from 'lucide-react';
import api from '@/services/api.service';
import { cn, getActiveHomeId } from '@/lib/utils';
import { InviteMemberModal } from '@/components/members/InviteMemberModal';
import { MemberCard } from '@/components/members/MemberCard';

export default function MembersPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [filter, setFilter] = useState('All');

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const homeId = getActiveHomeId();
            if (!homeId) return;

            const res = await api.get(`/users/sub?homeId=${homeId}`);
            // Backend returns { subUsers: [...], total: ... }
            // Let's assume res.data.subUsers is the array.
            // If wrapping exists: res.data.data.subUsers?
            // Checking handler: c.JSON(http.StatusOK, result) -> SubUserListResponse
            // So: res.data.subUsers
            const list = res.data.subUsers || res.data.data?.subUsers || [];

            // Mapper
            const mapped = list.map((u: any) => ({
                id: u.id,
                name: u.fullName,
                role: u.role === 'master' ? 'Admin' : 'Resident', // Default mapping
                type: u.role,
                status: 'At Home', // Mock status
                avatar: u.avatar,
                permissions: 'Control lights, locks', // Mock
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
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto">
            <div className="max-w-[1200px] mx-auto p-6 md:p-10 flex flex-col gap-8 w-full">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex flex-col gap-2 max-w-2xl">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Members & Access</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">Manage household members, guests, and their permissions securely.</p>
                    </div>
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 shrink-0"
                    >
                        <Plus size={20} />
                        <span>Invite New Member</span>
                    </button>
                </header>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                    <div className="relative flex-1 max-w-lg">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                            <Search size={20} />
                        </div>
                        <input
                            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-surface-dark border-0 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary rounded-xl text-base placeholder:text-slate-400 dark:text-white transition-all shadow-sm outline-none"
                            placeholder="Search members by name or role..."
                            type="text"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                        {['All Members', 'Admins', 'Residents', 'Guests'].map((f) => (
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

            <InviteMemberModal open={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} onSuccess={fetchMembers} />
        </div>
    );
}
