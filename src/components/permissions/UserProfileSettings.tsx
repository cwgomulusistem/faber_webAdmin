'use client';

import React from 'react';
import { ChevronDown, User } from 'lucide-react';
import api from '@/services/api.service';

export function UserProfileSettings({ user }: { user: any }) {
    if (!user) {
        return (
            <section className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500">
                <p>Düzenlemek için soldan bir kullanıcı seçin.</p>
            </section>
        );
    }

    const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (user.type !== 'member') return; // Cannot change master role easily here
        try {
            // Update role logic
            // Note: Current backend updateSubUser supports things but Role might be fixed to 'sub'.
            // The dropdown implies "Global Role" (Administrator vs Member).
            // Sub-users are usually "Members" or "Restricted".
            // Backend UserRole is "sub" or "master".
            // Maybe we use "DefaultPermission" field for this? 
            // Or we treat "role" as UI logic mapping to permissions.
            // For now just log.
            console.log("Change role to", e.target.value);
        } catch (err) {
            console.error("Failed to update role", err);
        }
    };

    return (
        <section className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors duration-300">
            <div className="flex items-center gap-4">
                <div
                    className="size-20 rounded-full bg-cover bg-center border-4 border-slate-50 dark:border-slate-700 shadow-inner flex items-center justify-center bg-slate-200 text-slate-500 text-3xl font-bold"
                    style={user.avatar ? { backgroundImage: `url("${user.avatar}")` } : {}}
                >
                    {!user.avatar && (user.initial || <User />)}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {user.type === 'admin' ? 'Hesap Sahibi' : 'Alt Kullanıcı'}
                    </p>
                </div>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-2 min-w-[240px]">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kullanıcı Rolü</label>
                <div className="relative">
                    <select
                        disabled={user.type === 'admin'}
                        className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 pr-10 font-medium transition-colors cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        defaultValue={user.type === 'admin' ? 'Administrator' : 'Standard Member'}
                        onChange={handleRoleChange}
                    >
                        <option value="Administrator">Yönetici</option>
                        <option value="Standard Member">Standart Üye</option>
                        <option value="Restricted User">Kısıtlı Kullanıcı</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <ChevronDown size={20} />
                    </div>
                </div>
            </div>
        </section>
    );
}
