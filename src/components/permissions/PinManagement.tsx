'use client';

import React from 'react';
import { Hash } from 'lucide-react';

export function PinManagement({ user }: { user?: any }) {
    return (
        <section className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-10 transition-colors duration-300">
            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div className="flex items-start gap-3 max-w-md">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
                        <Hash size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">PIN Management</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Set a 4-6 digit security PIN for high-security devices (e.g., Locks, Cameras).
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex gap-2 px-2">
                        <div className="w-3 h-3 rounded-full bg-slate-800 dark:bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-800 dark:bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-800 dark:bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-800 dark:bg-white"></div>
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-sm font-bold border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm transition-colors active:scale-95">
                        Reset PIN
                    </button>
                </div>
            </div>
        </section>
    );
}
