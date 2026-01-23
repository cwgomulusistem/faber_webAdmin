'use client';

import React, { useState, useCallback, useMemo } from 'react';
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

// ============================================
// Mock Data - Demo Dashboard
// ============================================

const INITIAL_DASHBOARD: DashboardConfig = {
  id: 'main',
  name: 'Ana Sayfa',
  sections: [
    {
      id: 'section-study',
      title: 'Çalışma Odası',
      icon: 'study',
      color: '#6366f1',
      widgets: [
        { id: 'w1', type: 'toggle', name: 'Masa Lambası', icon: 'light', state: 'on' },
        { id: 'w2', type: 'slider', name: 'Tavan Işığı', icon: 'light', value: 75 },
        { id: 'w3', type: 'sensor', name: 'Sıcaklık', icon: 'temperature', value: 22, unit: '°C' },
        { id: 'w4', type: 'toggle', name: 'Klima', icon: 'climate', state: 'off' },
      ],
    },
    {
      id: 'section-outdoor',
      title: 'Bahçe',
      icon: 'outdoor',
      color: '#22c55e',
      widgets: [
        { id: 'w5', type: 'toggle', name: 'Bahçe Işıkları', icon: 'light', state: 'on' },
        { id: 'w6', type: 'toggle', name: 'Çim Sulama', icon: 'switch', state: 'off' },
        { id: 'w7', type: 'scene', name: 'Akşam Modu', icon: 'scene' },
      ],
    },
    {
      id: 'section-kitchen',
      title: 'Mutfak',
      icon: 'kitchen',
      color: '#f59e0b',
      widgets: [
        { id: 'w8', type: 'toggle', name: 'Tezgah Işığı', icon: 'light', state: 'on' },
        { id: 'w9', type: 'sensor', name: 'Nem', icon: 'humidity', value: 45, unit: '%' },
        { id: 'w10', type: 'toggle', name: 'Buzdolabı', icon: 'switch', state: 'on' },
        { id: 'w11', type: 'climate', name: 'Klima', icon: 'climate', value: 21, state: 'Soğutma' },
      ],
    },
    {
      id: 'section-living',
      title: 'Oturma Odası',
      icon: 'living_room',
      color: '#ec4899',
      widgets: [
        { id: 'w12', type: 'slider', name: 'Ana Işık', icon: 'light', value: 100 },
        { id: 'w13', type: 'toggle', name: 'TV', icon: 'media', state: 'on' },
        { id: 'w14', type: 'toggle', name: 'Hoparlör', icon: 'media', state: 'off' },
        { id: 'w15', type: 'scene', name: 'Film Modu', icon: 'scene' },
        { id: 'w16', type: 'scene', name: 'Parti Modu', icon: 'scene' },
      ],
    },
    {
      id: 'section-bedroom',
      title: 'Yatak Odası',
      icon: 'bedroom',
      color: '#8b5cf6',
      widgets: [
        { id: 'w17', type: 'slider', name: 'Yatak Lambası', icon: 'light', value: 30 },
        { id: 'w18', type: 'toggle', name: 'Gece Lambası', icon: 'light', state: 'on' },
        { id: 'w19', type: 'sensor', name: 'Sıcaklık', icon: 'temperature', value: 20, unit: '°C' },
      ],
    },
    {
      id: 'section-bathroom',
      title: 'Banyo',
      icon: 'bathroom',
      color: '#06b6d4',
      widgets: [
        { id: 'w20', type: 'toggle', name: 'Ayna Işığı', icon: 'light', state: 'off' },
        { id: 'w21', type: 'toggle', name: 'Havalandırma', icon: 'fan', state: 'off' },
        { id: 'w22', type: 'sensor', name: 'Nem', icon: 'humidity', value: 65, unit: '%' },
      ],
    },
  ],
};

// ============================================
// Home Selector Component
// ============================================

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
          <div className="text-sm font-semibold text-gray-900">{current?.name}</div>
          <div className="text-xs text-gray-500">2 kat • 6 oda</div>
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
              
              <div className="border-t border-gray-100">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
                    <Plus size={16} />
                  </div>
                  <span className="font-medium">Yeni Ev Ekle</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Dashboard Header Component
// ============================================

interface DashboardHeaderProps {
  editMode: boolean;
  onToggleEditMode: () => void;
  onAddSection: () => void;
}

function DashboardHeader({ editMode, onToggleEditMode, onAddSection }: DashboardHeaderProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <header className="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-lg border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Home Selector */}
          <HomeSelector
            homes={[
              { id: 'home-1', name: 'Evim' },
              { id: 'home-2', name: 'Yazlık' },
              { id: 'home-3', name: 'Ofis' },
            ]}
            activeHome="home-1"
            onSelect={() => {}}
          />
          
          {/* Center: Search (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cihaz veya oda ara..."
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 rounded-xl',
                  'bg-white border border-gray-200',
                  'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                  'outline-none transition-all',
                  'text-gray-900 placeholder:text-gray-400'
                )}
              />
            </div>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <Wifi size={14} />
              Bağlı
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-700 transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-700 transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            
            {/* Edit Mode Toggle */}
            {editMode ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onAddSection}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-all"
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
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-all"
              >
                <Pencil size={18} />
                <span className="hidden sm:inline">Düzenle</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================
// Add Section Dialog
// ============================================

interface AddSectionDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (section: Omit<Section, 'id' | 'widgets'>) => void;
}

