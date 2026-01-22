'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// Slider Types
// ============================================

export interface HaSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

// ============================================
// Round Slider Types
// ============================================

export interface HaRoundSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  color?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

// ============================================
// Size Configurations
// ============================================

const SIZE_CONFIG = {
  sm: { height: 4, thumb: 16 },
  md: { height: 6, thumb: 20 },
  lg: { height: 8, thumb: 24 },
};

// ============================================
// HaSlider Component (Linear)
// ============================================

export function HaSlider({
  value,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  onChange,
  onChangeEnd,
  color = 'var(--primary-color)',
  size = 'md',
  className,
  showValue = false,
  formatValue,
}: HaSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const trackRef = useRef<HTMLDivElement>(null);
  const config = SIZE_CONFIG[size];
  
  // Sync internal value with prop
  useEffect(() => {
    if (!isDragging) {
      setInternalValue(value);
    }
  }, [value, isDragging]);
  
  const percentage = ((internalValue - min) / (max - min)) * 100;
  
  const calculateValue = useCallback((clientX: number) => {
    if (!trackRef.current) return internalValue;
    
    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.min(Math.max(steppedValue, min), max);
  }, [min, max, step, internalValue]);
  
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const newValue = calculateValue(e.clientX);
    setInternalValue(newValue);
    onChange?.(newValue);
    
    const handlePointerMove = (e: PointerEvent) => {
      const newValue = calculateValue(e.clientX);
      setInternalValue(newValue);
      onChange?.(newValue);
    };
    
    const handlePointerUp = (e: PointerEvent) => {
      setIsDragging(false);
      const finalValue = calculateValue(e.clientX);
      onChangeEnd?.(finalValue);
      
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
    
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  }, [disabled, calculateValue, onChange, onChangeEnd]);
  
  const displayValue = formatValue ? formatValue(internalValue) : Math.round(internalValue);
  
  return (
    <div className={cn('ha-slider relative', className)}>
      {showValue && (
        <div className="text-center mb-2 text-[var(--primary-text-color)] font-medium">
          {displayValue}
        </div>
      )}
      
      <div
        ref={trackRef}
        className={cn(
          'relative rounded-full cursor-pointer touch-none',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{ height: config.height }}
        onPointerDown={handlePointerDown}
      >
        {/* Track background */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: 'var(--slider-track-color, #e0e0e0)' }}
        />
        
        {/* Track fill */}
        <div 
          className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-75"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
        
        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full',
            'shadow-md transition-transform duration-75',
            isDragging && 'scale-125',
            !disabled && 'hover:scale-110'
          )}
          style={{
            left: `${percentage}%`,
            width: config.thumb,
            height: config.thumb,
            backgroundColor: color,
            border: '2px solid white',
          }}
        />
      </div>
    </div>
  );
}

// ============================================
// Helper Functions for Round Slider
// ============================================

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function cartesianToAngle(
  centerX: number,
  centerY: number,
  x: number,
  y: number
) {
  const dx = x - centerX;
  const dy = y - centerY;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  if (angle < 0) angle += 360;
  return angle;
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}

// ============================================
// HaRoundSlider Component
// ============================================

export function HaRoundSlider({
  value,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  onChange,
  onChangeEnd,
  color = 'var(--primary-color)',
  size = 200,
  strokeWidth = 20,
  className,
}: HaRoundSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  
  // Arc configuration (270 degree arc)
  const startAngle = 135;
  const endAngle = 405; // 135 + 270
  const totalAngle = 270;
  
  // Sync internal value with prop
  useEffect(() => {
    if (!isDragging) {
      setInternalValue(value);
    }
  }, [value, isDragging]);
  
  const percentage = (internalValue - min) / (max - min);
  const valueAngle = startAngle + (totalAngle * percentage);
  
  const backgroundArc = describeArc(center, center, radius, startAngle, endAngle);
  const valueArc = describeArc(center, center, radius, startAngle, valueAngle);
  const thumbPosition = polarToCartesian(center, center, radius, valueAngle);
  
  const calculateValue = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return internalValue;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    let angle = cartesianToAngle(center, center, x, y);
    
    // Normalize angle to our arc range
    if (angle < startAngle) angle += 360;
    if (angle > endAngle) {
      // Determine which end is closer
      const distToStart = Math.abs(angle - startAngle);
      const distToEnd = Math.abs(angle - endAngle);
      angle = distToStart < distToEnd ? startAngle : endAngle;
    }
    
    const percentage = (angle - startAngle) / totalAngle;
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.min(Math.max(steppedValue, min), max);
  }, [min, max, step, center, internalValue]);
  
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const newValue = calculateValue(e.clientX, e.clientY);
    setInternalValue(newValue);
    onChange?.(newValue);
    
    const handlePointerMove = (e: PointerEvent) => {
      const newValue = calculateValue(e.clientX, e.clientY);
      setInternalValue(newValue);
      onChange?.(newValue);
    };
    
    const handlePointerUp = (e: PointerEvent) => {
      setIsDragging(false);
      const finalValue = calculateValue(e.clientX, e.clientY);
      onChangeEnd?.(finalValue);
      
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
    
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  }, [disabled, calculateValue, onChange, onChangeEnd]);
  
  return (
    <div className={cn('ha-round-slider relative inline-block', className)}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn(
          'cursor-pointer touch-none',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onPointerDown={handlePointerDown}
      >
        {/* Background track */}
        <path
          d={backgroundArc}
          fill="none"
          stroke="var(--slider-track-color, #e0e0e0)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Value track */}
        <path
          d={valueArc}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ transition: isDragging ? 'none' : 'all 0.1s ease-out' }}
        />
        
        {/* Thumb */}
        <circle
          cx={thumbPosition.x}
          cy={thumbPosition.y}
          r={strokeWidth / 2 + 4}
          fill={color}
          stroke="white"
          strokeWidth={3}
          className={cn(
            'transition-transform',
            isDragging && 'scale-110'
          )}
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
        />
      </svg>
      
      {/* Center content area */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ 
          padding: strokeWidth + 20,
        }}
      >
        <div className="text-center">
          <span 
            className="text-[2.5rem] font-light"
            style={{ color: 'var(--primary-text-color)' }}
          >
            {Math.round(internalValue)}
          </span>
          <span 
            className="text-xl"
            style={{ color: 'var(--secondary-text-color)' }}
          >
            %
          </span>
        </div>
      </div>
    </div>
  );
}

export default HaSlider;
