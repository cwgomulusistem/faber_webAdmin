'use client';

import React, { forwardRef, ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// HaCard Props
// ============================================

export interface HaCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  header?: string;
  outlined?: boolean;
  raised?: boolean;
  interactive?: boolean;
  disabled?: boolean;
}

// ============================================
// HaCard Component
// ============================================

export const HaCard = forwardRef<HTMLDivElement, HaCardProps>(
  ({ 
    children, 
    header, 
    outlined = false, 
    raised = false, 
    interactive = false,
    disabled = false,
    className,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'ha-card relative rounded-[var(--ha-card-border-radius,12px)] overflow-hidden',
          'bg-[var(--card-background-color,#fff)] text-[var(--primary-text-color,#212121)]',
          
          // Border styles
          outlined 
            ? 'border border-[var(--ha-card-border-color,rgba(0,0,0,0.12))]' 
            : 'border border-transparent',
          
          // Shadow styles
          raised 
            ? 'shadow-[var(--ha-card-box-shadow,0_2px_8px_rgba(0,0,0,0.15))]'
            : 'shadow-[var(--ha-card-box-shadow,0_2px_4px_rgba(0,0,0,0.1))]',
          
          // Interactive styles
          interactive && !disabled && [
            'cursor-pointer transition-all duration-200',
            'hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]',
            'active:scale-[0.98]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2',
          ],
          
          // Disabled styles
          disabled && 'opacity-50 cursor-not-allowed',
          
          className
        )}
        tabIndex={interactive && !disabled ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        {...props}
      >
        {/* Header */}
        {header && (
          <div className="card-header px-4 py-3 text-[var(--ha-font-size-l,1.125rem)] font-medium">
            {header}
          </div>
        )}
        
        {/* Content */}
        {children}
      </div>
    );
  }
);

HaCard.displayName = 'HaCard';

// ============================================
// Card Header Component
// ============================================

export interface HaCardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const HaCardHeader = forwardRef<HTMLDivElement, HaCardHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card-header px-4 py-3 flex items-center justify-between',
          'text-[var(--ha-font-size-l,1.125rem)] font-medium',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

HaCardHeader.displayName = 'HaCardHeader';

// ============================================
// Card Content Component
// ============================================

export interface HaCardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const HaCardContent = forwardRef<HTMLDivElement, HaCardContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('card-content p-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

HaCardContent.displayName = 'HaCardContent';

// ============================================
// Ripple Effect Component
// ============================================

export interface HaRippleProps {
  disabled?: boolean;
}

export function HaRipple({ disabled = false }: HaRippleProps) {
  if (disabled) return null;
  
  return (
    <span 
      className={cn(
        'ha-ripple absolute inset-0 overflow-hidden pointer-events-none',
        'after:content-[""] after:absolute after:inset-0',
        'after:bg-[var(--ha-ripple-color,var(--primary-color))]',
        'after:opacity-0 after:transition-opacity after:duration-200',
        'group-hover:after:opacity-[var(--ha-ripple-hover-opacity,0.04)]',
        'group-active:after:opacity-[var(--ha-ripple-pressed-opacity,0.12)]'
      )}
    />
  );
}

export default HaCard;