function AddSectionDialog({ open, onClose, onAdd }: AddSectionDialogProps) {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('living_room');
  const [color, setColor] = useState('#6366f1');
  
  const ICONS = ['living_room', 'bedroom', 'kitchen', 'bathroom', 'outdoor', 'study', 'garage', 'kids_room'];
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
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Örn: Salon"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Renk</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-10 h-10 rounded-xl transition-transform',
                    color === c && 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition-colors"
          >
            İptal
          </button>
          <button
            onClick={() => {
              if (title.trim()) {
                onAdd({ title, icon, color });
                setTitle('');
                onClose();
              }
            }}
            disabled={!title.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Ekle
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// Main Dashboard Content
// ============================================

function DashboardContent() {
  const [sections, setSections] = useState<Section[]>(INITIAL_DASHBOARD.sections);
  const [editMode, setEditMode] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  
  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Find section containing a widget
  const findSectionByWidgetId = useCallback((widgetId: string) => {
    return sections.find(s => s.widgets.some(w => w.id === widgetId));
  }, [sections]);
  
  // Get active item (section or widget)
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    
    // Check if it's a section
    const section = sections.find(s => s.id === activeId);
    if (section) return { type: 'section', data: section };
    
    // Check if it's a widget
    for (const s of sections) {
      const widget = s.widgets.find(w => w.id === activeId);
      if (widget) return { type: 'widget', data: widget, sectionColor: s.color };
    }
    
    return null;
  }, [activeId, sections]);
  
  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);
  
  // Handle drag over
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Don't do anything if hovering over itself
    if (activeId === overId) return;
    
    // Find the sections
    const activeSection = findSectionByWidgetId(activeId);
    const overSection = findSectionByWidgetId(overId) || sections.find(s => s.id === overId);
    
    if (!activeSection || !overSection) return;
    
    // Moving widget to different section
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
  
  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Check if moving sections
    const activeIsSection = sections.some(s => s.id === activeId);
    const overIsSection = sections.some(s => s.id === overId);
    
    if (activeIsSection && overIsSection && activeId !== overId) {
      setSections(prev => {
        const oldIndex = prev.findIndex(s => s.id === activeId);
        const newIndex = prev.findIndex(s => s.id === overId);
        return arrayMove(prev, oldIndex, newIndex);
      });
    } else {
      // Moving widgets within same section
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
  
  // Add Section
  const handleAddSection = useCallback((data: Omit<Section, 'id' | 'widgets'>) => {
    const newSection: Section = {
      ...data,
      id: `section-${Date.now()}`,
      widgets: [],
    };
    setSections(prev => [...prev, newSection]);
  }, []);
  
  // Delete Section
  const handleDeleteSection = useCallback((sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
  }, []);
  
  // Delete Widget
  const handleDeleteWidget = useCallback((sectionId: string, widgetId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return { ...s, widgets: s.widgets.filter(w => w.id !== widgetId) };
      }
      return s;
    }));
  }, []);
  
  // Toggle Section Collapse
  const handleToggleCollapse = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        editMode={editMode}
        onToggleEditMode={() => setEditMode(!editMode)}
        onAddSection={() => setAddSectionOpen(true)}
      />
      
      {/* Edit Mode Banner */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-blue-50 border-b border-blue-100 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center gap-3 text-blue-700">
                <Pencil size={18} />
                <span className="font-medium">Düzenleme Modu</span>
                <span className="text-blue-600 text-sm">• Bölümleri ve widget'ları sürükleyerek taşıyabilirsiniz</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {/* Sections Grid */}
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
                  onAddWidget={() => {/* TODO: Add widget dialog */}}
                />
              ))}
              
              {/* Add Section Card (Edit Mode) */}
              {editMode && (
                <motion.button
                  onClick={() => setAddSectionOpen(true)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-4',
                    'min-h-[200px] rounded-3xl',
                    'border-2 border-dashed border-gray-300',
                    'hover:border-blue-400 hover:bg-blue-50/50',
                    'text-gray-400 hover:text-blue-500',
                    'transition-all'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-current flex items-center justify-center">
                    <Plus size={28} />
                  </div>
                  <span className="text-lg font-medium">Yeni Bölüm Ekle</span>
                </motion.button>
              )}
            </div>
          </SortableContext>
          
          {/* Drag Overlay */}
          <DragOverlay>
            {activeItem && activeItem.type === 'section' ? (
              <div className="opacity-90">
                <SectionCard
                  section={activeItem.data as Section}
                  editMode={true}
                />
              </div>
            ) : activeItem && activeItem.type === 'widget' ? (
              <div className="opacity-90 w-full max-w-[200px]">
                <WidgetCard
                  widget={activeItem.data as Widget}
                  editMode={true}
                  sectionColor={activeItem.sectionColor}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        
        {/* Empty State */}
        {sections.length === 0 && !editMode && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
              <LayoutGrid size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Boş</h2>
            <p className="text-gray-500 mb-6">Düzenleme modunu açarak bölümler ekleyin</p>
            <button
              onClick={() => setEditMode(true)}
              className="px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
            >
              Düzenlemeye Başla
            </button>
          </div>
        )}
      </main>
      
      {/* Add Section Dialog */}
      <AnimatePresence>
        {addSectionOpen && (
          <AddSectionDialog
            open={addSectionOpen}
            onClose={() => setAddSectionOpen(false)}
            onAdd={handleAddSection}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Exported Page
// ============================================

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}
