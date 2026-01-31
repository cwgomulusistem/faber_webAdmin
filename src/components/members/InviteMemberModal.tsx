'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api.service';
import { getActiveHomeId } from '@/lib/utils';

interface InviteMemberModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function InviteMemberModal({ open, onClose, onSuccess }: InviteMemberModalProps) {
    const [payload, setPayload] = useState({
        fullName: '',
        username: '',
        password: '',
        role: 'member'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const homeId = getActiveHomeId();
            if (!homeId) return;

            // Manual Validation
            if (payload.password.length < 6) {
                alert("Password must be at least 6 characters long.");
                setLoading(false);
                return;
            }

            // Mapping to backend CreateSubUser input
            await api.post('/users/sub', {
                homeId: homeId,
                username: payload.username,
                password: payload.password,
                fullName: payload.fullName,
                defaultPermission: 'CONTROL', // Default
                role: payload.role // Backend might ignore this if not mapped, but intended logic is here
            });

            onSuccess();
            onClose();
            setPayload({ fullName: '', username: '', password: '', role: 'member' });
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
