'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// Gauge Types
// ============================================

export interface GaugeLevel {
  level: number;
  stroke: string;
  label?: string;
}

export interface HaGaugeProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  levels?: GaugeLevel[];
  needle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  formatOptions?: Intl.NumberFormatOptions;
  locale?: string;
}

// ============================================
// Severity Colors
// ============================================

export const severityColors = {
  green: 'var(--success-color, #43a047)',
  yellow: 'var(--warning-color, #ff9800)',
  red: 'var(--error-color, #db4437)',
  normal: 'var(--info-color, #039be5)',
};

// ============================================
// Helper Functions
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
// Size Configurations
// ============================================

const SIZE_CONFIG = {
  sm: { width: 120, strokeWidth: 8, fontSize: '1rem' },
  md: { width: 180, strokeWidth: 12, fontSize: '1.5rem' },
  lg: { width: 240, strokeWidth: 16, fontSize: '2rem' },
};

// ============================================
// HaGauge Component
// ============================================

export function HaGauge({
  value,
  min = 0,
  max = 100,
  label,
  levels,
  needle = false,
  size = 'md',
  className,
  formatOptions,
  locale = 'en-US',
}: HaGaugeProps) {
  const config = SIZE_CONFIG[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const center = config.width / 2;
  
  // Arc angles (180 degree arc)
  const startAngle = -135;
  const endAngle = 135;
  const totalAngle = endAngle - startAngle;
  
  // Normalize value
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = (clampedValue - min) / (max - min);
  const valueAngle = startAngle + (totalAngle * percentage);
  
  // Format value
  const formattedValue = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    ...formatOptions,
  }).format(clampedValue);
  
  // Compute color based on levels or default gradient
  const gaugeColor = useMemo(() => {
    if (levels && levels.length > 0) {
      const sortedLevels = [...levels].sort((a, b) => a.level - b.level);
      for (let i = sortedLevels.length - 1; i >= 0; i--) {
        if (clampedValue >= sortedLevels[i].level) {
          return sortedLevels[i].stroke;
        }
      }
      return sortedLevels[0]?.stroke || severityColors.normal;
    }
    
    // Default severity based on percentage
    if (percentage < 0.33) return severityColors.green;
    if (percentage < 0.66) return severityColors.yellow;
    return severityColors.red;
  }, [clampedValue, levels, percentage]);
  
  // Background arc
  const backgroundArc = describeArc(center, center, radius, startAngle, endAngle);
  
  // Value arc (for non-needle mode)
  const valueArc = describeArc(center, center, radius, startAngle, valueAngle);
  
  // Needle calculation
  const needlePoint = polarToCartesian(center, center, radius - 10, valueAngle);
  
  return (
    <div className={cn('ha-gauge relative inline-flex flex-col items-center', className)}>
      <svg
        viewBox={`0 0 ${config.width} ${config.width * 0.75}`}
        width={config.width}
        height={config.width * 0.75}
      >
        {/* Background track */}
        <path
          d={backgroundArc}
          fill="none"
          stroke="var(--slider-track-color, #e0e0e0)"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
        />
        
        {needle ? (
          <>
            {/* Level segments for needle mode */}
            {levels && levels.length > 0 && (
              <>
                {levels.map((level, index) => {
                  const nextLevel = levels[index + 1];
                  const levelStart = startAngle + (totalAngle * ((level.level - min) / (max - min)));
                  const levelEnd = nextLevel 
                    ? startAngle + (totalAngle * ((nextLevel.level - min) / (max - min)))
                    : endAngle;
                  
                  return (
                    <path
                      key={index}
                      d={describeArc(center, center, radius, levelStart, levelEnd)}
                      fill="none"
                      stroke={level.stroke}
                      strokeWidth={config.strokeWidth}
                      strokeLinecap="round"
                    />
                  );
                })}
              </>
            )}
            
            {/* Needle */}
            <line
              x1={center}
              y1={center}
              x2={needlePoint.x}
              y2={needlePoint.y}
              stroke={gaugeColor}
              strokeWidth={3}
              strokeLinecap="round"
            />
            
            {/* Needle center dot */}
            <circle
              cx={center}
              cy={center}
              r={6}
              fill={gaugeColor}
            />
          </>
        ) : (
          /* Value arc for non-needle mode */
          <path
            d={valueArc}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.3s ease-in-out',
            }}
          />
        )}
      </svg>
      
      {/* Value display */}
      <div 
        className="absolute flex flex-col items-center justify-center"
        style={{
          top: '55%',
          transform: 'translateY(-50%)',
        }}
      >
        <span 
          className="font-bold"
          style={{ 
            fontSize: config.fontSize,
            color: 'var(--primary-text-color)',
          }}
        >
          {formattedValue}
        </span>
        {label && (
          <span 
            className="text-[var(--secondary-text-color)] mt-1"
            style={{ fontSize: `calc(${config.fontSize} * 0.6)` }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// Simple Gauge (Progress style)
// ============================================

export interface SimpleGaugeProps {
  value: number;
  max?: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function SimpleGauge({
  value,
  max = 100,
  color = 'var(--primary-color)',
  size = 60,
  strokeWidth = 6,
  className,
}: SimpleGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference * (1 - percentage);
  
  return (
    <svg
      width={size}
      height={size}
      className={cn('transform -rotate-90', className)}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--slider-track-color, #e0e0e0)"
        strokeWidth={strokeWidth}
      />
      
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 0.3s ease-in-out',
        }}
      />
    </svg>
  );
}

export default HaGauge;
