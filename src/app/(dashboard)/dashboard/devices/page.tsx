'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, ListFilter, LayoutGrid, MoreVertical, Lightbulb, Lock, Thermometer, Router, BatteryWarning } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/services/api.service';

export default function DevicesPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const [devices, setDevices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const fetchDevices = async () => {
      try {
        const activeHomeId = localStorage.getItem('faber_active_home_id');
        if (!activeHomeId) {
          // If no active home, maybe fetch homes first? 
          // For now, fail gracefully.
          setLoading(false);
          return;
        }

        const res = await api.get(`/homes/${activeHomeId}/devices`);
        setDevices(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch devices", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  const filteredDevices = devices.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.room?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 md:px-10 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Cihaz Yönetimi</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Bağlı tüm akıllı cihazlarınızı yönetin ve izleyin.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            Geri
          </button>
          <button className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary hover:bg-blue-600 text-white h-11 px-5 shadow-sm transition-all active:scale-95">
            <Plus size={20} />
            <span className="text-sm font-bold tracking-wide">Cihaz Ekle</span>
          </button>
        </div>
      </header>

      {/* Filters & Content Area */}
      <div className="flex-1 flex flex-col px-6 md:px-10 pb-6 overflow-hidden gap-6">

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-surface-light dark:bg-surface-dark p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
          <label className="flex items-center h-10 w-full md:w-96 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 gap-2 focus-within:ring-2 ring-primary/50 transition-all">
            <Search className="text-slate-400 w-5 h-5" />
            <input
              className="flex-1 bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0 p-0"
              placeholder="Cihaz ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <FilterChip label="Tümü" count={devices.length} active />
            <FilterChip label="Çevrimiçi" count={devices.filter(d => d.isOnline).length} />
            <FilterChip label="Çevrimdışı" count={devices.filter(d => !d.isOnline).length} />
          </div>

          <div className="ml-auto flex gap-2">
            <IconButton icon={<ListFilter size={20} />} />
            <IconButton icon={<LayoutGrid size={20} />} />
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark shadow-sm flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
                <tr>
                  <TableHeader width="30%">Cihaz Adı</TableHeader>
                  <TableHeader width="15%">Durum</TableHeader>
                  <TableHeader width="15%">Oda</TableHeader>
                  <TableHeader width="15%">Tür</TableHeader>
                  <TableHeader width="15%">Son Görülme</TableHeader>
                  <TableHeader width="10%" align="right">İşlemler</TableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">Yükleniyor...</td></tr>
                ) : filteredDevices.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">Cihaz bulunamadı.</td></tr>
                ) : (
                  filteredDevices.map(device => (
                    <DeviceRow
                      key={device.id}
                      name={device.name}
                      id={`#DEV-${device.id.substring(0, 4)}`}
                      icon={getIcon(device.type)}
                      iconColor="text-blue-600 dark:text-blue-400"
                      iconBg="bg-blue-100 dark:bg-blue-900/30"
                      status={device.attributes?.on ? "Açık" : "Kapalı"} // Simplified status
                      room={device.room?.name || "Atanmamış"}
                      protocol={device.type || "Bilinmiyor"}
                      lastSeen="Şimdi"
                      type={device.type?.toLowerCase().includes('light') ? 'light' : 'other'}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark shrink-0">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Toplam <span className="font-medium text-slate-900 dark:text-white">{filteredDevices.length}</span> cihaz görüntüleniyor
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// Helpers
const getIcon = (type: string) => {
  if (type?.toLowerCase().includes('therm')) return <Thermometer size={20} />;
  if (type?.toLowerCase().includes('lock')) return <Lock size={20} />;
  return <Lightbulb size={20} />;
}

// Sub Components
function FilterChip({ label, count, active }: { label: string, count?: number, active?: boolean }) {
  return (
    <button className={cn(
      "flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-3 pr-3 border transition-all text-sm font-medium",
      active ? "bg-blue-50 dark:bg-blue-900/20 text-primary border-transparent" : "bg-transparent text-slate-500 hover:bg-slate-50 dark:text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
    )}>
      <span>{label}</span>
      {count !== undefined && <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{count}</span>}
    </button>
  );
}

function IconButton({ icon }: { icon: React.ReactNode }) {
  return <button className="flex size-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">{icon}</button>;
}

function TableHeader({ children, width, align = 'left' }: { children: React.ReactNode, width?: string, align?: 'left' | 'right' }) {
  return <th className={cn("px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800", align === 'right' ? 'text-right' : 'text-left')} style={{ width }}>{children}</th>;
}

function DeviceRow({ name, id, icon, iconColor, iconBg, status, room, protocol, lastSeen, type, value }: any) {
  return (
    <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={cn("size-10 rounded-lg flex items-center justify-center", iconBg, iconColor)}>{icon}</div>
          <div><p className="text-sm font-bold text-slate-900 dark:text-white">{name}</p><p className="text-xs text-slate-500 dark:text-slate-400">ID: {id}</p></div>
        </div>
      </td>
      <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{status}</span></td>
      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{room}</td>
      <td className="px-6 py-4"><div className="flex items-center gap-2"><Router size={16} className="text-slate-400" /><span className="text-sm text-slate-500 dark:text-slate-300">{protocol}</span></div></td>
      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{lastSeen}</td>
      <td className="px-6 py-4 text-right"><MoreVertical size={20} className="text-slate-400" /></td>
    </tr>
  );
}
