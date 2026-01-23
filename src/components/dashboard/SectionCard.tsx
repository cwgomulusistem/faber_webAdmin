'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { 
  SortableContext, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GripVertical, Trash2, Plus, ChevronDown, ChevronUp,
  Sofa, BedDouble, UtensilsCrossed, Bath, Car, TreeDeciduous,
  Briefcase, Baby, Tv, BookOpen, DoorOpen, Monitor,
  Pencil, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetCard } from './WidgetCard';
import type { Section, Widget } from './types';

// ============================================
// Section Icons
// ============================================

const SECTION_ICONS: Record<string, React.ReactNode> = {
  living_room: <Sofa size={24} />,
  bedroom: <BedDouble size={24} />,
  kitchen: <UtensilsCrossed size={24} />,
  bathroom: <Bath size={24} />,
  garage: <Car size={24} />,
  garden: <TreeDeciduous size={24} />,
  office: <Briefcase size={24} />,
  kids_room: <Baby size={24} />,
  media_room: <Tv size={24} />,
  library: <BookOpen size={24} />,
  entrance: <DoorOpen size={24} />,
  outdoor: <TreeDeciduous size={24} />,
  study: <Monitor size={24} />,
  default: <DoorOpen size={24} />,
};

// Color mapping for section icons background
const SECTION_COLORS: Record<string, string> = {
  '#6366f1': 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  '#22c55e': 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  '#f59e0b': 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  '#ec4899': 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
  '#8b5cf6': 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  '#06b6d4': 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
};

// ============================================
// Section Card Props
// ============================================

interface SectionCardProps {
  section: Section;
  editMode: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onAddWidget?: () => void;
  onDeleteWidget?: (widgetId: string) => void;
  onWidgetToggle?: (widgetId: string, state: boolean) => void;
  onWidgetSliderChange?: (widgetId: string, value: number) => void;
  onWidgetClick?: (widget: Widget) => void;
}

// ============================================
// Section Card Component
// ============================================

export function SectionCard({
  section,
  editMode,
  isCollapsed = false,
  onToggleCollapse,
  onDelete,
  onEdit,
  onAddWidget,
  onDeleteWidget,
  onWidgetToggle,
  onWidgetSliderChange,
  onWidgetClick,
}: SectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: section.id,
    disabled: !editMode,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const SectionIcon = SECTION_ICONS[section.icon] || SECTION_ICONS.default;
  const colorClass = SECTION_COLORS[section.color] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
  
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-soft',
        'border border-gray-100 dark:border-gray-700/50',
        'flex flex-col gap-5 h-full',
        isDragging && 'z-50 shadow-2xl opacity-95'
      )}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-700 pb-3">
        <div className="flex items-center gap-3">
          {/* Drag Handle (Edit Mode) */}
          {editMode && (
            <div 
              className="p-1.5 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-grab active:cursor-grabbing transition-colors"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={18} className="text-gray-400" />
            </div>
          )}
          
          {/* Section Icon */}
          <div className={cn('p-2.5 rounded-xl', colorClass)}>
            {SectionIcon}
          </div>
          
          {/* Section Title */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{section.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {section.widgets.length} Active Devices
            </p>
          </div>
        </div>
        
        {/* Section Actions */}
        <div className="flex items-center gap-1">
          {editMode ? (
            <>
              <button
                onClick={onEdit}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={onDelete}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <button 
              onClick={onToggleCollapse}
              className="text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 p-1.5 rounded-lg transition"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Widgets Grid */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-4">
              <SortableContext 
                items={section.widgets.map(w => w.id)}
                strategy={rectSortingStrategy}
              >
                {section.widgets.map((widget) => (
                  <WidgetCard
                    key={widget.id}
                    widget={widget}
                    editMode={editMode}
                    sectionColor={section.color}
                    onDelete={() => onDeleteWidget?.(widget.id)}
                    onToggle={onWidgetToggle}
                    onSliderChange={onWidgetSliderChange}
                    onClick={() => onWidgetClick?.(widget)}
                  />
                ))}
                
                {/* Add Widget Button */}
                {editMode && (
                  <motion.button
                    onClick={onAddWidget}
                    className={cn(
                      'w-full flex flex-col items-center justify-center gap-2',
                      'min-h-[100px] rounded-2xl',
                      'border-2 border-dashed border-gray-200 dark:border-gray-600',
                      'hover:border-primary hover:text-primary',
                      'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                      'transition-all'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center">
                      <Plus size={20} />
                    </div>
                    <span className="text-sm font-medium">Widget Ekle</span>
                  </motion.button>
                )}
              </SortableContext>
              
              {/* Empty State */}
              {section.widgets.length === 0 && !editMode && (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                  <p>Bu bölümde henüz widget yok</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default SectionCard;
