'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { 
  GripVertical, Trash2, 
  Lightbulb, Power, Thermometer, Fan, Lock, Camera, 
  Gauge, Play, Sun, Droplets, Wind, Home, Tv
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Widget } from './types';

// ============================================
// Icon Mapping
// ============================================

const WIDGET_ICONS: Record<string, React.ReactNode> = {
  light: <Lightbulb size={22} />,
  switch: <Power size={22} />,
  climate: <Thermometer size={22} />,
  fan: <Fan size={22} />,
  lock: <Lock size={22} />,
  camera: <Camera size={22} />,
  sensor: <Gauge size={22} />,
  scene: <Home size={22} />,
  media: <Tv size={22} />,
  temperature: <Thermometer size={22} />,
  humidity: <Droplets size={22} />,
  button: <Power size={22} />,
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
    <button
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative w-12 h-7 rounded-full transition-all duration-300',
        checked ? 'bg-opacity-100' : 'bg-gray-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      style={{ backgroundColor: checked ? (color || '#03a9f4') : undefined }}
    >
      <motion.span
        className="absolute w-5 h-5 bg-white rounded-full shadow-md top-1"
        animate={{ left: checked ? 26 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
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
    <div className="w-full">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color || '#03a9f4'} 0%, ${color || '#03a9f4'} ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`,
        }}
      />
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
  const activeColor = widget.color || sectionColor || '#03a9f4';
  
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative bg-white rounded-2xl shadow-sm',
        'border border-gray-100',
        'transition-all duration-200',
        isDragging && 'z-50 shadow-2xl scale-105 opacity-90',
        editMode && 'cursor-grab active:cursor-grabbing',
        !editMode && onClick && 'cursor-pointer hover:shadow-md'
      )}
      animate={editMode ? { 
        scale: [1, 1.01, 1],
      } : {}}
      transition={editMode ? { 
        repeat: Infinity, 
        duration: 2,
        ease: 'easeInOut'
      } : {}}
      onClick={!editMode ? onClick : undefined}
    >
      {/* Edit Mode Overlay */}
      {editMode && (
        <div className="absolute inset-0 z-10 rounded-2xl pointer-events-none">
          {/* Drag Handle */}
          <div 
            className="absolute top-2 left-2 p-1.5 rounded-lg bg-gray-100/80 cursor-grab pointer-events-auto"
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
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-100/80 text-red-500 hover:bg-red-200 pointer-events-auto transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
      
      <div className="p-4">
        {/* Toggle Widget */}
        {widget.type === 'toggle' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center transition-colors',
                  isOn ? 'text-white' : 'bg-gray-100 text-gray-400'
                )}
                style={isOn ? { backgroundColor: activeColor } : undefined}
              >
                {icon}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{widget.name}</h4>
                <p className={cn(
                  'text-sm',
                  isOn ? 'text-gray-600' : 'text-gray-400'
                )}>
                  {isOn ? 'Açık' : 'Kapalı'}
                </p>
              </div>
            </div>
            <ToggleSwitch 
              checked={isOn} 
              onChange={handleToggle}
              disabled={editMode}
              color={activeColor}
            />
          </div>
        )}
        
        {/* Slider Widget */}
        {widget.type === 'slider' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center transition-colors',
                  sliderValue > 0 ? 'text-white' : 'bg-gray-100 text-gray-400'
                )}
                style={sliderValue > 0 ? { backgroundColor: activeColor } : undefined}
              >
                {icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{widget.name}</h4>
                <p className="text-sm text-gray-500">{sliderValue}%</p>
              </div>
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
          <div className="flex items-center gap-3">
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center bg-gray-100"
              style={{ color: activeColor }}
            >
              {icon}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{widget.name}</h4>
              <p className="text-2xl font-light text-gray-700">
                {widget.value}{widget.unit}
              </p>
            </div>
          </div>
        )}
        
        {/* Climate Widget */}
        {widget.type === 'climate' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: activeColor }}
                >
                  <Thermometer size={22} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{widget.name}</h4>
                  <p className="text-sm text-gray-500">{widget.state || 'Kapalı'}</p>
                </div>
              </div>
              <span className="text-2xl font-light text-gray-700">
                {widget.value}°
              </span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
              <button className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100">
                −
              </button>
              <span className="text-lg font-medium text-gray-700">
                {widget.value}°C
              </span>
              <button className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100">
                +
              </button>
            </div>
          </div>
        )}
        
        {/* Scene Widget */}
        {widget.type === 'scene' && (
          <button 
            className={cn(
              'w-full flex items-center gap-3 p-1 rounded-xl',
              'hover:bg-gray-50 transition-colors',
              editMode && 'pointer-events-none'
            )}
          >
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: activeColor }}
            >
              {icon}
            </div>
            <div className="text-left">
              <h4 className="font-medium text-gray-900">{widget.name}</h4>
              <p className="text-sm text-gray-500">Sahne</p>
            </div>
          </button>
        )}
        
        {/* Button Widget */}
        {widget.type === 'button' && (
          <button 
            className={cn(
              'w-full flex flex-col items-center gap-2 py-2',
              'hover:bg-gray-50 rounded-xl transition-colors',
              editMode && 'pointer-events-none'
            )}
          >
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: activeColor }}
            >
              {icon}
            </div>
            <span className="font-medium text-gray-900">{widget.name}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default WidgetCard;
