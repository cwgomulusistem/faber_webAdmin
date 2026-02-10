'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Home, Shield, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/auth.types';
import api from '@/services/api.service';
import { toast } from 'sonner';

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
    accessExpiresAt?: string;
}

interface MemberCardProps {
    member: Member;
    onDeleteSuccess?: () => void;
    canDelete?: boolean; // Only MASTER and OWNER can delete members
}

export function MemberCard({ member, onDeleteSuccess, canDelete = false }: MemberCardProps) {
    const router = useRouter();
    const [showMenu, setShowMenu] = React.useState(false);
    const memberType = member.type as unknown as string;
    const isMaster = memberType === UserRole.MASTER || memberType === 'master' || memberType === 'MASTER' || member.role === 'Admin' || member.role === 'Ana Kullanıcı';

    // Calculate expiration status
    const isExpired = member.accessExpiresAt && new Date(member.accessExpiresAt) < new Date();
    const formattedDate = member.accessExpiresAt
        ? new Date(member.accessExpiresAt).toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : null;

    const handleManageAccess = () => {
        if (isMaster) return;
        const homeId = member.homes?.[0]?.id;
        router.push(`/dashboard/members/${member.id}${homeId ? `?homeId=${homeId}` : ''}`);
    };

    const handleDeleteMember = async () => {
        if (!confirm('Bu üyeyi silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/users/sub/${member.id}`);
            toast.success('Üye silindi');
            if (onDeleteSuccess) onDeleteSuccess();
        } catch (err) {
            console.error('Failed to delete member:', err);
            toast.error('Üye silinemedi');
        }
    };

    return (
        <div className={cn(
            "group bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border hover:shadow-md transition-all relative overflow-hidden",
            isExpired
                ? "border-red-200 bg-red-50/5 hover:border-red-300"
                : "border-slate-100 dark:border-slate-800 hover:border-primary/30"
        )}>
            {/* Master badge */}
            {(isMaster) && (
                <div className="absolute top-0 right-0 bg-gradient-to-bl from-primary to-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                    <Shield size={10} className="inline mr-1" />
                    MASTER
                </div>
            )}

            {/* Expired badge */}
            {isExpired && (
                <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg uppercase tracking-wider">
                    SÜRESİ DOLDU
                </div>
            )}

            <div className="absolute top-4 right-4 z-20">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                >
                    <MoreVertical size={20} />
                </button>

                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-20">
                            <button
                                onClick={() => { handleManageAccess(); setShowMenu(false); }}
                                disabled={isMaster}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 disabled:opacity-50"
                            >
                                <Settings size={14} />
                                Erişimi Yönet
                            </button>
                            {/* Only show delete button if user has permission and member is not master */}
                            {canDelete && !isMaster && (
                                <button
                                    onClick={() => { handleDeleteMember(); setShowMenu(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                    <X size={14} />
                                    Üyeyi Sil
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
            <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                    <div
                        className={cn(
                            "size-20 rounded-full bg-cover bg-center border-4 shadow-inner flex items-center justify-center text-2xl font-bold transition-all",
                            isExpired
                                ? "grayscale border-red-100 bg-red-50 text-red-300"
                                : isMaster
                                    ? "border-primary/30 bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary"
                                    : "border-slate-50 dark:border-slate-700 bg-slate-200 text-slate-500"
                        )}
                        style={member.avatar ? { backgroundImage: `url("${member.avatar}")` } : {}}
                    >
                        {!member.avatar && member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={cn(
                        "absolute bottom-0 right-0 size-5 rounded-full border-2 border-white dark:border-surface-dark",
                        isExpired ? "bg-red-500" : "bg-green-500"
                    )} title={isExpired ? "Süresi Doldu" : "Evde"}></div>
                </div>
                <h3 className={cn(
                    "text-lg font-bold transition-all",
                    isExpired ? "text-red-900/40 dark:text-red-400" : "text-slate-900 dark:text-white"
                )}>{member.name}</h3>
                {member.email && (
                    <p className="text-xs text-slate-400 mt-0.5">{member.email}</p>
                )}

                <div className="mt-2 flex flex-col items-center gap-1">
                    <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                        isExpired
                            ? "bg-red-100 text-red-700 border-red-200"
                            : member.role === 'Admin'
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                    )}>
                        {member.role === 'Misafir' && isExpired ? 'Geçmiş Misafir' : member.role}
                    </span>

                    {isExpired && formattedDate && (
                        <span className="text-[10px] text-red-500 font-medium">
                            Bitiş: {formattedDate}
                        </span>
                    )}
                </div>

                {/* Homes Section */}
                {member.homes && member.homes.length > 0 && (
                    <div className="mt-3 w-full">
                        <p className="text-xs text-slate-400 mb-1.5">Kayıtlı Evler:</p>
                        <div className="flex flex-wrap justify-center gap-1">
                            {member.homes.map(home => (
                                <span
                                    key={home.id}
                                    className={cn(
                                        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-all",
                                        isExpired
                                            ? "bg-red-50/50 text-red-300 border-red-100/50"
                                            : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800"
                                    )}
                                >
                                    <Home size={10} />
                                    {home.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <p className={cn(
                    "mt-3 text-sm line-clamp-2",
                    isExpired ? "text-red-400/60" : "text-slate-500 dark:text-slate-400"
                )}>
                    {isExpired
                        ? 'Erişim süresi dolduğu için yetkiler askıya alındı.'
                        : isMaster
                            ? 'Tam yetki (değiştirilemez)'
                            : (member.permissions || 'Standart erişim')}
                </p>
                <button
                    onClick={handleManageAccess}
                    disabled={isMaster}
                    className={cn(
                        "mt-4 w-full py-2.5 px-4 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2",
                        isMaster
                            ? "bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                            : isExpired
                                ? "bg-red-100 dark:bg-red-900/20 text-red-600 hover:bg-red-200"
                                : "bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white dark:hover:bg-primary text-slate-700 dark:text-slate-200"
                    )}
                >
                    <Settings size={16} />
                    {isMaster ? 'Master Kullanıcı' : isExpired ? 'Erişimi Yenile' : 'Erişimi Yönet'}
                </button>
            </div>
        </div>
    );
}
