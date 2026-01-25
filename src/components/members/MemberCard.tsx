'use client';

import React from 'react';
import { MoreVertical, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MemberCard({ member }: { member: any }) {
    return (
        <div className="group bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-4 right-4">
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <MoreVertical size={20} />
                </button>
            </div>
            <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                    <div
                        className="size-20 rounded-full bg-cover bg-center border-4 border-slate-50 dark:border-slate-700 shadow-inner flex items-center justify-center bg-slate-200 text-slate-500 text-2xl font-bold"
                        style={member.avatar ? { backgroundImage: `url("${member.avatar}")` } : {}}
                    >
                        {!member.avatar && member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-green-500 size-5 rounded-full border-2 border-white dark:border-surface-dark" title="At Home"></div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{member.name}</h3>
                <div className="mt-2 flex gap-2">
                    <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                        member.role === 'Admin' ? "bg-primary/10 text-primary border-primary/20" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                    )}>
                        {member.role}
                    </span>
                </div>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {member.permissions || 'Standard access'}
                </p>
                <button className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors">
                    Manage Access
                </button>
            </div>
        </div>
    );
}
