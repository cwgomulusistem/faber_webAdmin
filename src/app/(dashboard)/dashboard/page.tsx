'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil, Check, Plus, Search, Sun, Moon, Home, Bell, User,
  ChevronDown, Settings, LayoutGrid, Wifi, WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionCard } from '@/components/dashboard/SectionCard';
import { WidgetCard } from '@/components/dashboard/WidgetCard';
import type { Section, Widget, DashboardConfig } from '@/components/dashboard/types';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import api from '@/services/api.service';
import socketService from '@/services/socket.service';

// ============================================
// Helper Mapping Functions
// ============================================

const mapDeviceToWidget = (device: any): Widget => {
  // Map backend device type to widget type
  let type: any = 'toggle';
  let icon = 'hardware';

  const deviceType = device.type?.toLowerCase() || '';
  if (deviceType.includes('light')) { type = 'toggle'; icon = 'light'; }
  else if (deviceType.includes('switch') || deviceType.includes('socket')) { type = 'toggle'; icon = 'switch'; }
  else if (deviceType.includes('therm') || deviceType.includes('heat')) { type = 'sensor'; icon = 'temperature'; }
  else if (deviceType.includes('lock')) { type = 'toggle'; icon = 'lock'; }
  else if (deviceType.includes('fan')) { type = 'toggle'; icon = 'fan'; }

  // Check attributes
  const isOn = device.attributes?.on === true;
  const state = isOn ? 'on' : 'off';
  const value = device.attributes?.temperature || device.attributes?.brightness || 0;
  const unit = device.attributes?.unit || (icon === 'temperature' ? '°C' : '%');

  return {
    id: `w-${device.id}`, // Widget ID
    entityId: device.id, // Real Device ID used for socket
    type: type,
    name: device.name,
    icon: icon,
    state: state,
    value: value,
    unit: unit
  };
};

/* Unchanged Header Components */
interface HomeSelectorProps {
  homes: { id: string; name: string }[];
  activeHome: string;
  onSelect: (id: string) => void;
}

