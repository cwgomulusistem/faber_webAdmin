'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Plus, ListFilter, LayoutGrid, MoreVertical, Lightbulb, Lock, Thermometer, Router, BatteryWarning } from 'lucide-react';
import { cn } from '@/lib/utils'; // Ensure this utility handles null/undefined

export default function DevicesPage() {
  const router = useRouter();

  const handleBack = () => {
    // Navigate back to dashboard root or previous page
    router.back();
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden">

      {/* Header / Top Toolbar */}
      <header className="flex items-center justify-between px-6 py-6 md:px-10 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Device Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage and monitor all your connected smart devices.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            Back
          </button>
          <button className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary hover:bg-blue-600 text-white h-11 px-5 shadow-sm transition-all active:scale-95">
            <Plus size={20} />
            <span className="text-sm font-bold tracking-wide">Add Device</span>
          </button>
        </div>
      </header>

      {/* Filters & Content Area */}
      <div className="flex-1 flex flex-col px-6 md:px-10 pb-6 overflow-hidden gap-6">

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-surface-light dark:bg-surface-dark p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
          {/* Search */}
          <label className="flex items-center h-10 w-full md:w-96 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 gap-2 focus-within:ring-2 ring-primary/50 transition-all">
            <Search className="text-slate-400 w-5 h-5" />
            <input
              className="flex-1 bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0 p-0"
              placeholder="Search devices, rooms, or protocols..."
            />
          </label>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

          {/* Filter Chips */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <FilterChip label="All Devices" count={42} active />
            <FilterChip label="Online" />
            <FilterChip label="Offline" />
            <FilterChip label="Low Battery" />
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
                  <TableHeader width="30%">Device Name</TableHeader>
                  <TableHeader width="15%">Status</TableHeader>
                  <TableHeader width="15%">Room</TableHeader>
                  <TableHeader width="15%">Protocol</TableHeader>
                  <TableHeader width="15%">Last Seen</TableHeader>
                  <TableHeader width="10%" align="right">Actions</TableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <DeviceRow
                  name="Living Room Main Light"
                  id="#DEV-2049"
                  icon={<Lightbulb size={20} />}
                  iconColor="text-orange-600 dark:text-orange-400"
                  iconBg="bg-orange-100 dark:bg-orange-900/30"
                  status="Online"
                  room="Living Room"
                  protocol="Zigbee 3.0"
                  lastSeen="Just now"
                  type="light"
                />
                <DeviceRow
                  name="Front Door Lock"
                  id="#DEV-8821"
                  icon={<Lock size={20} />}
                  iconColor="text-blue-600 dark:text-blue-400"
                  iconBg="bg-blue-100 dark:bg-blue-900/30"
                  status="Offline"
                  room="Entrance"
                  protocol="Z-Wave Plus"
                  lastSeen="2 hours ago"
                  type="lock"
                />
                <DeviceRow
                  name="Kitchen Thermostat"
                  id="#DEV-1102"
                  icon={<Thermometer size={20} />}
                  iconColor="text-red-600 dark:text-red-400"
                  iconBg="bg-red-100 dark:bg-red-900/30"
                  status="Online"
                  room="Kitchen"
                  protocol="WiFi 6"
                  lastSeen="5 mins ago"
                  type="thermostat"
                  value="72°F"
                />
                <DeviceRow
                  name="Garage Door"
                  id="#DEV-9912"
                  icon={<Router size={20} />} // Fallback icon
                  iconColor="text-slate-600 dark:text-slate-300"
                  iconBg="bg-slate-100 dark:bg-slate-700"
                  status="Battery Low"
                  room="Garage"
                  protocol="WiFi 6"
                  lastSeen="12 hours ago"
                  type="garage"
                />
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark shrink-0">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-900 dark:text-white">1</span> to <span className="font-medium text-slate-900 dark:text-white">5</span> of <span className="font-medium text-slate-900 dark:text-white">42</span> devices
            </p>
            <div className="flex gap-2">
              <button disabled className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-400 text-sm font-medium">Prev</button>
              <button className="px-3 py-1 bg-primary text-white rounded-md text-sm font-medium">1</button>
              <button className="px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors">2</button>
              <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Next</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Sub Components ---

function FilterChip({ label, count, active }: { label: string, count?: number, active?: boolean }) {
  return (
    <button className={cn(
      "flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-3 pr-3 border transition-all text-sm font-medium",
      active
        ? "bg-blue-50 dark:bg-blue-900/20 text-primary border-transparent"
        : "bg-transparent text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
    )}>
      <span>{label}</span>
      {count && (
        <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{count}</span>
      )}
    </button>
  );
}

function IconButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="flex size-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
      {icon}
    </button>
  );
}

function TableHeader({ children, width, align = 'left' }: { children: React.ReactNode, width?: string, align?: 'left' | 'right' }) {
  return (
    <th
      className={cn(
        "px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800",
        align === 'right' ? 'text-right' : 'text-left'
      )}
      style={{ width }}
    >
      {children}
    </th>
  );
}

function DeviceRow({ name, id, icon, iconColor, iconBg, status, room, protocol, lastSeen, type, value }: any) {
  const isOnline = status === 'Online';
  const isBatteryLow = status === 'Battery Low';
  const isOffline = status === 'Offline';

  return (
    <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={cn("size-10 rounded-lg flex items-center justify-center", iconBg, iconColor)}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">ID: {id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
          isOnline && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
          isOffline && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          isBatteryLow && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
        )}>
          <span className={cn("size-1.5 rounded-full",
            isOnline && "bg-emerald-500",
            isOffline && "bg-red-500",
            isBatteryLow && "bg-amber-500"
          )}></span>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{room}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Router size={16} className="text-slate-400" />
          <span className="text-sm text-slate-500 dark:text-slate-300">{protocol}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{lastSeen}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-3">
          {value && (
            <div className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-900 dark:text-white">
              {value}
            </div>
          )}
          {type === 'light' || type === 'garage' ? (
            <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
              <input type="checkbox" name="toggle" id="toggle1" className="peer absolute block w-4 h-4 rounded-full bg-white border-none appearance-none cursor-pointer top-1 left-1 checked:left-[1.3rem] transition-all z-10 shadow-sm" />
              <label htmlFor="toggle1" className="block overflow-hidden h-6 rounded-full bg-slate-300 dark:bg-slate-600 cursor-pointer peer-checked:bg-primary transition-colors"></label>
            </div>
          ) : null}

          <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </td>
    </tr>
  );
}
