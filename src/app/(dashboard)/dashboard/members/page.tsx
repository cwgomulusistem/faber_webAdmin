'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Home, Key, Clock, Bell, Users, Building2, X, Settings } from 'lucide-react';
import api from '@/services/api.service';
import { cn } from '@/lib/utils';
import { InviteMemberModal } from '@/components/members/InviteMemberModal';
import { MemberCard } from '@/components/members/MemberCard';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/auth.types';
import { toast } from 'sonner';

interface HomeInfo {
    id: string;
    name: string;
}

interface MemberWithHomes {
    id: string;
    name: string;
    username?: string;
    email?: string;
    role: string;
    type: string;
    status: string;
    avatar?: string;
    permissions: string;
    isGuest: boolean;
    accessExpiresAt?: string;
    homes: HomeInfo[]; // Which homes this member belongs to
}

export default function MembersPage() {
    const [members, setMembers] = useState<MemberWithHomes[]>([]);
    const [homes, setHomes] = useState<HomeInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [filter, setFilter] = useState('Tümü');
    const [homeFilter, setHomeFilter] = useState<string>('all'); // Filter by home
    const [searchTerm, setSearchTerm] = useState('');
    const { isConnected } = useSocket();
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Check if user is master (can invite) - robust check
    const userRole = user?.role as unknown as string;
    const isMaster = user && 'role' in user && (userRole === UserRole.MASTER || userRole === 'master' || userRole === 'MASTER');

    // Prevent double fetching in React StrictMode
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (!authLoading && !isMaster) {
            router.push('/dashboard');
        }
    }, [isMaster, authLoading, router]);

    const fetchAllMembers = async () => {
        try {
            setLoading(true);

            // 1. Fetch all homes
            const homesRes = await api.get('/homes');
            const homesList: HomeInfo[] = homesRes.data.data || homesRes.data || [];
            setHomes(homesList);

            if (homesList.length === 0) {
                setMembers([]);
                return;
            }

            // 2. Fetch members for each home
            const memberMap = new Map<string, MemberWithHomes>();

            for (const home of homesList) {
                try {
                    const res = await api.get(`/users/sub?homeId=${home.id}`);
                    const list = res.data.subUsers || res.data.data?.subUsers || [];

                    for (const u of list) {
                        const existing = memberMap.get(u.id);

                        if (existing) {
                            // User already exists, add this home to their list
                            if (!existing.homes.find(h => h.id === home.id)) {
                                existing.homes.push({ id: home.id, name: home.name });
                            }
                        } else {
                            // New user
                            const memberRole = (u.role as unknown as string);
                            let displayRole = 'Sakin';
                            let displayPermissions = 'Standart erişim';

                            if (memberRole === 'ADMIN') {
                                displayRole = 'Admin';
                                displayPermissions = 'Yönetici yetkisi';
                            } else if (memberRole === 'GUEST' || u.accessExpiresAt) {
                                displayRole = 'Misafir';
                                displayPermissions = 'Kısıtlı erişim';
                            } else if (memberRole === 'MASTER' || memberRole === 'master') {
                                displayRole = 'Ana Kullanıcı';
                                displayPermissions = 'Tam yetki';
                            }

                            memberMap.set(u.id, {
                                id: u.id,
                                name: u.fullName || u.name || u.username || 'İsimsiz',
                                username: u.username,
                                email: u.email,
                                role: displayRole,
                                type: memberRole,
                                status: 'Evde',
                                avatar: u.avatar,
                                permissions: displayPermissions,
                                isGuest: !!u.accessExpiresAt || memberRole === 'GUEST',
                                accessExpiresAt: u.accessExpiresAt,
                                homes: [{ id: home.id, name: home.name }]
                            });
                        }
                    }
                } catch (err) {
                    console.error(`Failed to fetch members for home ${home.id}:`, err);
                }
            }

            setMembers(Array.from(memberMap.values()));
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && isMaster) {
            if (hasFetchedRef.current) return;
            hasFetchedRef.current = true;
            fetchAllMembers();
        }
    }, [authLoading, isMaster]);

    // Filter members
    const filteredMembers = members.filter(member => {
        // Search filter
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()));

        // Role filter
        let matchesRole = true;
        const memberType = member.type as unknown as string;
        if (filter === 'Adminler') matchesRole = (memberType === UserRole.MASTER || memberType === 'master' || memberType === 'MASTER');
        else if (filter === 'Sakinler') matchesRole = (memberType !== UserRole.MASTER && memberType !== 'master' && memberType !== 'MASTER') && !member.isGuest;
        else if (filter === 'Misafirler') matchesRole = member.isGuest;

        // Home filter
        let matchesHome = true;
        if (homeFilter !== 'all') {
            matchesHome = member.homes.some(h => h.id === homeFilter);
        }

        return matchesSearch && matchesRole && matchesHome;
    });

    const residents = filteredMembers.filter(m => !m.isGuest);
    const guests = filteredMembers.filter(m => m.isGuest);

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
            {/* Standard Header */}
            <header className="min-h-16 h-auto md:h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-4 md:py-0 shrink-0 z-10 gap-4">
                <div className="flex items-center justify-between w-full md:w-auto gap-6">
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Tüm Üyeler</h1>
                        <span className="text-xs text-gray-500">{homes.length} ev, {members.length} üye</span>
                    </div>

                    <div className="flex md:hidden items-center gap-2">
                        <ConnectionStatus />
                        <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Bell className="w-5 h-5 text-gray-500" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 max-w-md w-full md:mx-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Üye ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 md:py-2 rounded-xl text-sm",
                                "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
                                "focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none",
                                "placeholder-gray-400 text-gray-900 dark:text-white transition-all"
                            )}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <span className="text-xs font-medium text-gray-500">Sistem Durumu</span>
                        <ConnectionStatus />
                    </div>

                    <button className="hidden md:block relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Bell className="w-5 h-5 text-gray-500" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>

                    {isMaster && (
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="flex-1 md:flex-initial flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary hover:bg-blue-600 text-white px-4 py-2.5 md:py-2 shadow-sm transition-all active:scale-95 text-sm font-semibold h-10 md:h-auto"
                        >
                            <Plus size={18} />
                            <span className="whitespace-nowrap">Üye Davet</span>
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-[1200px] mx-auto flex flex-col gap-6 w-full">

                    {/* Filters Row */}
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                        {/* Role Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
                            {['Tümü', 'Adminler', 'Sakinler', 'Misafirler'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "flex items-center px-4 h-11 lg:h-10 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                                        filter === f
                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold"
                                            : "bg-white dark:bg-surface-dark ring-1 ring-slate-200 dark:ring-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Home Filter Dropdown */}
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <Building2 size={18} className="text-slate-400 shrink-0" />
                            <select
                                value={homeFilter}
                                onChange={(e) => setHomeFilter(e.target.value)}
                                className={cn(
                                    "flex-1 lg:flex-initial px-4 py-2.5 lg:py-2 rounded-xl text-sm font-medium h-11 lg:h-10",
                                    "bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700",
                                    "text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20"
                                )}
                            >
                                <option value="all">Tüm Evler</option>
                                {homes.map(home => (
                                    <option key={home.id} value={home.id}>{home.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        // Loading Skeleton
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : members.length === 0 ? (
                        // Empty State
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <Users className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Henüz Üye Yok</h3>
                            <p className="text-gray-500 text-center max-w-md">
                                Evlerinize üye davet ederek başlayın.
                            </p>
                            {isMaster && (
                                <button
                                    onClick={() => setIsInviteModalOpen(true)}
                                    className="mt-4 flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                                >
                                    <Plus size={20} />
                                    <span>İlk Üyeyi Davet Et</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Residents Section */}
                            <section>
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Home className="text-primary" size={24} />
                                        Aile & Sakinler
                                    </h2>
                                    <span className="text-sm font-medium text-slate-500">{residents.length} Aktif</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {residents.map((member) => (
                                        <MemberCard
                                            key={member.id}
                                            member={member}
                                            onDeleteSuccess={fetchAllMembers}
                                        />
                                    ))}
                                    {residents.length === 0 && (
                                        <div className="col-span-full py-10 text-center text-slate-500">
                                            {filter !== 'Tümü' || homeFilter !== 'all'
                                                ? 'Seçilen filtrelere uygun üye bulunamadı.'
                                                : 'Henüz sakin yok. Birini davet edin!'}
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Guest Section */}
                            <section className="pb-10 mt-6">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Key className="text-primary" size={24} />
                                        Misafir Anahtarları & Geçici Erişim
                                    </h2>
                                    <button className="text-sm font-bold text-primary hover:text-blue-600 transition-colors">Geçmiş</button>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {guests.map((guest) => {
                                        const isExpired = guest.accessExpiresAt && new Date(guest.accessExpiresAt) < new Date();
                                        const formattedDate = guest.accessExpiresAt
                                            ? new Date(guest.accessExpiresAt).toLocaleString('tr-TR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : null;

                                        return (
                                            <div key={guest.id} className={cn(
                                                "flex flex-col md:flex-row md:items-center justify-between p-5 bg-white dark:bg-surface-dark rounded-xl shadow-sm border gap-4 transition-all hover:border-primary/30",
                                                isExpired ? "border-red-200 bg-red-50/10" : "border-slate-100 dark:border-slate-800"
                                            )}>
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "size-12 rounded-lg flex items-center justify-center shrink-0",
                                                        isExpired ? "bg-red-100 text-red-600" : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                                                    )}>
                                                        <Clock size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                            {guest.name}
                                                            {isExpired && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">Süresi Doldu</span>}
                                                        </h4>
                                                        <div className="flex flex-col gap-0.5 mt-0.5">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">@{guest.username || 'misafir'}</p>
                                                                <span className="text-slate-300">•</span>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">Geçici Erişim</p>
                                                            </div>
                                                            {formattedDate && (
                                                                <p className={cn(
                                                                    "text-xs font-medium",
                                                                    isExpired ? "text-red-500" : "text-primary"
                                                                )}>
                                                                    Bitiş: {formattedDate}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 justify-between md:justify-end">
                                                    {/* Show homes */}
                                                    <div className="flex flex-wrap gap-1">
                                                        {guest.homes.map(home => (
                                                            <span key={home.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300">
                                                                <Home size={12} />
                                                                {home.name}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            const homeId = guest.homes?.[0]?.id;
                                                            router.push(`/dashboard/members/${guest.id}${homeId ? `?homeId=${homeId}` : ''}`);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                                                        title="Erişimi Yönet"
                                                    >
                                                        <Settings size={20} />
                                                    </button>

                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm(`${guest.name} isimli misafiri silmek istediğinize emin misiniz?`)) return;
                                                            try {
                                                                await api.delete(`/users/sub/${guest.id}`);
                                                                toast.success('Misafir silindi');
                                                                fetchAllMembers();
                                                            } catch (err) {
                                                                toast.error('Silme işlemi başarısız');
                                                            }
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                        title="Misafiri Sil"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {guests.length === 0 && (
                                        <div className="p-5 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                            Aktif misafir anahtarı yok.
                                        </div>
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </main >

            <InviteMemberModal open={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} onSuccess={fetchAllMembers} />
        </div >
    );
}
