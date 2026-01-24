'use client';

import React from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn utility exists

// Mock Data
const users = [
    { id: 1, name: 'Alex Johnson', role: 'Master Admin', type: 'admin', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvhdrmBCFJrmq1QNt_e8bq7t0CHV_G-jlfwj8wZwJl34L4NQmWnl5pYJBYLPesYYUGwF6xh5Cw-eaZ2EOaoucFf-J7NYfbZdaIwwewS-DQ7qOBJDD9v5cCdiG36MaQRElJJXSSUscckZvMQ6sHgViw7tX4CEUc2rDTDiW6hoW3HaSoP4E1pmYh_kKmVl0HVfYCrqW5sUQqVHsHij6vPjYtF8KZ_CX-MDWlwn9NmCQ9qQX7vrjvSAms2x_hndX-dPYoMCTpYQophbI' },
    { id: 2, name: 'Sarah Smith', role: 'Standard Member', type: 'member', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOUevqyITJHlY8bn_RtQYjChTFLToqxrzYpDQOAqM0nspskUVCIdmrV1iUWNbmT5eQ9xgSDlXw1PCZUvyOTcqxsAbnImAIvaN12TDxND2mk6HhmgOdUwTAhOEK7PqlaaU_x_KBcqS2FIpZgoPsH0H3YquccHmM7Jjo-iWuwnoXrfZtwBM6TMqaIju7I05dqqunG25F5aGZk52CVetDVJVC8Nd8QBPbS1IAcjodYch27j69fShLqizLWKBxliTMrasgdCi_zqAgcaA', active: true },
    { id: 3, name: 'Leo (Child)', role: 'Restricted Access', type: 'member', restricted: true, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb06Y2bYR1hQuhF0Ei9UFkEqR8DwjlffcyO4z8mqAY1aUx7Zl7TkRB0xXYIyeGoQMt2z5V6krB27sVRIOTEpWDwZ6HbZdyR9EtLj8kFZS4f6eRHDSKrLGump8rJHWtRmGFPnVgycvNApOiWTu1uryMBF9cmOMNeyDnzUwIPRfmCc74p803cgiz74MyUQ4WZ0oxS-GwRvaRHzuu-F8LVyAZLxrZDRvSRjpl4W-DLtTnHSVgx-G6qaOGYzCj2X81IMF9Q2qbejg1SEk' },
    { id: 4, name: 'Dog Walker', role: 'Scheduled: 2pm-4pm', type: 'guest', avatar: null, initial: 'D' },
];

export function UserSidebar() {
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
                {users.filter(u => u.type === 'admin').map(user => (
                    <UserListItem key={user.id} user={user} />
                ))}

                <p className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Members</p>
                {users.filter(u => u.type === 'member').map(user => (
                    <UserListItem key={user.id} user={user} />
                ))}

                <p className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Guests</p>
                {users.filter(u => u.type === 'guest').map(user => (
                    <UserListItem key={user.id} user={user} />
                ))}
            </div>
        </aside>
    );
}

function UserListItem({ user }: { user: any }) {
    const isActive = user.active;
    const isRestricted = user.restricted;

    return (
        <button
            className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-colors text-left group w-full relative",
                isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800",
                isRestricted && "opacity-70"
            )}
        >
            {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full"></div>
            )}

            <div
                className={cn(
                    "size-10 rounded-full bg-cover bg-center shrink-0 flex items-center justify-center font-bold text-lg",
                    isActive ? "ring-2 ring-primary" : "ring-2 ring-slate-100 dark:ring-slate-700",
                    isRestricted && "grayscale",
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
