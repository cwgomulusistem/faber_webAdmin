'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Day abbreviations in Turkish
const DAYS = [
    { key: 'Mon', label: 'Pzt' },
    { key: 'Tue', label: 'Sal' },
    { key: 'Wed', label: 'Çar' },
    { key: 'Thu', label: 'Per' },
    { key: 'Fri', label: 'Cum' },
    { key: 'Sat', label: 'Cmt' },
    { key: 'Sun', label: 'Paz' },
];

export interface AccessSchedule {
    enabled: boolean;
    days: string[];
    timeStart: string;
    timeEnd: string;
}

interface ScheduleSelectorProps {
    value: AccessSchedule;
    onChange: (schedule: AccessSchedule) => void;
    disabled?: boolean;
}

export function ScheduleSelector({ value, onChange, disabled }: ScheduleSelectorProps) {
    const handleToggleEnabled = () => {
        onChange({ ...value, enabled: !value.enabled });
    };

    const handleDayToggle = (day: string) => {
        const currentDays = value.days || [];
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day];
        onChange({ ...value, days: newDays });
    };

    const handleSelectAllDays = () => {
        const currentDays = value.days || [];
        if (currentDays.length === 7) {
            onChange({ ...value, days: [] });
        } else {
            onChange({ ...value, days: DAYS.map(d => d.key) });
        }
    };

    const handleTimeChange = (field: 'timeStart' | 'timeEnd', time: string) => {
        onChange({ ...value, [field]: time });
    };

    return (
        <section className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Clock className="text-primary w-6 h-6" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Zamanlanmış Erişim</h3>
                </div>
                <button
                    onClick={handleToggleEnabled}
                    disabled={disabled}
                    className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        value.enabled ? "bg-primary" : "bg-slate-300 dark:bg-slate-600",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <span
                        className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            value.enabled ? "translate-x-6" : "translate-x-1"
                        )}
                    />
                </button>
            </div>

            <div className={cn("flex flex-col gap-6", !value.enabled && "opacity-50 pointer-events-none")}>
                {/* Active Days */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Aktif Günler</label>
                        <button
                            type="button"
                            onClick={handleSelectAllDays}
                            className="text-xs text-primary hover:underline font-semibold"
                        >
                            {(value.days?.length || 0) === 7 ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                        </button>
                    </div>
                    <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-2">
                        {DAYS.map((day) => {
                            const isActive = (value.days || []).includes(day.key);
                            return (
                                <button
                                    key={day.key}
                                    onClick={() => handleDayToggle(day.key)}
                                    disabled={disabled}
                                    className={cn(
                                        "h-12 w-full sm:size-10 rounded-xl sm:rounded-full font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center",
                                        isActive
                                            ? "bg-primary text-white hover:bg-blue-600 shadow-md"
                                            : "bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                                    )}
                                >
                                    {day.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Time Range */}
                <div className="flex flex-col gap-4">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Saat Aralığı</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="relative flex-1">
                            <input
                                type="time"
                                value={value.timeStart}
                                onChange={(e) => handleTimeChange('timeStart', e.target.value)}
                                disabled={disabled}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-base"
                            />
                        </div>
                        <span className="hidden sm:block text-slate-400">-</span>
                        <div className="relative flex-1">
                            <input
                                type="time"
                                value={value.timeEnd}
                                onChange={(e) => handleTimeChange('timeEnd', e.target.value)}
                                disabled={disabled}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-base"
                            />
                        </div>
                    </div>
                    {value.timeStart > value.timeEnd && value.timeEnd !== '' && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            💡 Gece vardiyası modu: {value.timeStart} - {value.timeEnd} (gece geçişi)
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
