'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    ArrowLeft, Save, Shield, Smartphone, DoorOpen, LayoutGrid, 
    ChevronDown, User, Home, Loader2, AlertCircle, Check, X,
    Eye, Settings, Lock, Unlock
} from 'lucide-react';
import { cn, getActiveHomeId } from '@/lib/utils';
import api from '@/services/api.service';
import { toast } from 'sonner';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';

// Permission level types matching backend
type PermissionLevel = 'VIEW_ONLY' | 'CONTROL' | 'FULL' | 'PIN_REQUIRED';

interface SubUser {
    id: string;
    username: string;
    fullName: string;
    role: string;
    defaultPermission: PermissionLevel;
    receiveNotifications: boolean;
    accessExpiresAt?: string;
    createdAt: string;
    homeMemberId: string;
    menuPermissions: Record<string, PermissionLevel>;
    devicePermissions: Record<string, PermissionLevel>;
    roomPermissions: Record<string, PermissionLevel>;
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
const MENU_ITEMS = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { key: 'devices', label: 'Cihazlar', icon: Smartphone },
    { key: 'rooms', label: 'Odalar', icon: DoorOpen },
    { key: 'scenes', label: 'Senaryolar', icon: Settings },
    { key: 'members', label: 'Üyeler', icon: User },
    { key: 'settings', label: 'Ayarlar', icon: Settings },
    { key: 'logs', label: 'Loglar', icon: Eye },
];

