'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Bot, Lightbulb, Lock, Save } from 'lucide-react';
import { cn, getActiveHomeId } from '@/lib/utils';
import api from '@/services/api.service';

interface DeviceAccessListProps {
    userId?: string;
    user?: any;
}

export function DeviceAccessList({ userId, user }: DeviceAccessListProps) {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const activeUserId = user?.id || userId;

    // We need to fetch both available devices AND the user's specific permissions
    // MVP: For now, we fetch all devices and assume a default permission if not set.
    // In a real implementation, we'd GET /users/sub/:id/permissions or similar.

    useEffect(() => {
        if (!activeUserId || activeUserId === 'master') {
            setDevices([]);
            return;
        }

        const fetchDevicesAndPerms = async () => {
            setLoading(true);
            try {
                // 1. Get Devices
                const homeId = getActiveHomeId();
                if (!homeId) return; // Should handle error

                const devicesRes = await api.get(`/homes/${homeId}/devices`);
                const allDevices = devicesRes.data?.data || [];

                // 2. Get User Permissions (Mocking endpoint or using sub-user object if extended)
                // For MVP, since the backend might not have a granular permission endpoint yet,
                // we will just show devices and allow "saving" which might update a JSON blob on the user
                // or individual permission records.
                // Assuming we default to 'VIEW_ONLY' if no specific record.

                setDevices(allDevices);
            } catch (err) {
                console.error("Failed to fetch device permissions", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDevicesAndPerms();
    }, [activeUserId]);

    const handlePermissionChange = async (deviceId: string, newRole: string) => {
        // Optimistic update locally
        setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, _tempRole: newRole } : d));
    };

    const handleSave = async () => {
        if (!activeUserId) return;
        setSaving(true);
        try {
            // Construct permission payload
            // This would call something like POST /users/sub/:id/permissions
            // data: { permissions: [{ deviceId, level: ... }] }
            await new Promise(r => setTimeout(r, 800)); // Fake network
            alert("Permissions saved (Simulated)");
        } catch (err) {
            alert("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    if (!activeUserId || activeUserId === 'master') return null;

    return (
        <section className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="text-primary w-6 h-6" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Granular Device Access</h3>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 text-sm bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-5 md:col-span-4">Device</div>
                <div className="col-span-4 md:col-span-4">Permission Level</div>
                <div className="col-span-3 md:col-span-4 text-right md:text-left">Security</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                    <div className="p-6 text-center text-slate-400 text-sm">Loading devices...</div>
                ) : devices.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">No devices found in this home.</div>
                ) : (
                    devices.map((device: any) => (
                        <DeviceRow
                            key={device.id}
                            icon={<Bot size={20} />} // Dynamic icon based on type would be better
                            name={device.name}
                            iconBg="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            defaultRole={device._tempRole || 'View Only'}
                            requiresPin={false}
                            onChange={(role: string) => handlePermissionChange(device.id, role)}
                        />
                    ))
                )}
            </div>
        </section>
    );
}

function DeviceRow({ icon, name, iconBg, defaultRole, requiresPin, onChange }: any) {
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
                    value={defaultRole}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full text-xs md:text-sm py-1.5 pl-2 pr-7 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark focus:ring-primary focus:border-primary cursor-pointer outline-none dark:text-white"
                >
                    <option value="View Only">View Only</option>
                    <option value="Control">Control</option>
                    <option value="Full Admin">Full Admin</option>
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
