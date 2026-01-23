'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GripVertical, Trash2, Plus, Settings, ChevronDown, ChevronUp,
  Sofa, BedDouble, UtensilsCrossed, Bath, Car, TreeDeciduous,
  Briefcase, Baby, Dumbbell, Tv, Gamepad2, BookOpen, ShowerHead, DoorOpen,
  Pencil, MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetCard } from './WidgetCard';
import type { Section, Widget } from './types';

// ============================================
// Section Icons
// ============================================

const SECTION_ICONS: Record<string, React.ReactNode> = {
  living_room: <Sofa size={20} />,
  bedroom: <BedDouble size={20} />,
  kitchen: <UtensilsCrossed size={20} />,
  bathroom: <Bath size={20} />,
  garage: <Car size={20} />,
  garden: <TreeDeciduous size={20} />,
  office: <Briefcase size={20} />,
  kids_room: <Baby size={20} />,
  gym: <Dumbbell size={20} />,
  media_room: <Tv size={20} />,
  game_room: <Gamepad2 size={20} />,
  library: <BookOpen size={20} />,
  laundry: <ShowerHead size={20} />,
  entrance: <DoorOpen size={20} />,
  outdoor: <TreeDeciduous size={20} />,
  study: <Briefcase size={20} />,
  default: <DoorOpen size={20} />,
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
  
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white rounded-3xl shadow-sm',
        'border border-gray-100',
        'overflow-hidden',
        isDragging && 'z-50 shadow-2xl opacity-95'
      )}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Section Header */}
      <div 
        className={cn(
          'flex items-center justify-between px-5 py-4',
          'border-b border-gray-50'
        )}
      >
        <div className="flex items-center gap-3">
          {/* Drag Handle (Edit Mode) */}
          {editMode && (
            <div 
              className="p-1.5 -ml-1 rounded-lg hover:bg-gray-100 cursor-grab active:cursor-grabbing transition-colors"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={18} className="text-gray-400" />
            </div>
          )}
          
          {/* Section Icon */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: section.color }}
          >
            {SectionIcon}
          </div>
          
          {/* Section Title */}
          <div>
            <h3 className="font-semibold text-gray-900">{section.title}</h3>
            <p className="text-xs text-gray-500">
              {section.widgets.length} cihaz
            </p>
          </div>
        </div>
        
        {/* Section Actions */}
        <div className="flex items-center gap-1">
          {editMode ? (
            <>
              <button
                onClick={onEdit}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={onDelete}
                className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <MoreVertical size={18} />
              </button>
            </>
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
            <div className="p-4">
              <SortableContext 
                items={section.widgets.map(w => w.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-2 gap-3">
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
                        'flex flex-col items-center justify-center gap-2',
                        'min-h-[100px] rounded-2xl',
                        'border-2 border-dashed border-gray-200',
                        'hover:border-gray-300 hover:bg-gray-50',
                        'text-gray-400 hover:text-gray-500',
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
                </div>
              </SortableContext>
              
              {/* Empty State */}
              {section.widgets.length === 0 && !editMode && (
                <div className="text-center py-8 text-gray-400">
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
