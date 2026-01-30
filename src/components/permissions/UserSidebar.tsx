'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { cn, getActiveHomeId, setActiveHomeId } from '@/lib/utils';
import api from '@/services/api.service';

const masterUser = {
    id: 'master',
    name: 'Master Admin',
    role: 'Master Admin',
    type: 'admin' as const,
    // avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvhdrmBCFJrmq1QNt_e8bq7t0CHV_G-jlfwj8wZwJl34L4NQmWnl5pYJBYLPesYYUGwF6xh5Cw-eaZ2EOaoucFf-J7NYfbZdaIwwewS-DQ7qOBJDD9v5cCdiG36MaQRElJJXSSUscckZvMQ6sHgViw7tX4CEUc2rDTDiW6hoW3HaSoP4E1pmYh_kKmVl0HVfYCrqW5sUQqVHsHij6vPjYtF8KZ_CX-MDWlwn9NmCQ9qQX7vrjvSAms2x_hndX-dPYoMCTpYQophbI',
    initial: 'M'
};

export function UserSidebar({ onSelectUser, selectedUserId }: { onSelectUser?: (user: any) => void, selectedUserId?: string | null }) {
    const [subUsers, setSubUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Determine Home ID (fallback to first home if not in local storage for MVP)
                let homeId = getActiveHomeId();

                if (!homeId) {
                    // Try to fetch homes to get a default
                    try {
                        const homesRes = await api.get('/homes');
                        if (homesRes.data && homesRes.data.length > 0) {
                            homeId = homesRes.data[0].id;
                            setActiveHomeId(homeId!);
                        }
                    } catch (e) {
                        console.warn('Failed to fetch homes for default ID', e);
                    }
                }

                if (!homeId) {
                    setLoading(false);
                    return;
                }

                const res = await api.get(`/users/sub?homeId=${homeId}`);

                const mapped = res.data.subUsers.map((u: any) => ({
                    id: u.id,
                    name: u.fullName,
                    role: u.username,
                    type: 'member',
                    initial: u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U',
                    raw: u
                }));
                setSubUsers(mapped);
            } catch (err) {
                console.error('Failed to fetch users', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    return (
        <aside className="w-80 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark overflow-y-auto shrink-0 hidden lg:flex transition-colors duration-300">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-surface-dark z-10 transition-colors duration-300">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                    <input
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-shadow dark:text-white"
                        placeholder="Search users..."
                        type="text"
                    />
                </div>
            </div>

            <div className="flex flex-col p-3 gap-2">
                <p className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Administrators</p>
                <UserListItem
                    user={masterUser}
                    isActive={selectedUserId === 'master'}
                    onClick={() => onSelectUser?.(masterUser)}
                />

                <p className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Members</p>
                {loading ? (
                    <div className="px-4 py-2 text-slate-400 text-sm">Loading users...</div>
                ) : subUsers.length === 0 ? (
                    <div className="px-4 py-2 text-slate-400 text-sm">No members found</div>
                ) : (
                    subUsers.map(user => (
                        <UserListItem
                            key={user.id}
                            user={user}
                            isActive={selectedUserId === user.id}
                            onClick={() => onSelectUser?.(user)}
                        />
                    ))
                )}
            </div>
        </aside>
    );
}

function UserListItem({ user, isActive, onClick }: { user: any, isActive?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-colors text-left group w-full relative",
                isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
        >
            {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full"></div>
            )}

            <div
                className={cn(
                    "size-10 rounded-full bg-cover bg-center shrink-0 flex items-center justify-center font-bold text-lg",
                    isActive ? "ring-2 ring-primary" : "ring-2 ring-slate-100 dark:ring-slate-700",
                    !user.avatar && "bg-orange-100 text-orange-600"
                )}
                style={user.avatar ? { backgroundImage: `url("${user.avatar}")` } : {}}
            >
                {!user.avatar && user.initial}
            </div>

            <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</span>
                <span className={cn(
                    "text-xs font-medium truncate",
                    isActive ? "text-primary" : "text-slate-500"
                )}>
                    {user.role}
                </span>
            </div>

            {!isActive && (
                <ChevronRight className="ml-auto text-slate-300 group-hover:text-primary w-5 h-5 transition-colors" />
            )}
        </button>
    );
}
