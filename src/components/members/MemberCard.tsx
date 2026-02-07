'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Home, Shield, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/auth.types';

interface HomeInfo {
    id: string;
    name: string;
}

interface Member {
    id: string;
    name: string;
    email?: string;
    role: string;
    type?: string;
    status?: string;
    avatar?: string;
    permissions?: string;
    isGuest?: boolean;
    homes?: HomeInfo[];
}

export function MemberCard({ member }: { member: Member }) {
    const router = useRouter();
    const memberType = member.type as unknown as string;
    const isMaster = memberType === UserRole.MASTER || memberType === 'master' || memberType === 'MASTER' || member.role === 'Admin';

    const handleManageAccess = () => {
        if (isMaster) {
            // Master users don't have editable permissions
            return;
        }
        router.push(`/dashboard/members/${member.id}`);
    };

    return (
        <div className="group bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-primary/30 transition-all relative overflow-hidden">
            {/* Master badge */}
            {isMaster && (
                <div className="absolute top-0 right-0 bg-gradient-to-bl from-primary to-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                    <Shield size={10} className="inline mr-1" />
                    MASTER
                </div>
            )}

            <div className="absolute top-4 right-4">
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <MoreVertical size={20} />
                </button>
            </div>
            <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                    <div
                        className={cn(
                            "size-20 rounded-full bg-cover bg-center border-4 shadow-inner flex items-center justify-center text-2xl font-bold",
                            isMaster
                                ? "border-primary/30 bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary"
                                : "border-slate-50 dark:border-slate-700 bg-slate-200 text-slate-500"
                        )}
                        style={member.avatar ? { backgroundImage: `url("${member.avatar}")` } : {}}
                    >
                        {!member.avatar && member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-green-500 size-5 rounded-full border-2 border-white dark:border-surface-dark" title="Evde"></div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{member.name}</h3>
                {member.email && (
                    <p className="text-xs text-slate-400 mt-0.5">{member.email}</p>
                )}
                <div className="mt-2 flex gap-2">
                    <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                        member.role === 'Admin' ? "bg-primary/10 text-primary border-primary/20" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                    )}>
                        {member.role}
                    </span>
                </div>

                {/* Homes Section */}
                {member.homes && member.homes.length > 0 && (
                    <div className="mt-3 w-full">
                        <p className="text-xs text-slate-400 mb-1.5">Kayıtlı Evler:</p>
                        <div className="flex flex-wrap justify-center gap-1">
                            {member.homes.map(home => (
                                <span
                                    key={home.id}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800"
                                >
                                    <Home size={10} />
                                    {home.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {isMaster ? 'Tam yetki (değiştirilemez)' : (member.permissions || 'Standart erişim')}
                </p>
                <button
                    onClick={handleManageAccess}
                    disabled={isMaster}
                    className={cn(
                        "mt-4 w-full py-2.5 px-4 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2",
                        isMaster
                            ? "bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                            : "bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white dark:hover:bg-primary text-slate-700 dark:text-slate-200"
                    )}
                >
                    <Settings size={16} />
                    {isMaster ? 'Master Kullanıcı' : 'Erişimi Yönet'}
                </button>
            </div>
        </div>
    );
}
