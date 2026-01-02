'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api.service';
import { MoreVertical, Power } from 'lucide-react';

interface Device {
  id: string;
  macAddress: string;
  type: string;
  isOnline: boolean;
  isBanned: boolean;
  room?: { name: string; home: { user: { email: string } } };
}

export default function DeviceListPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/v1/devices');
      setDevices(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/v1/devices/${id}/ban`, { isBanned: !currentStatus });
      setDevices(devices.map(d => d.id === id ? { ...d, isBanned: !currentStatus } : d));
    } catch (error) {
       console.error('Failed to update status', error);
       alert('Failed to update status');
    }
  };

  if (loading) return <div className="p-8">Loading devices...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Device Management</h1>
        <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Add Device</button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Device Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Owner</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {devices.map((device) => (
              <tr key={device.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{device.type}</div>
                      <div className="text-sm text-gray-500">{device.macAddress}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {device.isBanned ? (
                    <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">Banned</span>
                  ) : (
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${device.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {device.isOnline ? 'Online' : 'Offline'}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">{device.room?.home.user.email || 'Unassigned'}</div>
                  <div className="text-sm text-gray-500">{device.room?.name}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => handleBanToggle(device.id, device.isBanned)}
                    className={`mr-4 ${device.isBanned ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
                  >
                    {device.isBanned ? 'Unban' : 'Ban'}
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
