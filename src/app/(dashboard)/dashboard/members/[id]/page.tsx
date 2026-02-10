'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, Save, Shield, Smartphone, DoorOpen, LayoutGrid,
    ChevronDown, User, Home, Loader2, AlertCircle, Check, X,
    Eye, Settings, Lock, Unlock, Clock, Calendar, Building2
} from 'lucide-react';
import { cn, getActiveHomeId } from '@/lib/utils';
import api from '@/services/api.service';
import { toast } from 'sonner';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import { ScheduleSelector, AccessSchedule } from '@/components/members/ScheduleSelector';
import { PinManagement } from '@/components/members/PinManagement';

// Permission level types matching backend
type PermissionLevel = 'VIEW_ONLY' | 'CONTROL' | 'FULL' | 'PIN_REQUIRED';

interface HomeMembership {
    homeId: string;
    homeName: string;
    homeMemberId: string;
    role: string;
    defaultPermission: PermissionLevel;
    accessExpiresAt?: string;
    menuPermissions: Record<string, boolean>;
    devicePermissions: Record<string, PermissionLevel>;
    roomPermissions: Record<string, PermissionLevel>;
    permissionVersion: number;
    hasPin?: boolean;
    accessSchedule?: AccessSchedule;
}

interface SubUserWithMemberships {
    id: string;
    username: string;
    fullName: string;
    role: string;
    createdAt: string;
    memberships: HomeMembership[];
}

interface Device {
    id: string;
    name: string;
    type: string;
    roomId?: string;
}

interface Room {
    id: string;
    name: string;
    icon?: string;
}

// Menu items that can be controlled
// Role-based restrictions:
// - requiresMaster: Only MASTER system role can access (backend restriction)
// - requiredMemberRoles: Only these home member roles can access
interface MenuItemConfig {
    key: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    requiresMaster?: boolean;
    requiredMemberRoles?: string[];
}

const MENU_ITEMS: MenuItemConfig[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { key: 'devices', label: 'Cihazlar', icon: Smartphone },
    { key: 'rooms', label: 'Odalar', icon: DoorOpen },
    { key: 'scenes', label: 'Senaryolar', icon: Settings, requiresMaster: true },
    { key: 'members', label: 'Üyeler', icon: User, requiredMemberRoles: ['OWNER', 'ADMIN'] },
    { key: 'settings', label: 'Ayarlar', icon: Settings, requiredMemberRoles: ['OWNER', 'ADMIN'] },
    { key: 'logs', label: 'Loglar', icon: Eye, requiresMaster: true },
];

