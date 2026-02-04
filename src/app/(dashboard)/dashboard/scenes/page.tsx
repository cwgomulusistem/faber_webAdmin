'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Plus, Clock, Moon, Sun, Key, Video, Bell, Wind, Droplets, Search, Loader2, Zap, Home, Lightbulb, Thermometer, Lock, Settings } from 'lucide-react';
import { cn, getActiveHomeId } from '@/lib/utils';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import { adminService } from '@/services/admin.service';
import type { Scene, SceneTrigger } from '@/types/scene.types';

// Icon mapping for scenes
const SCENE_ICONS: Record<string, React.ReactNode> = {
  moon: <Moon size={24} />,
  sun: <Sun size={24} />,
  video: <Video size={24} />,
  key: <Key size={24} />,
  home: <Home size={24} />,
  lightbulb: <Lightbulb size={24} />,
  thermometer: <Thermometer size={24} />,
  lock: <Lock size={24} />,
  bell: <Bell size={24} />,
  zap: <Zap size={24} />,
  settings: <Settings size={24} />,
};

// Color mapping for scene types
const SCENE_COLORS: string[] = ['blue', 'primary', 'purple', 'amber', 'green', 'red', 'indigo', 'pink'];

// Trigger icons
const TRIGGER_ICONS: Record<SceneTrigger | string, React.ReactNode> = {
  MANUAL: <Zap size={20} />,
  SCHEDULE: <Clock size={20} />,
  SUNRISE: <Sun size={20} />,
  SUNSET: <Moon size={20} />,
  DEVICE: <Settings size={20} />,
};

