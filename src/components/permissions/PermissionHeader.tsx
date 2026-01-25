'use client';

import React from 'react';
import { ShieldCheck, Plus } from 'lucide-react';

export function PermissionHeader() {
    return (
        <header className="h-20 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark px-6 md:px-10 flex items-center justify-between z-10 transition-colors duration-300">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    Permission & Role Management
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => alert("Özel Rol oluşturma özelliği yakında eklenecektir.")}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg dark:text-slate-300"
                >
                    <Plus size={20} />
                    <span>New Role</span>
                </button>
                <button className="bg-primary hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                    Save Changes
                </button>
            </div>
        </header>
    );
}
