'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardWidget } from '@/types/dashboard.types';

// ============================================
// Types
// ============================================

interface BentoGridItemProps {
  widget: DashboardWidget;
  editMode?: boolean;
  onToggle?: (widgetId: string, state: boolean) => void;
  onResize?: (widgetId: string, newSize: { w: number; h: number }) => void;
  onDelete?: (widgetId: string) => void;
}

// ============================================
// Widget Type Icons (emoji for now, replace with Lucide later)
// ============================================

const WIDGET_ICONS: Record<string, string> = {
  SWITCH: '💡',
  DIMMER: '🔆',
  THERMOSTAT: '🌡️',
  SENSOR: '📊',
  WEATHER: '☀️',
  SCENE: '🎬',
  CAMERA: '📹',
  BUTTON: '🔘',
  TILE: '📦',
  GAUGE: '🎯',
  AREA: '🏠',
};

// ============================================
// BentoGridItem Component
// ============================================

export function BentoGridItem({
  widget,
  editMode = false,
  onToggle,
  onResize,
  onDelete,
}: BentoGridItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: widget.id,
    disabled: !editMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Apply grid span from layout
    gridColumn: `span ${widget.layout.web.w}`,
    gridRow: `span ${widget.layout.web.h}`,
  };

  const icon = WIDGET_ICONS[widget.type] || '📦';

  // Determine size class for internal layout adaptation
  const isCompact = widget.layout.web.w === 1 && widget.layout.web.h === 1;
  const isWide = widget.layout.web.w >= 3;
  const isTall = widget.layout.web.h >= 2;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative rounded-2xl transition-all duration-200 group',
        'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700',
        'shadow-sm hover:shadow-md',
        isDragging && 'z-50 shadow-2xl scale-[1.02] opacity-80',
        editMode && 'cursor-grab active:cursor-grabbing ring-2 ring-primary/20'
      )}
    >
      {/* Edit Mode Controls */}
      {editMode && (
        <div className="absolute inset-0 z-10 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Drag Handle */}
          <div
            className="absolute top-2 left-2 p-1.5 rounded-lg bg-white/90 dark:bg-gray-700/90 shadow-md cursor-grab pointer-events-auto"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} className="text-gray-500" />
          </div>

          {/* Resize Handle */}
          <button
            onClick={() => {
              // Cycle through sizes: 1x1 -> 2x1 -> 2x2 -> 1x1
              const { w, h } = widget.layout.web;
              let newW = w, newH = h;
              if (w === 1 && h === 1) { newW = 2; newH = 1; }
              else if (w === 2 && h === 1) { newW = 2; newH = 2; }
              else { newW = 1; newH = 1; }
              onResize?.(widget.id, { w: newW, h: newH });
            }}
            className="absolute top-2 right-10 p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 shadow-md pointer-events-auto transition-colors"
          >
            <Maximize2 size={14} />
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(widget.id);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-md pointer-events-auto transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Widget Content */}
      <div className={cn(
        'h-full p-4 flex',
        isCompact ? 'flex-col items-center justify-center' : 'flex-col',
        isTall && !isCompact && 'justify-between'
      )}>
        {/* Icon + Name */}
        <div className={cn(
          'flex items-center gap-3',
          isCompact && 'flex-col gap-1'
        )}>
          <span className={cn(
            isCompact ? 'text-2xl' : 'text-3xl'
          )}>
            {icon}
          </span>
          <span className={cn(
            'font-semibold text-gray-800 dark:text-white',
            isCompact ? 'text-xs text-center' : 'text-sm',
            isWide && 'text-base'
          )}>
            {widget.config?.name || widget.type}
          </span>
        </div>

        {/* Extended content for larger widgets */}
        {!isCompact && (
          <div className="mt-auto">
            {/* Value/State display */}
            {widget.entityData && 'attributes' in widget.entityData && (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {widget.entityData.attributes?.value ?? '--'}
                </span>
                {widget.config && 'unit' in widget.config && (
                  <span className="text-sm text-gray-500">
                    {widget.config.unit}
                  </span>
                )}
              </div>
            )}

            {/* Toggle for SWITCH type */}
            {widget.type === 'SWITCH' && !editMode && (
              <button
                onClick={() => {
                  const currentState = widget.entityData && 'attributes' in widget.entityData
                    ? widget.entityData.attributes?.state === 'on'
                    : false;
                  onToggle?.(widget.id, !currentState);
                }}
                className={cn(
                  'mt-2 px-4 py-2 rounded-xl font-medium transition-colors',
                  'bg-primary/10 text-primary hover:bg-primary/20'
                )}
              >
                Toggle
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BentoGridItem;