function HomeSelector({ homes, activeHome, onSelect }: HomeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const current = homes.find(h => h.id === activeHome);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 px-4 py-2.5 rounded-xl',
          'bg-white border border-gray-200',
          'hover:border-gray-300 transition-all',
          'shadow-sm'
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
          <Home size={16} />
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-gray-900">{current?.name || 'Ev Seç'}</div>
          <div className="text-xs text-gray-500">Aktif Konum</div>
        </div>
        <ChevronDown size={16} className={cn(
          'text-gray-400 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'absolute top-full left-0 mt-2 w-full z-50',
                'bg-white rounded-xl shadow-lg border border-gray-100',
                'overflow-hidden'
              )}
            >
              {homes.map(home => (
                <button
                  key={home.id}
                  onClick={() => { onSelect(home.id); setIsOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3',
                    'hover:bg-gray-50 transition-colors',
                    home.id === activeHome && 'bg-blue-50'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    home.id === activeHome
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                  )}>
                    <Home size={16} />
                  </div>
                  <span className="font-medium text-gray-900">{home.name}</span>
                  {home.id === activeHome && (
                    <Check size={16} className="ml-auto text-blue-500" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DashboardHeaderProps {
  editMode: boolean;
  onToggleEditMode: () => void;
  onAddSection: () => void;
  homes: any[];
  activeHomeId: string;
  onHomeChange: (id: string) => void;
}

function DashboardHeader({ editMode, onToggleEditMode, onAddSection, homes, activeHomeId, onHomeChange }: DashboardHeaderProps) {
  return (
    <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 shrink-0 z-20 sticky top-0">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="hover:text-primary cursor-pointer">Ana Sayfa</span>
          </div>
        </div>
        {homes.length > 0 && (
          <HomeSelector homes={homes} activeHome={activeHomeId} onSelect={onHomeChange} />
        )}
      </div>

      <div className="flex-1 max-w-2xl px-12">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Cihaz veya oda ara..."
            className={cn(
              'block w-full pl-11 pr-14 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl',
              'bg-gray-50 dark:bg-gray-800 text-sm',
              'focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'dark:text-gray-200 placeholder-gray-400 transition shadow-sm'
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden xl:flex flex-col items-end mr-2">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Sistem Durumu</span>
          <SocketStatus />
        </div>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

        <button className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition dark:text-gray-400 relative">
          <Bell className="w-5 h-5" />
        </button>

        {editMode ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onAddSection}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Bölüm Ekle</span>
            </button>
            <button
              onClick={onToggleEditMode}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 font-medium shadow-lg shadow-blue-500/25 transition-all"
            >
              <Check size={18} />
              <span className="hidden sm:inline">Bitti</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onToggleEditMode}
            className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-lg shadow-gray-200 dark:shadow-none"
          >
            <Pencil className="w-4 h-4" />
            <span className="text-sm font-semibold">Düzenle</span>
          </button>
        )}
      </div>
    </header>
  );
}

function SocketStatus() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    return socketService.onConnectionChange(setConnected);
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("w-2 h-2 rounded-full", connected ? "bg-green-500 animate-pulse" : "bg-red-500")}></span>
      <span className={cn("text-xs font-medium", connected ? "text-green-600 dark:text-green-400" : "text-red-600")}>
        {connected ? "Çevrimiçi" : "Bağlantı Yok"}
      </span>
    </div>
  );
}

function AddSectionDialog({ open, onClose, onAdd }: AddSectionDialogProps) {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('living_room');
  const [color, setColor] = useState('#6366f1');

  const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#64748b'];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Yeni Bölüm Ekle</h2>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bölüm Adı</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Örn: Salon" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Renk</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} className={cn('w-10 h-10 rounded-xl transition-transform', color === c && 'ring-2 ring-offset-2 ring-gray-400 scale-110')} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition-colors">İptal</button>
          <button onClick={() => { if (title.trim()) { onAdd({ title, icon, color }); setTitle(''); onClose(); } }} disabled={!title.trim()} className="px-4 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 font-medium disabled:opacity-50 transition-colors">Ekle</button>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// Main Dashboard Content
// ============================================

interface AddSectionDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (section: Omit<Section, 'id' | 'widgets'>) => void;
}

function DashboardContent() {
  const [sections, setSections] = useState<Section[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [homes, setHomes] = useState<any[]>([]);
  const [activeHomeId, setActiveHomeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const homesRes = await api.get('/homes');
        const fetchedHomes = homesRes.data || [];
        setHomes(fetchedHomes);

        if (fetchedHomes.length === 0) {
          setIsLoading(false);
          return;
        }

        let currentHomeId = localStorage.getItem('faber_active_home_id');
        if (!currentHomeId || !fetchedHomes.find((h: any) => h.id === currentHomeId)) {
          const defaultHomeId = String(fetchedHomes[0].id);
          currentHomeId = defaultHomeId;
          localStorage.setItem('faber_active_home_id', defaultHomeId);
        }

        if (currentHomeId) {
          setActiveHomeId(currentHomeId);
          await loadDashboardData(currentHomeId);
        }

      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const loadDashboardData = async (homeId: string) => {
    setIsLoading(true);
    try {
      const [roomsRes, devicesRes] = await Promise.all([
        api.get(`/homes/${homeId}/rooms`),
        api.get(`/homes/${homeId}/devices`)
      ]);

      const rooms = roomsRes.data || [];
      const devices = devicesRes.data || [];

      const newSections: Section[] = rooms.map((room: any, index: number) => {
        const roomDevices = devices.filter((d: any) => d.roomId === room.id);
        const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
        return {
          id: room.id,
          title: room.name,
          icon: 'living_room',
          color: colors[index % colors.length],
          widgets: roomDevices.map((d: any) => mapDeviceToWidget(d))
        };
      });

      const unassigned = devices.filter((d: any) => !d.roomId);
      if (unassigned.length > 0) {
        newSections.push({
          id: 'unassigned',
          title: 'Diğer Cihazlar',
          icon: 'box',
          color: '#94a3b8',
          widgets: unassigned.map((d: any) => mapDeviceToWidget(d))
        });
      }
      setSections(newSections);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    socketService.connect();
    sections.forEach(section => {
      section.widgets.forEach(widget => {
        if (widget.entityId) {
          socketService.subscribeToDevice(widget.entityId, (device: any) => {
            setSections(prev => prev.map(s => ({
              ...s,
              widgets: s.widgets.map(w => {
                if (w.entityId === device.id) {
                  const updated = mapDeviceToWidget(device);
                  return { ...w, state: updated.state, value: updated.value };
                }
                return w;
              })
            })));
          });
        }
      });
    });
    return () => { };
  }, [sections]);

  const handleWidgetToggle = async (widgetId: string, state: boolean) => {
    const deviceId = widgetId.replace('w-', '');
    try {
      await api.patch(`/devices/${deviceId}`, { attributes: { on: state } });
    } catch (err) {
      console.error("Toggle failed", err);
    }
  };

  const handleWidgetSliderChange = async (widgetId: string, value: number) => {
    const deviceId = widgetId.replace('w-', '');
    let attribute = 'brightness';
    let widget: Widget | undefined;
    for (const section of sections) {
      widget = section.widgets.find(w => w.id === widgetId);
      if (widget) break;
    }

    if (widget) {
      if (widget.type === 'climate') attribute = 'target_temperature';
      else if (widget.type === 'slider') attribute = 'brightness';
    }

    try {
      await api.patch(`/devices/${deviceId}`, { attributes: { [attribute]: value } });
    } catch (err) {
      console.error("Slider change failed", err);
    }
  };

  const handleHomeChange = (id: string) => {
    setActiveHomeId(id);
    localStorage.setItem('faber_active_home_id', id);
    loadDashboardData(id);
  };

  const findSectionByWidgetId = useCallback((widgetId: string) => {
    return sections.find(s => s.widgets.some(w => w.id === widgetId));
  }, [sections]);

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    const section = sections.find(s => s.id === activeId);
    if (section) return { type: 'section', data: section };
    for (const s of sections) {
      const widget = s.widgets.find(w => w.id === activeId);
      if (widget) return { type: 'widget', data: widget, sectionColor: s.color };
    }
    return null;
  }, [activeId, sections]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;
    const activeSection = findSectionByWidgetId(activeId);
    const overSection = findSectionByWidgetId(overId) || sections.find(s => s.id === overId);
    if (!activeSection || !overSection) return;
    if (activeSection.id !== overSection.id && activeSection.widgets.some(w => w.id === activeId)) {
      setSections(prev => {
        const activeWidget = activeSection.widgets.find(w => w.id === activeId);
        if (!activeWidget) return prev;
        return prev.map(section => {
          if (section.id === activeSection.id) {
            return {
              ...section,
              widgets: section.widgets.filter(w => w.id !== activeId)
            };
          }
          if (section.id === overSection.id) {
            const overIndex = section.widgets.findIndex(w => w.id === overId);
            const newWidgets = [...section.widgets];
            newWidgets.splice(overIndex >= 0 ? overIndex : newWidgets.length, 0, activeWidget);
            return { ...section, widgets: newWidgets };
          }
          return section;
        });
      });
    }
  }, [findSectionByWidgetId, sections]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) { setActiveId(null); return; }
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeIsSection = sections.some(s => s.id === activeId);
    const overIsSection = sections.some(s => s.id === overId);
    if (activeIsSection && overIsSection && activeId !== overId) {
      setSections(prev => {
        const oldIndex = prev.findIndex(s => s.id === activeId);
        const newIndex = prev.findIndex(s => s.id === overId);
        return arrayMove(prev, oldIndex, newIndex);
      });
    } else {
      const section = findSectionByWidgetId(activeId);
      if (section && section.widgets.some(w => w.id === overId)) {
        setSections(prev => prev.map(s => {
          if (s.id === section.id) {
            const oldIndex = s.widgets.findIndex(w => w.id === activeId);
            const newIndex = s.widgets.findIndex(w => w.id === overId);
            return { ...s, widgets: arrayMove(s.widgets, oldIndex, newIndex) };
          }
          return s;
        }));
      }
    }
    setActiveId(null);
  }, [findSectionByWidgetId, sections]);

  const handleAddSection = useCallback((data: Omit<Section, 'id' | 'widgets'>) => {
    const newSection: Section = {
      ...data,
      id: `section-${Date.now()}`,
      widgets: [],
    };
    setSections(prev => [...prev, newSection]);
  }, []);

  const handleDeleteSection = useCallback((sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
  }, []);

  const handleDeleteWidget = useCallback((sectionId: string, widgetId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return { ...s, widgets: s.widgets.filter(w => w.id !== widgetId) };
      }
      return s;
    }));
  }, []);

  const handleToggleCollapse = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
      <DashboardHeader
        editMode={editMode}
        onToggleEditMode={() => setEditMode(!editMode)}
        onAddSection={() => setAddSectionOpen(true)}
        homes={homes}
        activeHomeId={activeHomeId}
        onHomeChange={handleHomeChange}
      />
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30 overflow-hidden shrink-0"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
                <Pencil size={18} />
                <span className="font-medium">Düzenleme Modu</span>
                <span className="text-blue-600 dark:text-blue-400 text-sm">• Sürükleyerek düzenleyebilirsiniz</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-gray-500">Veriler yükleniyor...</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sections.map(section => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    editMode={editMode}
                    isCollapsed={collapsedSections.has(section.id)}
                    onToggleCollapse={() => handleToggleCollapse(section.id)}
                    onDelete={() => handleDeleteSection(section.id)}
                    onDeleteWidget={(widgetId) => handleDeleteWidget(section.id, widgetId)}
                    onWidgetToggle={handleWidgetToggle}
                    onWidgetSliderChange={handleWidgetSliderChange}
                    onAddWidget={() => {/* TODO */ }}
                  />
                ))}
                {editMode && (
                  <motion.button onClick={() => setAddSectionOpen(true)} className={cn('flex flex-col items-center justify-center gap-4', 'min-h-[200px] rounded-3xl', 'border-2 border-dashed border-gray-300', 'hover:border-blue-400 hover:bg-blue-50/50', 'text-gray-400 hover:text-blue-500', 'transition-all')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-current flex items-center justify-center"><Plus size={28} /></div>
                    <span className="text-lg font-medium">Yeni Bölüm Ekle</span>
                  </motion.button>
                )}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeItem && activeItem.type === 'section' ? (
                <div className="opacity-90"><SectionCard section={activeItem.data as Section} editMode={true} /></div>
              ) : activeItem && activeItem.type === 'widget' ? (
                <div className="opacity-90 w-full max-w-[200px]"><WidgetCard widget={activeItem.data as Widget} editMode={true} sectionColor={activeItem.sectionColor} /></div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
        {!isLoading && sections.length === 0 && !editMode && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center"><LayoutGrid size={40} className="text-gray-400" /></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Veri Bulunamadı</h2>
            <p className="text-gray-500 mb-6">Cihaz bulunamadı veya henüz oda eklemediniz.</p>
            <button onClick={() => setEditMode(true)} className="px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors">Düzenle</button>
          </div>
        )}
      </main>
      <AnimatePresence>
        {addSectionOpen && <AddSectionDialog open={addSectionOpen} onClose={() => setAddSectionOpen(false)} onAdd={handleAddSection} />}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardPage() {
  return <ThemeProvider><DashboardContent /></ThemeProvider>;
}
