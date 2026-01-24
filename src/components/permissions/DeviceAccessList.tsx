'use client';

import React from 'react';
import { ShieldAlert, Bot, Lightbulb, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DeviceAccessList() {
    return (
        <section className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="text-primary w-6 h-6" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Granular Device Access</h3>
                </div>
                <button className="text-sm text-primary font-bold hover:underline">Reset to Default</button>
            </div>

            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-5 md:col-span-4">Device</div>
                <div className="col-span-4 md:col-span-4">Permission Level</div>
                <div className="col-span-3 md:col-span-4 text-right md:text-left">Security</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-800/20">
                    <span className="text-xs font-bold text-slate-400">LIVING ROOM</span>
                </div>

                <DeviceRow
                    icon={<Bot size={20} />}
                    name="Main Thermostat"
                    iconBg="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    defaultRole="Control"
                    requiresPin={false}
                />

                <DeviceRow
                    icon={<Lightbulb size={20} />}
                    name="Ceiling Lights"
                    iconBg="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                    defaultRole="Full Admin"
                    requiresPin={false}
                />

                <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-800/20">
                    <span className="text-xs font-bold text-slate-400">ENTRANCE & SECURITY</span>
                </div>

                <DeviceRow
                    icon={<Lock size={20} />}
                    name="Smart Lock"
                    iconBg="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    defaultRole="Control"
                    requiresPin={true}
                />
            </div>
        </section>
    );
}

function DeviceRow({ icon, name, iconBg, defaultRole, requiresPin }: any) {
    return (
        <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
            <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", iconBg)}>
                    {icon}
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{name}</span>
            </div>

            <div className="col-span-4 md:col-span-4">
                <select
                    defaultValue={defaultRole}
                    className="w-full text-xs md:text-sm py-1.5 pl-2 pr-7 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark focus:ring-primary focus:border-primary cursor-pointer outline-none dark:text-white"
                >
                    <option>View Only</option>
                    <option>Control</option>
                    <option>Full Admin</option>
                </select>
            </div>

            <div className="col-span-3 md:col-span-4 flex justify-end md:justify-start items-center gap-2">
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input
                        type="checkbox"
                        name="toggle"
                        defaultChecked={requiresPin}
                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-primary transition-all duration-200"
                    />
                    <label className="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer peer-checked:bg-primary transition-colors duration-200"></label>
                </div>
                <span className="hidden md:inline text-xs text-slate-500">Requires PIN</span>
            </div>
        </div>
    );
}