export default function ScenesPage() {
  const router = useRouter();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [executingSceneId, setExecutingSceneId] = useState<string | null>(null);
  const [togglingSceneId, setTogglingSceneId] = useState<string | null>(null);
  
  // Prevent double fetching in React StrictMode
  const hasFetchedRef = useRef(false);

  const fetchScenes = useCallback(async () => {
    try {
      setLoading(true);
      const homeId = getActiveHomeId();
      // Admin can see all scenes, or filter by homeId if selected
      const data = await adminService.getScenes(homeId || undefined);
      setScenes(data);
    } catch (err) {
      console.error('Failed to fetch scenes:', err);
      setScenes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchScenes();
  }, [fetchScenes]);

  const handleExecuteScene = async (sceneId: string) => {
    try {
      setExecutingSceneId(sceneId);
      await adminService.executeScene(sceneId);
      // Optionally show success toast
    } catch (err) {
      console.error('Failed to execute scene:', err);
    } finally {
      setExecutingSceneId(null);
    }
  };

  const handleToggleScene = async (sceneId: string, currentState: boolean) => {
    try {
      setTogglingSceneId(sceneId);
      const updatedScene = await adminService.toggleScene(sceneId, !currentState);
      setScenes(prev => prev.map(s => s.id === sceneId ? updatedScene : s));
    } catch (err) {
      console.error('Failed to toggle scene:', err);
    } finally {
      setTogglingSceneId(null);
    }
  };

  // Filter scenes
  const filteredScenes = scenes.filter(scene => {
    const matchesSearch = scene.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && scene.isActive) || 
      (filter === 'inactive' && !scene.isActive);
    return matchesSearch && matchesFilter;
  });

  // Split into quick scenes (manual) and automations (scheduled/triggered)
  const quickScenes = filteredScenes.filter(s => s.triggerType === 'MANUAL');
  const automations = filteredScenes.filter(s => s.triggerType !== 'MANUAL');

  const getSceneIcon = (scene: Scene, index: number) => {
    if (scene.icon && SCENE_ICONS[scene.icon.toLowerCase()]) {
      return SCENE_ICONS[scene.icon.toLowerCase()];
    }
    // Default icon based on index
    const defaultIcons = [<Moon key="moon" size={24} />, <Sun key="sun" size={24} />, <Lightbulb key="light" size={24} />, <Zap key="zap" size={24} />];
    return defaultIcons[index % defaultIcons.length];
  };

  const getSceneColor = (index: number) => {
    return SCENE_COLORS[index % SCENE_COLORS.length];
  };

  const getTriggerLabel = (scene: Scene) => {
    if (scene.triggerType === 'SCHEDULE' && scene.triggerData?.time) {
      return `Saat ${scene.triggerData.time}`;
    }
    if (scene.triggerType === 'SUNRISE') return 'Gün Doğumu';
    if (scene.triggerType === 'SUNSET') return 'Gün Batımı';
    if (scene.triggerType === 'DEVICE') return 'Cihaz Tetiklemesi';
    return 'Manuel';
  };

  const getActionSummary = (scene: Scene) => {
    if (!scene.actions || scene.actions.length === 0) {
      return 'Aksiyon yok';
    }
    return `${scene.actions.length} aksiyon`;
  };

  const formatLastRun = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Bugün';
    if (days === 1) return 'Dün';
    if (days < 7) return `${days} gün önce`;
    return d.toLocaleDateString('tr-TR');
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Standard Header */}
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Otomasyon</h1>
            <span className="text-xs text-gray-500">Sahne ve Rutin Yönetimi</span>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Sahne veya rutin ara..."
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

          <button 
            onClick={() => router.push('/dashboard/scenes/new')}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary hover:bg-blue-600 text-white px-4 py-2 shadow-sm transition-all active:scale-95 text-sm font-semibold"
          >
            <Plus size={18} />
            <span>Yeni Oluştur</span>
          </button>
        </div>
      </header>

      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 overflow-y-auto">
        {loading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : scenes.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Zap className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Henüz Sahne Yok</h3>
            <p className="text-gray-500 text-center max-w-md">
              Cihazlarınızı otomatikleştirmek için yeni bir sahne veya otomasyon oluşturun.
            </p>
            <button 
              onClick={() => router.push('/dashboard/scenes/new')}
              className="mt-4 flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <Plus size={20} />
              <span>İlk Sahnenizi Oluşturun</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            {/* Left Column: Quick Scenes */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hızlı Sahneler</h3>
                <span className="text-xs text-gray-500">{quickScenes.length} sahne</span>
              </div>

              {quickScenes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <Zap className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Manuel sahne bulunmuyor</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {quickScenes.map((scene, index) => (
                    <SceneCard
                      key={scene.id}
                      icon={getSceneIcon(scene, index)}
                      title={scene.name}
                      desc={getActionSummary(scene)}
                      color={getSceneColor(index)}
                      active={scene.isActive}
                      executing={executingSceneId === scene.id}
                      onExecute={() => handleExecuteScene(scene.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Automations */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aktif Otomasyonlar</h3>
                <div className="flex items-center gap-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-lg p-1">
                  <button 
                    onClick={() => setFilter('all')}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      filter === 'all' 
                        ? "bg-slate-100 dark:bg-slate-700 font-bold text-slate-900 dark:text-white" 
                        : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    Tümü
                  </button>
                  <button 
                    onClick={() => setFilter('active')}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      filter === 'active' 
                        ? "bg-slate-100 dark:bg-slate-700 font-bold text-slate-900 dark:text-white" 
                        : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    Aktif
                  </button>
                  <button 
                    onClick={() => setFilter('inactive')}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      filter === 'inactive' 
                        ? "bg-slate-100 dark:bg-slate-700 font-bold text-slate-900 dark:text-white" 
                        : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    Pasif
                  </button>
                </div>
              </div>

              {automations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <Clock className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="text-gray-500">Zamanlanmış otomasyon bulunmuyor</p>
                  <button 
                    onClick={() => router.push('/dashboard/scenes/new?type=automation')}
                    className="mt-4 text-primary text-sm font-medium hover:underline"
                  >
                    + Otomasyon Ekle
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {automations.map((scene) => (
                    <AutomationRow
                      key={scene.id}
                      scene={scene}
                      triggerIcon={TRIGGER_ICONS[scene.triggerType] || <Zap size={20} />}
                      triggerLabel={getTriggerLabel(scene)}
                      actionSummary={getActionSummary(scene)}
                      lastRun={formatLastRun(scene.updatedAt)}
                      active={scene.isActive}
                      toggling={togglingSceneId === scene.id}
                      onToggle={() => handleToggleScene(scene.id, scene.isActive)}
                      onClick={() => router.push(`/dashboard/scenes/${scene.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SceneCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  active: boolean;
  executing: boolean;
  onExecute: () => void;
}

function SceneCard({ icon, title, desc, color, active, executing, onExecute }: SceneCardProps) {
  const bgClass = active 
    ? 'bg-blue-50/50 dark:bg-blue-900/10 border-primary' 
    : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-800 hover:border-primary';
  
  const iconBgClass = active 
    ? 'bg-primary text-white' 
    : `bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`;

  return (
    <div 
      className={cn(
        "group flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all",
        bgClass,
        !active && 'border'
      )}
    >
      <div className={cn(
        "size-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
        iconBgClass
      )}>
        {icon}
      </div>
      <div className="flex flex-col flex-1">
        <h4 className="text-base font-bold text-slate-900 dark:text-white">{title}</h4>
        <p className={cn("text-sm", active ? 'text-primary' : 'text-slate-500 dark:text-slate-400')}>
          {desc}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExecute();
        }}
        disabled={executing}
        className="size-10 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center group-hover:bg-slate-50 dark:group-hover:bg-slate-700 transition-colors disabled:opacity-50"
      >
        {executing ? (
          <Loader2 size={18} className="animate-spin text-primary" />
        ) : (
          <Play size={16} className="ml-0.5 text-slate-600 dark:text-slate-300" />
        )}
      </button>
    </div>
  );
}

interface AutomationRowProps {
  scene: Scene;
  triggerIcon: React.ReactNode;
  triggerLabel: string;
  actionSummary: string;
  lastRun: string;
  active: boolean;
  toggling: boolean;
  onToggle: () => void;
  onClick: () => void;
}

function AutomationRow({ scene, triggerIcon, triggerLabel, actionSummary, lastRun, active, toggling, onToggle, onClick }: AutomationRowProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark hover:shadow-md transition-all cursor-pointer",
        !active && 'opacity-70'
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            {triggerIcon}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Tetikleyici</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{triggerLabel}</span>
          </div>
        </div>
        <div className="text-slate-300 rotate-90 md:rotate-0">➜</div>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Zap size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Aksiyon</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{scene.name}</span>
            <span className="text-xs text-slate-500">{actionSummary}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-none border-slate-100 dark:border-slate-800 w-full md:w-auto">
        <span className="text-xs text-slate-500 font-medium">Son: {lastRun}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          disabled={toggling}
          className={cn(
            "w-11 h-6 rounded-full relative transition-colors",
            active ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700',
            toggling && 'opacity-50'
          )}
        >
          {toggling ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={14} className="animate-spin text-white" />
            </div>
          ) : (
            <div className={cn(
              "absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform shadow-sm",
              active && 'translate-x-[20px]'
            )} />
          )}
        </button>
      </div>
    </div>
  );
}
