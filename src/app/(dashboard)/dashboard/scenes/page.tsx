'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Plus, Clock, Moon, Sun, Key, Video, Bell, Wind, Droplets } from 'lucide-react';
import api from '@/services/api.service';

export default function ScenesPage() {
  const router = useRouter();
  const handleBack = () => router.back();

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Top Toolbar */}
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Control Center</h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Back</button>
        </div>
      </header>

      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8 overflow-y-auto">

        {/* Page Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Automations & Scenes</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">Manage your home logic and quick actions</p>
          </div>
          <button className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary text-white text-sm font-bold shadow-lg hover:bg-blue-600 transition-all active:scale-95">
            <Plus size={20} />
            <span>Create New</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          {/* Left Column: Scenes */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Scenes</h3>
              <button className="text-primary text-sm font-medium hover:underline">Edit</button>
            </div>

            <div className="flex flex-col gap-4">
              <SceneCard
                icon={<Moon size={24} />}
                title="Good Night"
                desc="Turn off all lights & lock doors"
                color="blue"
              />
              <SceneCard
                icon={<Video size={24} />}
                title="Movie Mode"
                desc="Active • 2 devices on"
                color="primary"
                active
              />
              <SceneCard
                icon={<Key size={24} />}
                title="Leaving Home"
                desc="Arm security & ECO mode"
                color="purple"
              />
              <SceneCard
                icon={<Sun size={24} />}
                title="Morning Rise"
                desc="Blinds open 50%"
                color="amber"
              />
            </div>
          </div>

          {/* Right Column: Automations */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Routines</h3>
              <div className="flex items-center gap-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-lg p-1">
                <button className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-900 dark:text-white">All</button>
                <button className="px-3 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-500">Security</button>
                <button className="px-3 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-500">Lighting</button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <AutomationRow
                icon1={<Clock size={20} />}
                condition="Time is 10:00 PM"
                icon2={<Moon size={20} />}
                action="Turn Off Porch Light"
                lastRun="Yesterday"
                active
              />
              <AutomationRow
                icon1={<Wind size={20} />}
                condition="Humidity > 60%"
                icon2={<Droplets size={20} />}
                action="Turn On Dehumidifier"
                lastRun="2d ago"
                active
              />
              <AutomationRow
                icon1={<Bell size={20} />}
                condition="Front Door Opens"
                icon2={<Key size={20} />}
                action="Send Notification"
                lastRun="Never"
                active={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SceneCard({ icon, title, desc, color, active }: any) {
  const isActive = active;
  const bgClass = isActive ? 'bg-blue-50/50 dark:bg-blue-900/10 border-primary' : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-800 hover:border-primary';
  const iconBgClass = isActive ? 'bg-primary text-white' : `bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`;

  return (
    <div className={`group flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all ${bgClass} ${!isActive && 'border'}`}>
      <div className={`size-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${iconBgClass} shadow-sm`}>
        {icon}
      </div>
      <div className="flex flex-col flex-1">
        <h4 className="text-base font-bold text-slate-900 dark:text-white">{title}</h4>
        <p className={`text-sm ${isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>{desc}</p>
      </div>
      <div className="size-8 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center group-hover:bg-slate-50 dark:group-hover:bg-slate-700">
        {isActive ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </div>
    </div>
  );
}

function AutomationRow({ icon1, condition, icon2, action, lastRun, active }: any) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark hover:shadow-md transition-all ${!active && 'opacity-70'}`}>
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            {icon1}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">If</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{condition}</span>
          </div>
        </div>
        <div className="text-slate-300 rotate-90 md:rotate-0">➜</div>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            {icon2}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Then</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{action}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-none border-slate-100 dark:border-slate-800 w-full md:w-auto">
        <span className="text-xs text-slate-500 font-medium">Last run: {lastRun}</span>
        <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${active ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
          <div className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform shadow-sm ${active ? 'translate-x-[20px]' : ''}`}></div>
        </div>
      </div>
    </div>
  );
}
