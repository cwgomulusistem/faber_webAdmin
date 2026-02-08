'use client';

import React, { useState } from 'react';
import { Hash, Eye, EyeOff, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinManagementProps {
    hasPin: boolean;
    onSavePin: (pin: string) => Promise<void>;
    onRemovePin: () => Promise<void>;
    disabled?: boolean;
}

export function PinManagement({ hasPin, onSavePin, onRemovePin, disabled }: PinManagementProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setError('');

        // Validation
        if (pin.length < 4 || pin.length > 6) {
            setError('PIN 4-6 haneli olmalıdır');
            return;
        }
        if (!/^\d+$/.test(pin)) {
            setError('PIN sadece rakam içermelidir');
            return;
        }
        if (pin !== confirmPin) {
            setError('PIN kodları eşleşmiyor');
            return;
        }

        setSaving(true);
        try {
            await onSavePin(pin);
            setIsEditing(false);
            setPin('');
            setConfirmPin('');
        } catch (err) {
            setError('PIN kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async () => {
        if (!confirm('PIN kodunu silmek istediğinize emin misiniz?')) return;

        setSaving(true);
        try {
            await onRemovePin();
        } catch (err) {
            setError('PIN silinemedi');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setPin('');
        setConfirmPin('');
        setError('');
    };

    return (
        <section className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
            <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                <div className="flex items-start gap-3 max-w-md">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
                        <Hash size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">PIN Yönetimi</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Kritik işlemler için 4-6 haneli güvenlik PIN kodu (Alarm, Kapı Kilidi vb.)
                        </p>
                    </div>
                </div>

                {!isEditing ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                        {hasPin ? (
                            <>
                                <div className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 flex-1 sm:flex-initial">
                                    <div className="flex gap-1">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="w-2 h-2 rounded-full bg-green-600" />
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-green-700 dark:text-green-400">AKTİF</span>
                                </div>
                                <div className="flex gap-2 flex-1 sm:flex-initial">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        disabled={disabled}
                                        className="flex-1 px-4 py-3 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white text-sm font-bold border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm transition-colors"
                                    >
                                        Değiştir
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRemove}
                                        disabled={disabled || saving}
                                        className="flex-1 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-800/30 text-red-600 dark:text-red-400 text-sm font-bold border border-red-200 dark:border-red-800 rounded-xl shadow-sm transition-colors"
                                    >
                                        Kaldır
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                disabled={disabled}
                                className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
                            >
                                PIN Oluştur
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 w-full md:w-[320px]">
                        <div className="flex flex-col gap-3">
                            <div className="relative">
                                <input
                                    type={showPin ? 'text' : 'password'}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Yeni PIN"
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-lg tracking-widest"
                                    maxLength={6}
                                    inputMode="numeric"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPin(!showPin)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <input
                                type={showPin ? 'text' : 'password'}
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="PIN Tekrar"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-lg tracking-widest"
                                maxLength={6}
                                inputMode="numeric"
                            />
                        </div>

                        {error && (
                            <p className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving || pin.length < 4}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]",
                                    "bg-primary text-white hover:bg-blue-600 disabled:opacity-50 shadow-lg shadow-primary/20"
                                )}
                            >
                                {saving ? (
                                    <span className="animate-spin text-lg">⏳</span>
                                ) : (
                                    <Check size={18} />
                                )}
                                Kaydet
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={saving}
                                className="px-5 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-[0.98]"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
