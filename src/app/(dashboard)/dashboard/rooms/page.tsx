'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Thermometer, Droplets, MapPin, Search, Bell } from 'lucide-react';
import { cn, getActiveHomeId } from '@/lib/utils';
import api from '@/services/api.service';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import { useSocket } from '@/hooks/useSocket';

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { isConnected } = useSocket();
  
  // Prevent double fetching in React StrictMode
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchData = async () => {
      try {
        const homeId = getActiveHomeId();
        if (!homeId) { setLoading(false); return; }

        const [roomsRes, devicesRes] = await Promise.all([
          api.get(`/homes/${homeId}/rooms`),
          api.get(`/homes/${homeId}/devices`)
        ]);

        const rawRooms = roomsRes.data?.data || [];
        const allDevices = devicesRes.data?.data || [];

        const enhancedRooms = rawRooms.map((room: any) => ({
          ...room,
          deviceCount: allDevices.filter((d: any) => d.roomId === room.id).length,
          temperature: allDevices.find((d: any) => d.roomId === room.id && d.attributes?.temperature)?.attributes?.temperature
        }));

        setRooms(enhancedRooms);
      } catch (err) {
        console.error("Failed to fetch rooms data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredRooms = rooms.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Standard Header */}
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Odalar</h1>
            <span className="text-xs text-gray-500">Oda Yönetimi</span>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Oda ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-2 rounded-xl text-sm",
                "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none",
                "placeholder-gray-400 text-gray-900 dark:text-white transition-all"
              )}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
            <span className="text-xs font-medium text-gray-500">Sistem Durumu</span>
            <ConnectionStatus />
          </div>

          <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary hover:bg-blue-600 text-white px-4 py-2 shadow-sm transition-all active:scale-95 text-sm font-semibold">
            <Plus size={18} />
            <span>Oda Ekle</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-6">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              <p className="text-slate-500">Odalar yükleniyor...</p>
            ) : filteredRooms.length === 0 ? (
              <div className="col-span-full py-10 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 mb-4">Henüz oda eklenmemiş.</p>
                <button className="text-primary font-bold hover:underline">İlk odanızı oluşturun</button>
              </div>
            ) : (
              filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function RoomCard({ room }: { room: any }) {
  // Use real data or placeholders indicating "No Data" (-)
  const temp = room.temperature !== undefined ? `${room.temperature}°` : '-';
  const humidity = room.humidity !== undefined ? `${room.humidity}%` : '-';
  const deviceCount = room.deviceCount || 0;

  return (
    <div className="group flex flex-col bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-primary/20">
      <div className="h-40 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
        {room.image ? (
          <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800">
            <MapPin className="text-white/20 w-20 h-20" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
        <h3 className="absolute bottom-3 left-4 text-white font-semibold text-lg tracking-wide">{room.name}</h3>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-1.5 rounded-full text-orange-600 dark:text-orange-400">
              <Thermometer size={20} />
            </div>
            <span className="font-semibold">{temp}</span>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full text-blue-600 dark:text-blue-400">
              <Droplets size={20} />
            </div>
            <span className="font-semibold">{humidity}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span>{deviceCount} Cihaz</span>
          </div>
        </div>

        <button className="mt-2 w-full py-2 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors">
          Yönet
        </button>
      </div>
    </div>
  );
}