const PERMISSION_LEVELS: { value: PermissionLevel; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'VIEW_ONLY', label: 'Sadece Görüntüle', icon: <Eye size={14} />, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { value: 'CONTROL', label: 'Kontrol', icon: <Unlock size={14} />, color: 'text-green-600 bg-green-50 border-green-200' },
    { value: 'FULL', label: 'Tam Yetki', icon: <Shield size={14} />, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { value: 'PIN_REQUIRED', label: 'PIN Gerekli', icon: <Lock size={14} />, color: 'text-orange-600 bg-orange-50 border-orange-200' },
];

export default function SubUserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [user, setUser] = useState<SubUser | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Local state for editing permissions
    const [menuPermissions, setMenuPermissions] = useState<Record<string, PermissionLevel>>({});
    const [devicePermissions, setDevicePermissions] = useState<Record<string, PermissionLevel>>({});
    const [roomPermissions, setRoomPermissions] = useState<Record<string, PermissionLevel>>({});
    const [defaultPermission, setDefaultPermission] = useState<PermissionLevel>('CONTROL');

    // Track if there are unsaved changes
    const [hasChanges, setHasChanges] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const homeId = getActiveHomeId();
            if (!homeId) {
                toast.error('Aktif ev bulunamadı');
                return;
            }

            // Fetch user details, devices, and rooms in parallel
            const [userRes, devicesRes, roomsRes] = await Promise.all([
                api.get(`/users/sub?homeId=${homeId}`),
                api.get(`/homes/${homeId}/devices`),
                api.get(`/homes/${homeId}/rooms`)
            ]);

            // Find the specific user
            const subUsers = userRes.data.subUsers || [];
            const foundUser = subUsers.find((u: SubUser) => u.id === userId);
            
            if (!foundUser) {
                toast.error('Kullanıcı bulunamadı');
                router.push('/dashboard/members');
                return;
            }

            setUser(foundUser);
            setDevices(devicesRes.data?.data || []);
            setRooms(roomsRes.data?.data || []);

            // Initialize local permission state
            setMenuPermissions(foundUser.menuPermissions || {});
            setDevicePermissions(foundUser.devicePermissions || {});
            setRoomPermissions(foundUser.roomPermissions || {});
            setDefaultPermission(foundUser.defaultPermission || 'CONTROL');

        } catch (err) {
            console.error('Failed to fetch data:', err);
            toast.error('Veri yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [userId, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Track changes
    useEffect(() => {
        if (!user) return;
        
        const menuChanged = JSON.stringify(menuPermissions) !== JSON.stringify(user.menuPermissions || {});
        const deviceChanged = JSON.stringify(devicePermissions) !== JSON.stringify(user.devicePermissions || {});
        const roomChanged = JSON.stringify(roomPermissions) !== JSON.stringify(user.roomPermissions || {});
        const defaultChanged = defaultPermission !== user.defaultPermission;

        setHasChanges(menuChanged || deviceChanged || roomChanged || defaultChanged);
    }, [menuPermissions, devicePermissions, roomPermissions, defaultPermission, user]);

    const handleSaveMenuPermissions = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await api.patch(`/users/sub/${user.id}/permissions/menu`, {
                permissions: menuPermissions
            });
            toast.success('Menü izinleri kaydedildi');
            setUser(prev => prev ? { ...prev, menuPermissions } : null);
        } catch (err) {
            console.error('Failed to save menu permissions:', err);
            toast.error('Menü izinleri kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDevicePermissions = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await api.patch(`/users/sub/${user.id}/permissions/device`, {
                permissions: devicePermissions
            });
            toast.success('Cihaz izinleri kaydedildi');
            setUser(prev => prev ? { ...prev, devicePermissions } : null);
        } catch (err) {
            console.error('Failed to save device permissions:', err);
            toast.error('Cihaz izinleri kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveRoomPermissions = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await api.patch(`/users/sub/${user.id}/permissions/room`, {
                permissions: roomPermissions
            });
            toast.success('Oda izinleri kaydedildi');
            setUser(prev => prev ? { ...prev, roomPermissions } : null);
        } catch (err) {
            console.error('Failed to save room permissions:', err);
            toast.error('Oda izinleri kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            await Promise.all([
                api.patch(`/users/sub/${user!.id}/permissions/menu`, { permissions: menuPermissions }),
                api.patch(`/users/sub/${user!.id}/permissions/device`, { permissions: devicePermissions }),
                api.patch(`/users/sub/${user!.id}/permissions/room`, { permissions: roomPermissions }),
            ]);
            toast.success('Tüm izinler kaydedildi');
            setUser(prev => prev ? { 
                ...prev, 
                menuPermissions, 
                devicePermissions, 
                roomPermissions 
            } : null);
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
            if (devicePermissions['*'] === level) {
                // Remove wildcard
                const { '*': _, ...rest } = devicePermissions;
                setDevicePermissions(rest);
            } else {
                setDevicePermissions({ '*': level });
            }
        } else {
            if (roomPermissions['*'] === level) {
                const { '*': _, ...rest } = roomPermissions;
                setRoomPermissions(rest);
            } else {
                setRoomPermissions({ '*': level });
            }
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
            <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
                <div className="flex items-center gap-4">
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
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{user.fullName}</h1>
                            <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <span className="text-xs font-medium text-gray-500">Sistem Durumu</span>
                        <ConnectionStatus />
                    </div>

                    {hasChanges && (
                        <button
                            onClick={handleSaveAll}
                            disabled={saving}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all",
                                "bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/25",
                                saving && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {saving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            <span>Tümünü Kaydet</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-4xl mx-auto flex flex-col gap-6">

                    {/* User Profile Card */}
                    <section className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.fullName}</h2>
                                    <p className="text-sm text-gray-500">@{user.username}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Oluşturulma: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                            </div>

                            <div className="w-full md:w-auto">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                    Varsayılan İzin Seviyesi
                                </label>
                                <select
                                    value={defaultPermission}
                                    onChange={(e) => setDefaultPermission(e.target.value as PermissionLevel)}
                                    className="w-full md:w-48 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    {PERMISSION_LEVELS.map(level => (
                                        <option key={level.value} value={level.value}>{level.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

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

                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {MENU_ITEMS.map(item => {
                                const Icon = item.icon;
                                const currentLevel = menuPermissions[item.key];
                                const hasAccess = !!currentLevel;

                                return (
                                    <div key={item.key} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                hasAccess ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-100 dark:bg-gray-800"
                                            )}>
                                                <Icon size={18} className={hasAccess ? "text-green-600 dark:text-green-400" : "text-gray-400"} />
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {hasAccess ? (
                                                <>
                                                    <select
                                                        value={currentLevel}
                                                        onChange={(e) => setMenuPermissions(prev => ({
                                                            ...prev,
                                                            [item.key]: e.target.value as PermissionLevel
                                                        }))}
                                                        className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none"
                                                    >
                                                        {PERMISSION_LEVELS.map(level => (
                                                            <option key={level.value} value={level.value}>{level.label}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => {
                                                            const { [item.key]: _, ...rest } = menuPermissions;
                                                            setMenuPermissions(rest);
                                                        }}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setMenuPermissions(prev => ({
                                                        ...prev,
                                                        [item.key]: 'VIEW_ONLY'
                                                    }))}
                                                    className="flex items-center gap-1 text-sm text-primary hover:text-blue-600 font-medium"
                                                >
                                                    <Check size={14} />
                                                    <span>Erişim Ver</span>
                                                </button>
                                            )}
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
                    <section className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border border-red-200 dark:border-red-900/30">
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
            </main>
        </div>
    );
}
