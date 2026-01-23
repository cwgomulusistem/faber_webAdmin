'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { 
  GripVertical, Trash2, 
  Lightbulb, Power, Thermometer, Fan, Lock, Camera, 
  Gauge, Sun, Droplets, Home, Tv, SunMedium, Leaf, 
  Minus, Plus, Snowflake, MoonStar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Widget } from './types';

// ============================================
// Icon Mapping
// ============================================

const WIDGET_ICONS: Record<string, React.ReactNode> = {
  light: <Lightbulb size={20} />,
  switch: <Power size={20} />,
  climate: <Thermometer size={20} />,
  fan: <Fan size={20} />,
  lock: <Lock size={20} />,
  camera: <Camera size={20} />,
  sensor: <Gauge size={20} />,
  scene: <Home size={20} />,
  media: <Tv size={20} />,
  temperature: <Thermometer size={20} />,
  humidity: <Droplets size={20} />,
  button: <Power size={20} />,
};

// ============================================
// Toggle Switch Component
// ============================================

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  color?: string;
}

function ToggleSwitch({ checked, onChange, disabled, color }: ToggleSwitchProps) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={checked}
        disabled={disabled}
        onChange={() => !disabled && onChange(!checked)}
      />
      <div 
        className={cn(
          "w-9 h-5 rounded-full peer transition-colors",
          "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
          "after:bg-white after:border-gray-300 after:border after:rounded-full",
          "after:h-4 after:w-4 after:transition-all",
          "peer-checked:after:translate-x-full peer-checked:after:border-white",
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{ backgroundColor: checked ? (color || '#3b82f6') : '#e5e7eb' }}
      />
    </label>
  );
}

// ============================================
// Slider Component
// ============================================

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  color?: string;
}

function Slider({ value, onChange, min = 0, max = 100, color }: SliderProps) {
  return (
    <div className="flex items-center gap-3">
      <SunMedium className="w-4 h-4 text-gray-400" />
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider-blue"
      />
      <Sun className="w-4 h-4 text-gray-400" />
    </div>
  );
}

// ============================================
// Widget Card Props
// ============================================

interface WidgetCardProps {
  widget: Widget;
  editMode: boolean;
  sectionColor?: string;
  onDelete?: () => void;
  onToggle?: (id: string, state: boolean) => void;
  onSliderChange?: (id: string, value: number) => void;
  onClick?: () => void;
}

// ============================================
// Widget Card Component
// ============================================

export function WidgetCard({
  widget,
  editMode,
  sectionColor,
  onDelete,
  onToggle,
  onSliderChange,
  onClick,
}: WidgetCardProps) {
  const [isOn, setIsOn] = useState(widget.state === 'on');
  const [sliderValue, setSliderValue] = useState(widget.value || 0);
  
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
  };
  
  const handleToggle = (checked: boolean) => {
    setIsOn(checked);
    onToggle?.(widget.id, checked);
  };
  
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    onSliderChange?.(widget.id, value);
  };
  
  const icon = WIDGET_ICONS[widget.icon || widget.type] || WIDGET_ICONS.switch;
  const activeColor = widget.color || sectionColor || '#3b82f6';
  
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative rounded-xl transition-all duration-200 group',
        isDragging && 'z-50 shadow-2xl scale-105 opacity-90',
        editMode && 'cursor-grab active:cursor-grabbing',
      )}
    >
      {/* Edit Mode Overlay - Show on hover */}
      {editMode && (
        <div className="absolute inset-0 z-10 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Drag Handle */}
          <div 
            className="absolute top-2 left-2 p-1.5 rounded-lg bg-white/90 dark:bg-gray-700/90 shadow-md cursor-grab pointer-events-auto"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} className="text-gray-500" />
          </div>
          
          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-md pointer-events-auto transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
      
      {widget.type === 'toggle' && (
        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "bg-white dark:bg-gray-600 p-1.5 rounded-lg shadow-sm",
                isOn ? 'text-blue-500' : 'text-gray-400'
              )}>
                {icon}
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{widget.name}</span>
            </div>
            <ToggleSwitch 
              checked={isOn} 
              onChange={handleToggle}
              disabled={editMode}
              color={activeColor}
            />
          </div>
        </div>
      )}
      
      {/* Slider Widget */}
      {widget.type === 'slider' && (
        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{widget.name}</span>
            <span className="text-xs font-mono text-primary">{sliderValue}%</span>
          </div>
          <Slider 
            value={sliderValue} 
            onChange={handleSliderChange}
            color={activeColor}
          />
        </div>
      )}
      
      {/* Sensor Widget */}
      {widget.type === 'sensor' && (
        <div className="bg-white dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-blue-500/10"></div>
          <div className="flex flex-col z-10">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{widget.name}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{widget.value}</span>
              <span className="text-lg text-gray-500">{widget.unit}</span>
            </div>
            <span className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <Leaf className="w-3 h-3" /> Eco Mode
            </span>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-gray-100 dark:text-gray-600" cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6"></circle>
              <circle className="text-blue-500" cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="60" strokeLinecap="round" strokeWidth="6"></circle>
            </svg>
            <Thermometer className="w-6 h-6 text-gray-400 absolute" />
          </div>
        </div>
      )}
      
      {/* Climate Widget */}
      {widget.type === 'climate' && (
        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl flex items-center gap-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-gray-200 dark:text-gray-600" cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8"></circle>
              <circle className="text-orange-500" cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeDasharray="226" strokeDashoffset="80" strokeLinecap="round" strokeWidth="8"></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xl font-bold text-gray-900 dark:text-white">{widget.value}°</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{widget.name}</span>
              <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full font-medium">{widget.state || 'Heating'}</span>
            </div>
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
              <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-md transition">
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold">{widget.value}.0</span>
              <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-md transition">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Scene Widget */}
      {widget.type === 'scene' && (
        <div 
          onClick={!editMode ? onClick : undefined}
          className={cn(
            'bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl',
            'flex items-center justify-between text-white shadow-lg cursor-pointer',
            'transform hover:scale-[1.02] transition-transform'
          )}
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <MoonStar className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h4 className="font-bold">{widget.name}</h4>
              <p className="text-xs text-indigo-100">Lights 40%, Ambient ON</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default WidgetCard;
