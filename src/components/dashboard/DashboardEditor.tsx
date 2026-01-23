'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardWidget, DashboardLayout, WidgetType, WIDGET_PALETTE } from '@/types/dashboard.types';
import { dashboardService } from '@/services/dashboard.service';

// Widget Palette Data
const WIDGET_PALETTE_DATA = [
  { type: 'SWITCH' as WidgetType, name: 'Anahtar', icon: '💡', description: 'Açma/Kapama', defaultSize: { w: 2, h: 2 } },
  { type: 'DIMMER' as WidgetType, name: 'Dimmer', icon: '🔆', description: 'Parlaklık', defaultSize: { w: 2, h: 2 } },
  { type: 'THERMOSTAT' as WidgetType, name: 'Termostat', icon: '🌡️', description: 'Sıcaklık', defaultSize: { w: 3, h: 3 } },
  { type: 'SENSOR' as WidgetType, name: 'Sensör', icon: '📊', description: 'Sensör değeri', defaultSize: { w: 2, h: 2 } },
  { type: 'SCENE' as WidgetType, name: 'Senaryo', icon: '🎬', description: 'Senaryo çalıştır', defaultSize: { w: 2, h: 1 } },
  { type: 'GAUGE' as WidgetType, name: 'Gösterge', icon: '🎯', description: 'Yüzde göstergesi', defaultSize: { w: 2, h: 2 } },
];

// Sortable Widget Item
const SortableWidgetItem = ({
  widget,
  onDelete,
  onEdit,
}: {
  widget: DashboardWidget;
  onDelete: (id: string) => void;
  onEdit: (widget: DashboardWidget) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getWidgetIcon = (type: WidgetType) => {
    const item = WIDGET_PALETTE_DATA.find(p => p.type === type);
    return item?.icon || '📦';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative bg-white rounded-xl border border-gray-200 p-4 shadow-sm',
        'hover:shadow-md transition-shadow',
        isDragging && 'opacity-50 z-50'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
      >
        <GripVertical size={16} className="text-gray-400" />
      </div>

      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          onClick={() => onEdit(widget)}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-500"
        >
          <Settings size={14} />
        </button>
        <button
          onClick={() => onDelete(widget.id)}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-red-500"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="mt-6 text-center">
        <span className="text-3xl">{getWidgetIcon(widget.type)}</span>
        <p className="mt-2 text-sm font-medium text-gray-700">
          {widget.config?.name || widget.type}
        </p>
        <p className="text-xs text-gray-500">
          {widget.entityId ? `Device: ${widget.entityId.slice(0, 8)}...` : 'No entity'}
        </p>
      </div>
    </div>
  );
};

// Widget Palette Panel
const WidgetPalette = ({
  onAddWidget,
}: {
  onAddWidget: (type: WidgetType) => void;
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Widget Ekle</h3>
      <div className="grid grid-cols-2 gap-2">
        {WIDGET_PALETTE_DATA.map((item) => (
          <button
            key={item.type}
            onClick={() => onAddWidget(item.type)}
            className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
          >
            <span className="text-xl">{item.icon}</span>
            <div>
              <p className="text-sm font-medium text-gray-700">{item.name}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Editor Component
export const DashboardEditor = () => {
  const [dashboard, setDashboard] = useState<DashboardLayout | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch dashboard
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await dashboardService.getDashboard();
        setDashboard(data);
        setWidgets(data.widgets.sort((a, b) => a.layout.mobile.order - b.layout.mobile.order));
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update mobile order
        return newItems.map((item, index) => ({
          ...item,
          layout: {
            ...item.layout,
            mobile: { ...item.layout.mobile, order: index },
          },
        }));
      });
      setHasChanges(true);
    }
  };

  // Add widget
  const handleAddWidget = async (type: WidgetType) => {
    if (!dashboard) return;

    const paletteItem = WIDGET_PALETTE_DATA.find(p => p.type === type);
    const newOrder = widgets.length;

    try {
      const newWidget = await dashboardService.addWidget({
        dashboardId: dashboard.id,
        type,
        config: { name: paletteItem?.name || type },
        layout: {
          web: { x: 0, y: 0, w: paletteItem?.defaultSize.w || 2, h: paletteItem?.defaultSize.h || 2 },
          mobile: { order: newOrder, visible: true },
        },
      });
      setWidgets([...widgets, newWidget]);
    } catch (error) {
      console.error('Failed to add widget:', error);
    }
  };

  // Delete widget
  const handleDeleteWidget = async (widgetId: string) => {
    try {
      await dashboardService.deleteWidget(widgetId);
      setWidgets(widgets.filter((w) => w.id !== widgetId));
    } catch (error) {
      console.error('Failed to delete widget:', error);
    }
  };

  // Edit widget (placeholder)
  const handleEditWidget = (widget: DashboardWidget) => {
    console.log('Edit widget:', widget);
    // TODO: Open edit modal
  };

  // Save layout changes
  const handleSaveLayout = async () => {
    if (!dashboard || !hasChanges) return;

    setSaving(true);
    try {
      await dashboardService.batchUpdateLayouts(dashboard.id, {
        widgets: widgets.map((w) => ({
          widgetId: w.id,
          layout: w.layout,
        })),
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save layout:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Editor</h1>
          <p className="text-sm text-gray-500">
            Widget'ları sürükleyerek sırayı değiştirebilirsiniz
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSaveLayout}
            disabled={saving}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-white',
              saving ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            )}
          >
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Widget Grid */}
        <div className="col-span-9">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-4 gap-4">
                {widgets.map((widget) => (
                  <SortableWidgetItem
                    key={widget.id}
                    widget={widget}
                    onDelete={handleDeleteWidget}
                    onEdit={handleEditWidget}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeId ? (
                <div className="bg-white rounded-xl border-2 border-blue-400 p-4 shadow-lg opacity-80">
                  <span className="text-2xl">📦</span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {widgets.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl">
              <Plus size={48} className="text-gray-300 mb-2" />
              <p className="text-gray-500">Henüz widget eklenmemiş</p>
              <p className="text-sm text-gray-400">Sağdaki panelden widget ekleyin</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-span-3">
          <WidgetPalette onAddWidget={handleAddWidget} />
        </div>
      </div>
    </div>
  );
};

export default DashboardEditor;
