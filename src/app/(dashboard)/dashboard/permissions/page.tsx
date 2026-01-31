'use client';

import React, { useEffect } from 'react';
import { PermissionHeader } from '@/components/permissions/PermissionHeader';
import { UserSidebar } from '@/components/permissions/UserSidebar';
import { UserProfileSettings } from '@/components/permissions/UserProfileSettings';
import { ScheduledAccess } from '@/components/permissions/ScheduledAccess';
import { DeviceAccessList } from '@/components/permissions/DeviceAccessList';
import { PinManagement } from '@/components/permissions/PinManagement';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/auth.types';

export default function PermissionsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [selectedUser, setSelectedUser] = React.useState<any>(null);

    // Check if user is master
    const isMaster = user && 'role' in user && user.role === UserRole.MASTER;

    useEffect(() => {
        if (!authLoading && !isMaster) {
            router.push('/dashboard');
        }
    }, [isMaster, authLoading, router]);

    if (authLoading || !isMaster) {
        return null;
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <PermissionHeader />

            {/* Main Layout */}
            <div className="flex-1 overflow-hidden flex">
                {/* Left Sidebar (User List) */}
                <UserSidebar
                    onSelectUser={setSelectedUser}
                    selectedUserId={selectedUser?.id}
                />

                {/* Main Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
                    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* User Profile & Global Role */}
                        <UserProfileSettings user={selectedUser} />

                        {/* Scheduled Access */}
                        <ScheduledAccess user={selectedUser} />

                        {/* Granular Device Access */}
                        <DeviceAccessList user={selectedUser} />

                        {/* PIN Management */}
                        <PinManagement user={selectedUser} />

                    </div>
                </div>
            </div>
        </div>
    );
}
