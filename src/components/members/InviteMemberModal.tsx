'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api.service';
import { useHome } from '@/contexts/HomeContext';

interface InviteMemberModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function InviteMemberModal({ open, onClose, onSuccess }: InviteMemberModalProps) {
    const { homes } = useHome();
    const [selectedHomeIds, setSelectedHomeIds] = useState<string[]>([]);
    const [payload, setPayload] = useState({
        fullName: '',
        username: '',
        password: '',
        role: 'member'
    });
    const [loading, setLoading] = useState(false);

    // Set default home when homes are loaded
    useEffect(() => {
        if (homes.length > 0 && selectedHomeIds.length === 0) {
            setSelectedHomeIds([homes[0].id]);
        }
    }, [homes, selectedHomeIds.length]);

    const toggleHome = (homeId: string) => {
        setSelectedHomeIds(prev =>
            prev.includes(homeId)
                ? prev.filter(id => id !== homeId)
                : [...prev, homeId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (selectedHomeIds.length === 0) {
                alert("Please select at least one home");
                setLoading(false);
                return;
            }

            // Manual Validation
            if (payload.password.length < 6) {
                alert("Password must be at least 6 characters long.");
                setLoading(false);
                return;
            }

            // Mapping to backend CreateSubUser input
            await api.post('/users/sub', {
                homeIds: selectedHomeIds, // Multiple homes
                username: payload.username,
                password: payload.password,
                fullName: payload.fullName,
                defaultPermission: 'CONTROL',
                role: payload.role
            });

            onSuccess();
            onClose();
            setPayload({ fullName: '', username: '', password: '', role: 'member' });
            setSelectedHomeIds([]);
        } catch (err: any) {
            console.error("Invite failed", err);
            const message = err.response?.data?.error || err.message || "Failed to invite member";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invite New Member</h3>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    {/* Home Selection - Multi-select */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Assign to Home(s)</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                            {homes.map(home => (
                                <label key={home.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedHomeIds.includes(home.id)}
                                        onChange={() => toggleHome(home.id)}
                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{home.name}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Select one or more homes</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                        <input
                            required
                            value={payload.fullName}
                            onChange={e => setPayload({ ...payload, fullName: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary outline-none"
                            placeholder="e.g. Alex Johnson"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username (Login ID)</label>
                        <input
                            required
                            value={payload.username}
                            onChange={e => setPayload({ ...payload, username: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary outline-none"
                            placeholder="e.g. alexj"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Temporary Password</label>
                        <input
                            required
                            type="password"
                            value={payload.password}
                            onChange={e => setPayload({ ...payload, password: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary outline-none"
                            minLength={6}
                        />
                        <p className="text-xs text-slate-500 mt-1">Min. 6 characters</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role & Access</label>
                        <select
                            value={payload.role}
                            onChange={e => setPayload({ ...payload, role: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary outline-none text-slate-700 dark:text-gray-200"
                        >
                            <option value="MEMBER">Sakin (Standart)</option>
                            <option value="ADMIN">Admin (Yönetici)</option>
                            <option value="GUEST">Misafir (Kısıtlı)</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                            {payload.role === 'ADMIN' && "Can manage devices, rooms, and invited members."}
                            {payload.role === 'MEMBER' && "Can control devices but cannot manage settings."}
                            {payload.role === 'GUEST' && "Limited access, possibly with expiration."}
                        </p>
                    </div>

                    {/* Error Message Display */}
                    {/* Note: In a real app we'd use a state for this */}
                    <div id="form-error" className="text-red-500 text-sm hidden"></div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20 disabled:opacity-50">
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
