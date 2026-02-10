'use client';

import React, { useState, useEffect } from 'react';
import { X, Home, ChevronDown, Check, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api.service';
import { useHome } from '@/contexts/HomeContext';
import { cn } from '@/lib/utils';

interface InviteMemberModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface HomePermissionConfig {
    homeId: string;
    homeName: string;
    role: string;
    defaultPermission: string;
    accessExpiresAt: string;
}

const ROLES = [
    { value: 'MEMBER', label: 'Sakin (Standart)', description: 'Can control devices but cannot manage settings.' },
    { value: 'ADMIN', label: 'Admin (Yönetici)', description: 'Can manage devices, rooms, and invited members.' },
    { value: 'GUEST', label: 'Misafir (Kısıtlı)', description: 'Limited access, possibly with expiration.' },
];

const PERMISSIONS = [
    { value: 'VIEW_ONLY', label: 'Sadece Görüntüle' },
    { value: 'CONTROL', label: 'Kontrol' },
    { value: 'FULL', label: 'Tam Yetki' },
];

export function InviteMemberModal({ open, onClose, onSuccess }: InviteMemberModalProps) {
    const { homes } = useHome();
    const [advancedMode, setAdvancedMode] = useState(false);
    
    // Simple mode state
    const [selectedHomeIds, setSelectedHomeIds] = useState<string[]>([]);
    const [simpleRole, setSimpleRole] = useState('MEMBER');
    const [simplePermission, setSimplePermission] = useState('CONTROL');
    const [simpleExpiry, setSimpleExpiry] = useState('');
    
    // Advanced mode state (per-home settings)
    const [homeConfigs, setHomeConfigs] = useState<HomePermissionConfig[]>([]);
    
    // Common fields
    const [payload, setPayload] = useState({
        fullName: '',
        username: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    // Set default home when homes are loaded
    useEffect(() => {
        if (homes.length > 0 && selectedHomeIds.length === 0) {
            setSelectedHomeIds([homes[0].id]);
        }
    }, [homes, selectedHomeIds.length]);

    // Initialize advanced mode configs when switching
    useEffect(() => {
        if (advancedMode && homeConfigs.length === 0 && selectedHomeIds.length > 0) {
            const configs = selectedHomeIds.map(homeId => {
                const home = homes.find(h => h.id === homeId);
                return {
                    homeId,
                    homeName: home?.name || 'Unknown',
                    role: simpleRole,
                    defaultPermission: simplePermission,
                    accessExpiresAt: simpleExpiry,
                };
            });
            setHomeConfigs(configs);
        }
    }, [advancedMode, selectedHomeIds, homes, simpleRole, simplePermission, simpleExpiry, homeConfigs.length]);

    const toggleHome = (homeId: string) => {
        if (advancedMode) {
            // In advanced mode, add/remove from homeConfigs
            const existing = homeConfigs.find(c => c.homeId === homeId);
            if (existing) {
                setHomeConfigs(prev => prev.filter(c => c.homeId !== homeId));
            } else {
                const home = homes.find(h => h.id === homeId);
                setHomeConfigs(prev => [...prev, {
                    homeId,
                    homeName: home?.name || 'Unknown',
                    role: 'MEMBER',
                    defaultPermission: 'CONTROL',
                    accessExpiresAt: '',
                }]);
            }
        } else {
            // Simple mode
            setSelectedHomeIds(prev =>
                prev.includes(homeId)
                    ? prev.filter(id => id !== homeId)
                    : [...prev, homeId]
            );
        }
    };

    const updateHomeConfig = (homeId: string, field: keyof HomePermissionConfig, value: string) => {
        setHomeConfigs(prev => prev.map(c =>
            c.homeId === homeId ? { ...c, [field]: value } : c
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Validation
            if (payload.password.length < 6) {
                alert("Password must be at least 6 characters long.");
                setLoading(false);
                return;
            }

            if (advancedMode) {
                // Advanced mode: per-home settings
                if (homeConfigs.length === 0) {
                    alert("Please add at least one home");
                    setLoading(false);
                    return;
                }

                await api.post('/users/sub', {
                    homes: homeConfigs.map(c => ({
                        homeId: c.homeId,
                        role: c.role,
                        defaultPermission: c.defaultPermission,
                        accessExpiresAt: c.accessExpiresAt ? new Date(c.accessExpiresAt).toISOString() : null,
                    })),
                    username: payload.username,
                    password: payload.password,
                    fullName: payload.fullName,
                });
            } else {
                // Simple mode: same settings for all homes
                if (selectedHomeIds.length === 0) {
                    alert("Please select at least one home");
                    setLoading(false);
                    return;
                }

                await api.post('/users/sub', {
                    homeIds: selectedHomeIds,
                    username: payload.username,
                    password: payload.password,
                    fullName: payload.fullName,
                    defaultPermission: simplePermission,
                    role: simpleRole,
                    accessExpiresAt: simpleExpiry ? new Date(simpleExpiry).toISOString() : null,
                });
            }

            onSuccess();
            onClose();
            resetForm();
        } catch (err: any) {
            console.error("Invite failed", err);
            const message = err.response?.data?.error || err.message || "Failed to invite member";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setPayload({ fullName: '', username: '', password: '' });
        setSelectedHomeIds([]);
        setHomeConfigs([]);
        setSimpleRole('MEMBER');
        setSimplePermission('CONTROL');
        setSimpleExpiry('');
        setAdvancedMode(false);
    };

    if (!open) return null;

    const selectedHomes = advancedMode 
        ? homeConfigs.map(c => c.homeId)
        : selectedHomeIds;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Yeni Üye Davet Et</h3>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {/* User Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ad Soyad</label>
                            <input
                                required
                                value={payload.fullName}
                                onChange={e => setPayload({ ...payload, fullName: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary outline-none"
                                placeholder="örn: Ali Veli"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kullanıcı Adı</label>
                            <input
                                required
                                value={payload.username}
                                onChange={e => setPayload({ ...payload, username: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary outline-none"
                                placeholder="örn: aliveli"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Geçici Şifre</label>
                        <input
                            required
                            type="password"
                            value={payload.password}
                            onChange={e => setPayload({ ...payload, password: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary outline-none"
                            minLength={6}
                        />
                        <p className="text-xs text-slate-500 mt-1">Min. 6 karakter</p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Gelişmiş Mod</p>
                            <p className="text-xs text-slate-500">Her ev için farklı izinler tanımla</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAdvancedMode(!advancedMode)}
                            className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                advancedMode ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                            )}
                        >
                            <span
                                className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                    advancedMode ? "translate-x-6" : "translate-x-1"
                                )}
                            />
                        </button>
                    </div>

                    {/* Home Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Evler {advancedMode && <span className="text-xs text-slate-500">(Her ev için farklı ayarlar)</span>}
                        </label>
                        <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                            {homes.map(home => {
                                const isSelected = selectedHomes.includes(home.id);
                                return (
                                    <label key={home.id} className={cn(
                                        "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                                        isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                    )}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleHome(home.id)}
                                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <Home size={16} className={isSelected ? "text-primary" : "text-slate-400"} />
                                        <span className={cn(
                                            "text-sm font-medium",
                                            isSelected ? "text-primary" : "text-slate-700 dark:text-slate-300"
                                        )}>{home.name}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {!advancedMode ? (
                        /* Simple Mode - Single settings for all homes */
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rol</label>
                                    <select
                                        value={simpleRole}
                                        onChange={e => setSimpleRole(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        {ROLES.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Varsayılan İzin</label>
                                    <select
                                        value={simplePermission}
                                        onChange={e => setSimplePermission(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        {PERMISSIONS.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {simpleRole === 'GUEST' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Erişim Süresi (Opsiyonel)</label>
                                    <input
                                        type="datetime-local"
                                        value={simpleExpiry}
                                        onChange={e => setSimpleExpiry(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Advanced Mode - Per-home settings */
                        <div className="space-y-3">
                            {homeConfigs.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <Home size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>Üyelik için yukarıdan ev seçin</p>
                                </div>
                            ) : (
                                homeConfigs.map((config, idx) => (
                                    <div
                                        key={config.homeId}
                                        className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Home size={16} className="text-primary" />
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white">{config.homeName}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setHomeConfigs(prev => prev.filter(c => c.homeId !== config.homeId))}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Rol</label>
                                                <select
                                                    value={config.role}
                                                    onChange={e => updateHomeConfig(config.homeId, 'role', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                >
                                                    {ROLES.map(r => (
                                                        <option key={r.value} value={r.value}>{r.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">İzin Seviyesi</label>
                                                <select
                                                    value={config.defaultPermission}
                                                    onChange={e => updateHomeConfig(config.homeId, 'defaultPermission', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                >
                                                    {PERMISSIONS.map(p => (
                                                        <option key={p.value} value={p.value}>{p.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Erişim Süresi</label>
                                                <input
                                                    type="datetime-local"
                                                    value={config.accessExpiresAt}
                                                    onChange={e => updateHomeConfig(config.homeId, 'accessExpiresAt', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (advancedMode ? homeConfigs.length === 0 : selectedHomeIds.length === 0)}
                            className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                        >
                            {loading ? 'Oluşturuluyor...' : 'Hesap Oluştur'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
