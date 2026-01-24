'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, Wifi, Bell, Shield, Download, Search, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming utils

export default function SettingsPage() {
  const router = useRouter();
  const handleBack = () => router.back();

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      <header className="flex items-center justify-between px-6 py-3 h-16 shrink-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h2>
        </div>
        <div className="flex gap-4">
          <button onClick={handleBack} className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Back</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Settings Nav (Desktop) */}
        <aside className="w-64 flex flex-col bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 overflow-y-auto shrink-0 hidden md:flex">
          <div className="p-4 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System</h3>
              <NavItem icon={<User size={18} />} label="Profile" active />
              <NavItem icon={<Wifi size={18} />} label="Connectivity" />
              <NavItem icon={<Bell size={18} />} label="Notifications" />
              <NavItem icon={<Shield size={18} />} label="Security" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Support</h3>
              <NavItem icon={<Download size={18} />} label="Export Data" />
              <NavItem icon={<HelpCircle size={18} />} label="Help" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          <div className="max-w-[800px] mx-auto flex flex-col gap-8 pb-10">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Profile Settings</h1>
              <p className="text-slate-500">Manage your personal information and preferences.</p>
            </div>

            {/* Avatar Section */}
            <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  {/* Avatar placeholder */}
                  <div className="w-full h-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-3xl font-bold">AM</div>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Alex Morgan</h3>
                <p className="text-slate-500">System Administrator</p>
                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                  <CheckCircle size={12} className="mr-1" /> Active
                </div>
              </div>
              <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800">Change Avatar</button>
            </section>

            {/* Forms */}
            <section className="flex flex-col gap-5">
              <h2 className="text-xl font-bold border-b border-slate-200 dark:border-slate-800 pb-2">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Full Name" value="Alex Morgan" />
                <FormInput label="Email Address" value="alex@smarthome.io" type="email" />
                <FormInput label="Phone" value="+1 (555) 012-3456" />
              </div>
            </section>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
              <button onClick={handleBack} className="px-6 py-3 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
              <button className="px-8 py-3 rounded-lg text-sm font-bold bg-primary text-white hover:bg-blue-600 shadow-md transition-colors">Save Changes</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active }: any) {
  return (
    <button className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left",
      active ? "bg-primary/10 text-primary font-semibold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900"
    )}>
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

function FormInput({ label, value, type = "text" }: any) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <input
        type={type}
        defaultValue={value}
        className="flex w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark h-11 px-4 text-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
      />
    </label>
  );
}
