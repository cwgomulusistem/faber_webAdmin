'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export function UserProfileSettings() {
    return (
        <section className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors duration-300">
            <div className="flex items-center gap-4">
                <div
                    className="size-20 rounded-full bg-cover bg-center border-4 border-slate-50 dark:border-slate-700 shadow-inner"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDOUevqyITJHlY8bn_RtQYjChTFLToqxrzYpDQOAqM0nspskUVCIdmrV1iUWNbmT5eQ9xgSDlXw1PCZUvyOTcqxsAbnImAIvaN12TDxND2mk6HhmgOdUwTAhOEK7PqlaaU_x_KBcqS2FIpZgoPsH0H3YquccHmM7Jjo-iWuwnoXrfZtwBM6TMqaIju7I05dqqunG25F5aGZk52CVetDVJVC8Nd8QBPbS1IAcjodYch27j69fShLqizLWKBxliTMrasgdCi_zqAgcaA")' }}
                ></div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sarah Smith</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Last active: Today, 09:14 AM</p>
                </div>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-2 min-w-[240px]">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Global Role</label>
                <div className="relative">
                    <select className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 pr-10 font-medium transition-colors cursor-pointer outline-none">
                        <option>Administrator</option>
                        <option selected>Standard Member</option>
                        <option>Restricted User</option>
                        <option>Guest</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <ChevronDown size={20} />
                    </div>
                </div>
            </div>
        </section>
    );
}
