'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, List, Plus, Thermometer, Droplets, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/services/api.service';

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleBack = () => router.back();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activeHomeId = localStorage.getItem('faber_active_home_id');
        if (!activeHomeId) { setLoading(false); return; }

        const [roomsRes, devicesRes] = await Promise.all([
          api.get(`/homes/${activeHomeId}/rooms`),
          api.get(`/homes/${activeHomeId}/devices`)
        ]);

        const rawRooms = roomsRes.data || [];
        const allDevices = devicesRes.data || [];

        const enhancedRooms = rawRooms.map((room: any) => ({
          ...room,
          deviceCount: allDevices.filter((d: any) => d.roomId === room.id).length,
          // Check if any device in the room has temperature capability for "room temp"
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

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      <header className="flex items-center justify-between px-8 py-6 shrink-0 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="md:hidden p-2"><MapPin /></button>
          <div className="hidden md:flex gap-2 items-center text-sm text-slate-500">
            <span className="hover:text-primary cursor-pointer" onClick={() => router.push('/dashboard')}>Ana Sayfa</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">Odalar</span>
          </div>
        </div>
        <div className="flex flex-1 justify-end gap-4 items-center">
          <button onClick={handleBack} className="hidden md:block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Geri</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Odalarım</h2>
              <p className="text-slate-500 dark:text-slate-400">Oda durumlarını izleyin ve cihazları yönetin.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-95">
                <Plus size={20} />
                <span>Oda Ekle</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              <p className="text-slate-500">Odalar yükleniyor...</p>
            ) : rooms.length === 0 ? (
              <div className="col-span-full py-10 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 mb-4">Henüz oda eklenmemiş.</p>
                <button className="text-primary font-bold hover:underline">İlk odanızı oluşturun</button>
              </div>
            ) : (
              rooms.map((room) => (
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
