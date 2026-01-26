'use client';

import React, { useState, useCallback } from 'react';
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
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import type { DashboardWidget } from '@/types/dashboard.types';
import { BentoGridItem } from './BentoGridItem';

// ============================================
// Types
// ============================================

interface BentoGridProps {
  widgets: DashboardWidget[];
  editMode?: boolean;
  isLoading?: boolean;
  onWidgetsReorder?: (widgets: DashboardWidget[]) => void;
  onWidgetToggle?: (widgetId: string, state: boolean) => void;
  onWidgetResize?: (widgetId: string, newSize: { w: number; h: number }) => void;
  onWidgetDelete?: (widgetId: string) => void;
}

// ============================================
// Skeleton Grid Component
// ============================================

function SkeletonGrid({ count = 6 }: { count?: number }) {
  const skeletonSizes = [
    { w: 2, h: 2 },
    { w: 1, h: 1 },
    { w: 2, h: 1 },
    { w: 1, h: 1 },
    { w: 2, h: 2 },
    { w: 2, h: 1 },
  ];

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const size = skeletonSizes[i % skeletonSizes.length];
        return (
          <div
            key={`skeleton-${i}`}
            className="bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"
            style={{
              gridColumn: `span ${size.w}`,
              gridRow: `span ${size.h}`,
              minHeight: size.h * 100 + 'px',
            }}
          />
        );
      })}
    </>
  );
}

// ============================================
// Main Bento Grid Component
// ============================================

export function BentoGrid({
  widgets,
  editMode = false,
  isLoading = false,
  onWidgetsReorder,
  onWidgetToggle,
  onWidgetResize,
  onWidgetDelete,
}: BentoGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    })
  );

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // Handle drag end - reorder widgets
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (over && active.id !== over.id) {
        const oldIndex = widgets.findIndex((w) => w.id === active.id);
        const newIndex = widgets.findIndex((w) => w.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex).map(
            (widget, index) => ({
              ...widget,
              layout: {
                ...widget.layout,
                mobile: { ...widget.layout.mobile, order: index },
              },
            })
          );
          onWidgetsReorder?.(reorderedWidgets);
        }
      }
    },
    [widgets, onWidgetsReorder]
  );

  // Get active widget for overlay
  const activeWidget = activeId
    ? widgets.find((w) => w.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={widgets.map((w) => w.id)}
        strategy={rectSortingStrategy}
        disabled={!editMode}
      >
        <div
          className={cn(
            'grid gap-4 auto-rows-[100px]',
            // Responsive grid columns
            'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'
          )}
        >
          {isLoading ? (
            <SkeletonGrid count={6} />
          ) : (
            widgets.map((widget) => (
              <BentoGridItem
                key={widget.id}
                widget={widget}
                editMode={editMode}
                onToggle={onWidgetToggle}
                onResize={onWidgetResize}
                onDelete={onWidgetDelete}
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Drag Overlay - shows dragged item */}
      <DragOverlay>
        {activeWidget ? (
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-primary shadow-2xl opacity-90 p-4"
            style={{
              width: activeWidget.layout.web.w * 100,
              height: activeWidget.layout.web.h * 100,
            }}
          >
            <div className="flex items-center justify-center h-full">
              <span className="text-xl font-semibold text-gray-600">
                {activeWidget.config?.name || activeWidget.type}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default BentoGrid;
