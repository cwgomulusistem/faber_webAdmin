'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Check, Plus, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BentoGrid } from '@/components/dashboard/BentoGrid';
import type { DashboardWidget, WidgetType, WidgetLayout } from '@/types/dashboard.types';
import api from '@/services/api.service';

// ============================================
// Mock Data Generator (for demo)
// ============================================

function generateMockWidgets(): DashboardWidget[] {
  const types: WidgetType[] = ['SWITCH', 'DIMMER', 'THERMOSTAT', 'SENSOR', 'SCENE', 'GAUGE'];
  const names = ['Salon Işık', 'Yatak Odası', 'Klima', 'Sıcaklık', 'Film Modu', 'Enerji'];
  const sizes: { w: number; h: number }[] = [
    { w: 1, h: 1 },
    { w: 2, h: 1 },
    { w: 2, h: 2 },
    { w: 1, h: 1 },
    { w: 2, h: 1 },
    { w: 2, h: 2 },
  ];

  return types.map((type, i) => ({
    id: `widget-${i + 1}`,
    dashboardId: 'demo-dashboard',
    type,
    entityId: `device-${i + 1}`,
    entityType: 'device' as const,
    config: { name: names[i] },
    layout: {
      web: { x: 0, y: 0, ...sizes[i] },
      mobile: { order: i, visible: true },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

// ============================================
// Bento Dashboard Demo Page
// ============================================

export default function BentoDashboardPage() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load widgets (mock for now)
  useEffect(() => {
    const timer = setTimeout(() => {
      setWidgets(generateMockWidgets());
      setIsLoading(false);
    }, 800); // Simulate loading delay to show skeleton

    return () => clearTimeout(timer);
  }, []);

  // Handle widget reorder
  const handleWidgetsReorder = useCallback((reorderedWidgets: DashboardWidget[]) => {
    setWidgets(reorderedWidgets);
    // TODO: Save to backend
    console.log('Widgets reordered:', reorderedWidgets.map(w => w.id));
  }, []);

  // Handle widget toggle
  const handleWidgetToggle = useCallback(async (widgetId: string, state: boolean) => {
    console.log(`Toggle widget ${widgetId} to ${state ? 'ON' : 'OFF'}`);
    // TODO: Implement actual API call with Optimistic UI
    // For now, just log
  }, []);

  // Handle widget resize
  const handleWidgetResize = useCallback((widgetId: string, newSize: { w: number; h: number }) => {
    setWidgets(prev => prev.map(w => {
      if (w.id === widgetId) {
        return {
          ...w,
          layout: {
            ...w.layout,
            web: { ...w.layout.web, ...newSize },
          },
        };
      }
      return w;
    }));
    console.log(`Resize widget ${widgetId} to ${newSize.w}x${newSize.h}`);
  }, []);

  // Handle widget delete
  const handleWidgetDelete = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    console.log(`Delete widget ${widgetId}`);
  }, []);

  // Add new widget (demo)
  const handleAddWidget = useCallback(() => {
    const types: WidgetType[] = ['SWITCH', 'SENSOR', 'GAUGE'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      dashboardId: 'demo-dashboard',
      type: randomType,
      entityType: 'device',
      config: { name: `Yeni ${randomType}` },
      layout: {
        web: { x: 0, y: 0, w: 2, h: 2 },
        mobile: { order: widgets.length, visible: true },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWidgets(prev => [...prev, newWidget]);
  }, [widgets.length]);

  // Reload data
  const handleReload = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setWidgets(generateMockWidgets());
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Bento Grid Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Yeni nesil widget sistemi • {widgets.length} widget
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReload}
            className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
            title="Yenile"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>

          {editMode ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddWidget}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition"
              >
                <Plus size={18} />
                <span>Widget Ekle</span>
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 font-medium shadow-lg shadow-blue-500/25 transition"
              >
                <Check size={18} />
                <span>Bitti</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-lg"
            >
              <Pencil size={16} />
              <span className="font-semibold">Düzenle</span>
            </button>
          )}
        </div>
      </header>

      {/* Edit Mode Banner */}
      {editMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 px-8 py-3">
          <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
            <Pencil size={18} />
            <span className="font-medium">Düzenleme Modu</span>
            <span className="text-blue-600 dark:text-blue-400 text-sm">
              • Widget'ları sürükleyin, boyutlandırın veya silin
            </span>
          </div>
        </div>
      )}

      {/* Main Content - Bento Grid */}
      <main className="flex-1 overflow-y-auto p-8">
        <BentoGrid
          widgets={widgets}
          editMode={editMode}
          isLoading={isLoading}
          onWidgetsReorder={handleWidgetsReorder}
          onWidgetToggle={handleWidgetToggle}
          onWidgetResize={handleWidgetResize}
          onWidgetDelete={handleWidgetDelete}
        />
      </main>
    </div>
  );
}