const PERMISSION_LEVELS: { value: PermissionLevel; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'VIEW_ONLY', label: 'Sadece Görüntüle', icon: <Eye size={14} />, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { value: 'CONTROL', label: 'Kontrol', icon: <Unlock size={14} />, color: 'text-green-600 bg-green-50 border-green-200' },
    { value: 'FULL', label: 'Tam Yetki', icon: <Shield size={14} />, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { value: 'PIN_REQUIRED', label: 'PIN Gerekli', icon: <Lock size={14} />, color: 'text-orange-600 bg-orange-50 border-orange-200' },
];

export default function SubUserDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const userId = params.id as string;
    const queryHomeId = searchParams.get('homeId');

    const [user, setUser] = useState<SubUserWithMemberships | null>(null);
    const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isHomeSelectorOpen, setIsHomeSelectorOpen] = useState(false);

    // Local state for editing permissions (for current selected home)
    const [menuPermissions, setMenuPermissions] = useState<Record<string, PermissionLevel>>({});
    const [devicePermissions, setDevicePermissions] = useState<Record<string, PermissionLevel>>({});
    const [roomPermissions, setRoomPermissions] = useState<Record<string, PermissionLevel>>({});
    const [defaultPermission, setDefaultPermission] = useState<PermissionLevel>('CONTROL');
    const [accessExpiresAt, setAccessExpiresAt] = useState<string | undefined>();
    const [accessSchedule, setAccessSchedule] = useState<AccessSchedule>({
        enabled: false,
        days: [],
        timeStart: '08:00',
        timeEnd: '18:00',
    });

    // Track if there are unsaved changes
    const [hasChanges, setHasChanges] = useState(false);

    // Get current membership based on selected home
    const currentMembership = user?.memberships.find(m => m.homeId === selectedHomeId);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch user with ALL memberships
            const userRes = await api.get(`/users/sub/${userId}/memberships`);
            const foundUser = userRes.data as SubUserWithMemberships;

            if (!foundUser || foundUser.memberships.length === 0) {
                toast.error('Kullanıcı bulunamadı');
                router.push('/dashboard/members');
                return;
            }

            setUser(foundUser);

            // Select initial home: query param > first membership
            const initialHomeId = queryHomeId || foundUser.memberships[0]?.homeId;
            setSelectedHomeId(initialHomeId);

        } catch (err) {
            console.error('Failed to fetch data:', err);
            toast.error('Veri yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [userId, router, queryHomeId]);

    // Fetch home-specific data when selected home changes
    const fetchHomeData = useCallback(async (homeId: string) => {
        try {
            // Fetch devices and rooms for the selected home
            const [devicesRes, roomsRes] = await Promise.all([
                api.get(`/homes/${homeId}/devices`),
                api.get(`/homes/${homeId}/rooms`)
            ]);

            setDevices(devicesRes.data?.data || []);
            setRooms(roomsRes.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch home data:', err);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // When selected home changes, fetch home data and update local state
    useEffect(() => {
        if (!selectedHomeId || !user) return;

        fetchHomeData(selectedHomeId);

        const membership = user.memberships.find(m => m.homeId === selectedHomeId);
        if (membership) {
            // Map boolean menu permissions to PermissionLevel
            const menuPerms: Record<string, PermissionLevel> = {};
            if (membership.menuPermissions) {
                Object.entries(membership.menuPermissions).forEach(([key, val]) => {
                    if (val === true) menuPerms[key] = 'VIEW_ONLY';
                });
            }
            setMenuPermissions(menuPerms);
            setDevicePermissions(membership.devicePermissions || {});
            setRoomPermissions(membership.roomPermissions || {});
            setDefaultPermission(membership.defaultPermission || 'CONTROL');
            setAccessExpiresAt(membership.accessExpiresAt);

            if (membership.accessSchedule) {
                setAccessSchedule(membership.accessSchedule);
            } else {
                setAccessSchedule({ enabled: false, days: [], timeStart: '08:00', timeEnd: '18:00' });
            }
        }
    }, [selectedHomeId, user, fetchHomeData]);

    // Track changes
    useEffect(() => {
        if (!currentMembership) return;

        const originalMenuPerms: Record<string, PermissionLevel> = {};
        if (currentMembership.menuPermissions) {
            Object.entries(currentMembership.menuPermissions).forEach(([key, val]) => {
                if (val === true) originalMenuPerms[key] = 'VIEW_ONLY';
            });
        }

        const menuChanged = JSON.stringify(menuPermissions) !== JSON.stringify(originalMenuPerms);
        const deviceChanged = JSON.stringify(devicePermissions) !== JSON.stringify(currentMembership.devicePermissions || {});
        const roomChanged = JSON.stringify(roomPermissions) !== JSON.stringify(currentMembership.roomPermissions || {});
        const defaultChanged = defaultPermission !== currentMembership.defaultPermission;
        const accessChanged = accessExpiresAt !== currentMembership.accessExpiresAt;

        setHasChanges(menuChanged || deviceChanged || roomChanged || defaultChanged || accessChanged);
    }, [menuPermissions, devicePermissions, roomPermissions, defaultPermission, accessExpiresAt, currentMembership]);

    const handleSaveMenuPermissions = async () => {
        if (!user || !selectedHomeId) return;
        setSaving(true);
        try {
            const userSystemRole = user?.role || 'SUB';
            const userMemberRole = currentMembership?.role || 'GUEST';

            const menuPermsPayload: Record<string, boolean> = {};
            Object.entries(menuPermissions).forEach(([key, val]) => {
                // Find menu item config to check role restrictions
                const menuItem = MENU_ITEMS.find(m => m.key === key);
                if (!menuItem) return;

                // Don't save if role-blocked
                const isBlockedByMaster = menuItem.requiresMaster && userSystemRole !== 'MASTER';
                const isBlockedByMemberRole = menuItem.requiredMemberRoles && 
                    !menuItem.requiredMemberRoles.includes(userMemberRole);

                if (isBlockedByMaster || isBlockedByMemberRole) return;

                if (val) menuPermsPayload[key] = true;
            });

            await api.patch(`/users/sub/${user.id}/menu-permissions`, {
                menuPermissions: menuPermsPayload,
                homeId: selectedHomeId
            });
            toast.success('Menü izinleri kaydedildi');
            fetchData();
        } catch (err) {
            console.error('Failed to save menu permissions:', err);
            toast.error('Menü izinleri kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDevicePermissions = async () => {
        if (!user || !selectedHomeId) return;
        setSaving(true);
        try {
            await api.patch(`/users/sub/${user.id}/device-permissions`, {
                devicePermissions: devicePermissions,
                homeId: selectedHomeId
            });
            toast.success('Cihaz izinleri kaydedildi');
            await fetchData();
        } catch (err) {
            console.error('Failed to save device permissions:', err);
            toast.error('Cihaz izinleri kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveRoomPermissions = async () => {
        if (!user || !selectedHomeId) return;
        setSaving(true);
        try {
            await api.patch(`/users/sub/${user.id}/room-permissions`, {
                roomPermissions: roomPermissions,
                homeId: selectedHomeId
            });
            toast.success('Oda izinleri kaydedildi');
            await fetchData();
        } catch (err) {
            console.error('Failed to save room permissions:', err);
            toast.error('Oda izinleri kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAll = async () => {
        if (!user || !selectedHomeId) return;
        setSaving(true);
        try {
            const userSystemRole = user?.role || 'SUB';
            const userMemberRole = currentMembership?.role || 'GUEST';

            const menuPermsPayload: Record<string, boolean> = {};
            Object.entries(menuPermissions).forEach(([key, val]) => {
                // Find menu item config to check role restrictions
                const menuItem = MENU_ITEMS.find(m => m.key === key);
                if (!menuItem) return;

                // Don't save if role-blocked
                const isBlockedByMaster = menuItem.requiresMaster && userSystemRole !== 'MASTER';
                const isBlockedByMemberRole = menuItem.requiredMemberRoles && 
                    !menuItem.requiredMemberRoles.includes(userMemberRole);

                if (isBlockedByMaster || isBlockedByMemberRole) return;

                if (val) menuPermsPayload[key] = true;
            });

            await Promise.all([
                api.patch(`/users/sub/${user!.id}/menu-permissions`, { menuPermissions: menuPermsPayload, homeId: selectedHomeId }),
                api.patch(`/users/sub/${user!.id}/device-permissions`, { devicePermissions: devicePermissions, homeId: selectedHomeId }),
                api.patch(`/users/sub/${user!.id}/room-permissions`, { roomPermissions: roomPermissions, homeId: selectedHomeId }),
                api.patch(`/users/sub/${user!.id}`, { accessExpiresAt: accessExpiresAt || null, homeId: selectedHomeId }),
            ]);
            toast.success('Tüm izinler kaydedildi');
            await fetchData();
            setHasChanges(false);
        } catch (err) {
            console.error('Failed to save permissions:', err);
            toast.error('İzinler kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    // Toggle wildcard permission for devices/rooms
    const toggleWildcard = (type: 'device' | 'room', level: PermissionLevel) => {
        if (type === 'device') {
            setDevicePermissions(prev => {
                if (prev['*'] === level) {
                    const { '*': _, ...rest } = prev;
                    return rest;
                }
                return { ...prev, '*': level };
            });
        } else {
            setRoomPermissions(prev => {
                if (prev['*'] === level) {
                    const { '*': _, ...rest } = prev;
                    return rest;
                }
                return { ...prev, '*': level };
            });
        }
    };

    // Handler for saving PIN
    const handleSavePin = async (pin: string) => {
        if (!user || !selectedHomeId) return;
        try {
            await api.patch(`/users/sub/${user.id}`, { pin, homeId: selectedHomeId });
            toast.success('PIN kaydedildi');
            await fetchData();
        } catch (err) {
            console.error('Failed to save PIN:', err);
            toast.error('PIN kaydedilemedi');
            throw err;
        }
    };

    // Handler for removing PIN
    const handleRemovePin = async () => {
        if (!user || !selectedHomeId) return;
        try {
            await api.patch(`/users/sub/${user.id}`, { pin: '', homeId: selectedHomeId });
            toast.success('PIN kaldırıldı');
            await fetchData();
        } catch (err) {
            console.error('Failed to remove PIN:', err);
            toast.error('PIN kaldırılamadı');
        }
    };

    // Handler for saving schedule
    const handleSaveSchedule = async () => {
        if (!user || !selectedHomeId) return;
        setSaving(true);
        try {
            await api.patch(`/users/sub/${user.id}`, { accessSchedule, homeId: selectedHomeId });
            toast.success('Erişim takvimi kaydedildi');
            fetchData();
        } catch (err) {
            toast.error('Erişim takvimi kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
                <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-6">
                    <button onClick={() => router.back()} className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <ArrowLeft size={20} className="text-gray-500" />
                    </button>
                    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </header>
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col h-full bg-background-light dark:bg-background-dark items-center justify-center gap-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kullanıcı Bulunamadı</h2>
                <button
                    onClick={() => router.push('/dashboard/members')}
                    className="px-4 py-2 bg-primary text-white rounded-lg"
                >
                    Üyelere Dön
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
            {/* Header */}
            <header className="min-h-16 h-auto md:h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-4 md:py-0 shrink-0 z-10 gap-4">
                <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-500" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">{user.fullName}</h1>
                            <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 hidden md:block" />

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <span className="text-xs font-medium text-gray-500">Sistem Durumu</span>
                        <ConnectionStatus />
                    </div>

                    {hasChanges && (
                        <button
                            onClick={handleSaveAll}
                            disabled={saving}
                            className={cn(
                                "flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all flex-1 md:flex-initial",
                                "bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/25",
                                saving && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {saving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            <span className="whitespace-nowrap">Kaydet</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-4xl mx-auto flex flex-col gap-6">

                    {/* Home Selector - Only show if user has multiple home memberships */}
                    {user.memberships.length > 1 && (
                        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Ev Seçimi</p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                            {user.memberships.length} evde üyelik var - izinleri düzenlemek için ev seçin
                                        </p>
                                    </div>
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => setIsHomeSelectorOpen(!isHomeSelectorOpen)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-all"
                                    >
                                        <Home size={18} className="text-blue-600" />
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {currentMembership?.homeName || 'Ev Seç'}
                                        </span>
                                        <ChevronDown size={16} className={cn("text-gray-400 transition-transform", isHomeSelectorOpen && "rotate-180")} />
                                    </button>

                                    {isHomeSelectorOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsHomeSelectorOpen(false)} />
                                            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-2">
                                                {user.memberships.map(membership => (
                                                    <button
                                                        key={membership.homeId}
                                                        onClick={() => {
                                                            setSelectedHomeId(membership.homeId);
                                                            setIsHomeSelectorOpen(false);
                                                        }}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                                                            selectedHomeId === membership.homeId && "bg-blue-50 dark:bg-blue-900/30"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center",
                                                            selectedHomeId === membership.homeId
                                                                ? "bg-primary text-white"
                                                                : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                                                        )}>
                                                            <Home size={16} />
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <p className={cn(
                                                                "text-sm font-medium",
                                                                selectedHomeId === membership.homeId ? "text-primary" : "text-gray-700 dark:text-gray-300"
                                                            )}>
                                                                {membership.homeName}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{membership.role}</p>
                                                        </div>
                                                        {selectedHomeId === membership.homeId && (
                                                            <Check size={16} className="text-primary" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Profile Section */}
                    <section className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.fullName}</h2>
                                    <p className="text-sm text-gray-500">@{user.username}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-medium">
                                            {currentMembership?.role || 'N/A'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {currentMembership?.homeName}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 w-full md:w-auto min-w-[280px]">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                                    <Clock size={12} />
                                    Erişim Süresi (Boş = Sınırsız)
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <input
                                            type="datetime-local"
                                            value={accessExpiresAt ? accessExpiresAt.slice(0, 16) : ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (!val) setAccessExpiresAt(undefined);
                                                else setAccessExpiresAt(new Date(val).toISOString());
                                            }}
                                            className={cn(
                                                "w-full pl-10 pr-4 py-2 rounded-xl text-sm transition-all",
                                                "bg-gray-50 dark:bg-gray-800 border border-slate-200 dark:border-slate-700",
                                                "focus:ring-2 focus:ring-primary/20 outline-none h-10",
                                                accessExpiresAt && new Date(accessExpiresAt) < new Date() && "border-red-300 text-red-600"
                                            )}
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            const nextWeek = new Date();
                                            nextWeek.setDate(nextWeek.getDate() + 7);
                                            setAccessExpiresAt(nextWeek.toISOString());
                                        }}
                                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors h-10"
                                    >
                                        +7 Gün
                                    </button>
                                </div>
                                {accessExpiresAt && new Date(accessExpiresAt) < new Date() && (
                                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                                        <AlertCircle size={10} />
                                        Süresi dolmuş! Yenilemek için ileri bir tarih seçin.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Access & Security Section */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-2 px-1">
                            <Lock className="text-primary" size={20} />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Erişim & Güvenlik</h3>
                        </div>

                        <PinManagement
                            hasPin={!!currentMembership?.hasPin}
                            onSavePin={handleSavePin}
                            onRemovePin={handleRemovePin}
                            disabled={saving}
                        />

                        <ScheduleSelector
                            value={accessSchedule}
                            onChange={setAccessSchedule}
                            disabled={saving}
                        />

                        {JSON.stringify(accessSchedule) !== JSON.stringify(currentMembership?.accessSchedule || { enabled: false, days: [], timeStart: '08:00', timeEnd: '18:00' }) && (
                            <button
                                onClick={handleSaveSchedule}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Zamanlanmış Erişim Ayarlarını Kaydet
                            </button>
                        )}
                    </div>

                    {/* Permissions Section */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-2 px-1">
                            <Shield className="text-primary" size={20} />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Yetkiler & İzinler
                                {currentMembership && (
                                    <span className="ml-2 text-sm font-normal text-gray-500">
                                        ({currentMembership.homeName})
                                    </span>
                                )}
                            </h3>
                        </div>

                        {/* Menu Permissions */}
                        <section className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                                        <LayoutGrid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Menü İzinleri</h3>
                                        <p className="text-xs text-gray-500">Kullanıcının erişebileceği menüleri belirleyin</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSaveMenuPermissions}
                                    disabled={saving}
                                    className="text-sm text-primary hover:text-blue-600 font-semibold"
                                >
                                    Kaydet
                                </button>
                            </div>

                            {/* Role Info Banner */}
                            <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield size={14} className="text-blue-600 dark:text-blue-400" />
                                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                            Kullanıcı Rolü:
                                        </span>
                                        <span className={cn(
                                            "text-xs font-bold px-2 py-0.5 rounded-full",
                                            currentMembership?.role === 'OWNER' && "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
                                            currentMembership?.role === 'ADMIN' && "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
                                            currentMembership?.role === 'MEMBER' && "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
                                            currentMembership?.role === 'GUEST' && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                        )}>
                                            {currentMembership?.role || 'N/A'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-blue-600 dark:text-blue-400">
                                        Bazı menüler rol gerektirir
                                    </span>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {MENU_ITEMS.map(item => {
                                    const Icon = item.icon;
                                    const currentLevel = menuPermissions[item.key];
                                    const hasAccess = !!currentLevel;

                                    // Check role-based restrictions
                                    // SUB users (not MASTER) cannot access requiresMaster menus
                                    const userSystemRole = user?.role || 'SUB';
                                    const userMemberRole = currentMembership?.role || 'GUEST';
                                    
                                    // MASTER role requirement (system-wide)
                                    const isBlockedByMasterRequirement = item.requiresMaster && userSystemRole !== 'MASTER';
                                    
                                    // Member role requirement (home-level)
                                    const isBlockedByMemberRole = item.requiredMemberRoles && 
                                        !item.requiredMemberRoles.includes(userMemberRole);
                                    
                                    const isRoleBlocked = isBlockedByMasterRequirement || isBlockedByMemberRole;
                                    
                                    // Generate restriction message
                                    let restrictionMessage = '';
                                    if (isBlockedByMasterRequirement) {
                                        restrictionMessage = 'Sadece sistem yöneticileri (MASTER) erişebilir';
                                    } else if (isBlockedByMemberRole) {
                                        restrictionMessage = `${item.requiredMemberRoles?.join(' veya ')} rolü gerekli`;
                                    }

                                    return (
                                        <div 
                                            key={item.key} 
                                            className={cn(
                                                "flex items-center justify-between px-6 py-4 transition-colors",
                                                isRoleBlocked 
                                                    ? "bg-gray-50 dark:bg-gray-900/30 opacity-60" 
                                                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-lg",
                                                    isRoleBlocked 
                                                        ? "bg-gray-200 dark:bg-gray-800" 
                                                        : hasAccess 
                                                            ? "bg-green-50 dark:bg-green-900/20" 
                                                            : "bg-gray-100 dark:bg-gray-800"
                                                )}>
                                                    <Icon size={18} className={cn(
                                                        isRoleBlocked 
                                                            ? "text-gray-400" 
                                                            : hasAccess 
                                                                ? "text-green-600 dark:text-green-400" 
                                                                : "text-gray-400"
                                                    )} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={cn(
                                                        "font-medium",
                                                        isRoleBlocked 
                                                            ? "text-gray-400 dark:text-gray-500" 
                                                            : "text-gray-900 dark:text-white"
                                                    )}>
                                                        {item.label}
                                                    </span>
                                                    {isRoleBlocked && (
                                                        <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                                            <Lock size={10} />
                                                            {restrictionMessage}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (isRoleBlocked) return; // Don't allow toggle if role blocked
                                                        if (hasAccess) {
                                                            const { [item.key]: _, ...rest } = menuPermissions;
                                                            setMenuPermissions(rest);
                                                        } else {
                                                            setMenuPermissions(prev => ({
                                                                ...prev,
                                                                [item.key]: 'VIEW_ONLY'
                                                            }));
                                                        }
                                                    }}
                                                    disabled={isRoleBlocked}
                                                    className={cn(
                                                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
                                                        isRoleBlocked 
                                                            ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                                                            : hasAccess 
                                                                ? "bg-primary" 
                                                                : "bg-gray-200 dark:bg-gray-700"
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                            hasAccess && !isRoleBlocked ? "translate-x-6" : "translate-x-1"
                                                        )}
                                                    />
                                                </button>
                                                <span className={cn(
                                                    "text-sm font-medium min-w-[4rem]",
                                                    isRoleBlocked 
                                                        ? "text-gray-400 dark:text-gray-500" 
                                                        : "text-gray-700 dark:text-gray-300"
                                                )}>
                                                    {isRoleBlocked ? 'Kilitli' : hasAccess ? 'Açık' : 'Kapalı'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Device Permissions */}
                        <section className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                        <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cihaz İzinleri</h3>
                                        <p className="text-xs text-gray-500">Cihaz bazlı erişim kontrolü</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSaveDevicePermissions}
                                    disabled={saving}
                                    className="text-sm text-primary hover:text-blue-600 font-semibold"
                                >
                                    Kaydet
                                </button>
                            </div>

                            {/* Wildcard Option */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Tüm Cihazlara Erişim</p>
                                        <p className="text-xs text-gray-500">Wildcard (*) ile tüm cihazlara tek seferde izin verin</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {PERMISSION_LEVELS.map(level => (
                                            <button
                                                key={level.value}
                                                onClick={() => toggleWildcard('device', level.value)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                                    devicePermissions['*'] === level.value
                                                        ? level.color
                                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary"
                                                )}
                                            >
                                                {level.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                                {devices.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">Bu evde cihaz bulunamadı.</div>
                                ) : (
                                    devices.map(device => {
                                        const currentLevel = devicePermissions[device.id];
                                        const hasWildcard = !!devicePermissions['*'];
                                        const effectiveLevel = currentLevel || (hasWildcard ? devicePermissions['*'] : undefined);

                                        return (
                                            <div key={device.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "p-2 rounded-lg",
                                                        effectiveLevel ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-100 dark:bg-gray-800"
                                                    )}>
                                                        <Smartphone size={16} className={effectiveLevel ? "text-blue-600" : "text-gray-400"} />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-900 dark:text-white text-sm">{device.name}</span>
                                                        {hasWildcard && !currentLevel && (
                                                            <span className="ml-2 text-xs text-gray-400">(Wildcard)</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <select
                                                    value={currentLevel || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value as PermissionLevel | '';
                                                        if (value === '') {
                                                            const { [device.id]: _, ...rest } = devicePermissions;
                                                            setDevicePermissions(rest);
                                                        } else {
                                                            setDevicePermissions(prev => ({
                                                                ...prev,
                                                                [device.id]: value as PermissionLevel
                                                            }));
                                                        }
                                                    }}
                                                    className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none"
                                                >
                                                    <option value="">Varsayılan</option>
                                                    {PERMISSION_LEVELS.map(level => (
                                                        <option key={level.value} value={level.value}>{level.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>

                        {/* Room Permissions */}
                        <section className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                                        <DoorOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Oda İzinleri</h3>
                                        <p className="text-xs text-gray-500">Oda bazlı erişim kontrolü</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSaveRoomPermissions}
                                    disabled={saving}
                                    className="text-sm text-primary hover:text-blue-600 font-semibold"
                                >
                                    Kaydet
                                </button>
                            </div>

                            {/* Wildcard Option */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Tüm Odalara Erişim</p>
                                        <p className="text-xs text-gray-500">Wildcard (*) ile tüm odalara tek seferde izin verin</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {PERMISSION_LEVELS.map(level => (
                                            <button
                                                key={level.value}
                                                onClick={() => toggleWildcard('room', level.value)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                                    roomPermissions['*'] === level.value
                                                        ? level.color
                                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary"
                                                )}
                                            >
                                                {level.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                                {rooms.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">Bu evde oda bulunamadı.</div>
                                ) : (
                                    rooms.map(room => {
                                        const currentLevel = roomPermissions[room.id];
                                        const hasWildcard = !!roomPermissions['*'];
                                        const effectiveLevel = currentLevel || (hasWildcard ? roomPermissions['*'] : undefined);

                                        return (
                                            <div key={room.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "p-2 rounded-lg",
                                                        effectiveLevel ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-gray-100 dark:bg-gray-800"
                                                    )}>
                                                        <DoorOpen size={16} className={effectiveLevel ? "text-emerald-600" : "text-gray-400"} />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-900 dark:text-white text-sm">{room.name}</span>
                                                        {hasWildcard && !currentLevel && (
                                                            <span className="ml-2 text-xs text-gray-400">(Wildcard)</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <select
                                                    value={currentLevel || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value as PermissionLevel | '';
                                                        if (value === '') {
                                                            const { [room.id]: _, ...rest } = roomPermissions;
                                                            setRoomPermissions(rest);
                                                        } else {
                                                            setRoomPermissions(prev => ({
                                                                ...prev,
                                                                [room.id]: value as PermissionLevel
                                                            }));
                                                        }
                                                    }}
                                                    className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none"
                                                >
                                                    <option value="">Varsayılan</option>
                                                    {PERMISSION_LEVELS.map(level => (
                                                        <option key={level.value} value={level.value}>{level.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>

                        {/* Danger Zone */}
                        <section className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border border-red-200 dark:border-red-900/30 mb-10">
                            <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Tehlikeli Bölge</h3>
                            <p className="text-sm text-red-600 dark:text-red-400/80 mb-4">
                                Bu kullanıcıyı sistemden kaldırmak geri alınamaz bir işlemdir.
                            </p>
                            <button
                                onClick={async () => {
                                    if (confirm(`${user.fullName} kullanıcısını silmek istediğinize emin misiniz?`)) {
                                        try {
                                            await api.delete(`/users/sub/${user.id}`);
                                            toast.success('Kullanıcı silindi');
                                            router.push('/dashboard/members');
                                        } catch (err) {
                                            toast.error('Kullanıcı silinemedi');
                                        }
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors"
                            >
                                Kullanıcıyı Sil
                            </button>
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
}
