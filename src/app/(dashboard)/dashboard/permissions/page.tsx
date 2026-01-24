'use client';

import React from 'react';
import { PermissionHeader } from '@/components/permissions/PermissionHeader';
import { UserSidebar } from '@/components/permissions/UserSidebar';
import { UserProfileSettings } from '@/components/permissions/UserProfileSettings';
import { ScheduledAccess } from '@/components/permissions/ScheduledAccess';
import { DeviceAccessList } from '@/components/permissions/DeviceAccessList';
import { PinManagement } from '@/components/permissions/PinManagement';

export default function PermissionsPage() {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <PermissionHeader />

            {/* Main Layout */}
            <div className="flex-1 overflow-hidden flex">
                {/* Left Sidebar (User List) */}
                <UserSidebar />

                {/* Main Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
                    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* User Profile & Global Role */}
                        <UserProfileSettings />

                        {/* Scheduled Access */}
                        <ScheduledAccess />

                        {/* Granular Device Access */}
                        <DeviceAccessList />

                        {/* PIN Management */}
                        <PinManagement />

                    </div>
                </div>
            </div>
        </div>
    );
}
