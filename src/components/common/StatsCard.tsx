'use client';

// Stats Card Component
// Reusable card for displaying statistics

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './StatsCard.module.css';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = '#3b82f6',
  trend,
  subtitle 
}: StatsCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div 
          className={styles.iconWrapper}
          style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
        >
          <Icon size={22} />
        </div>
        {trend && (
          <div className={`${styles.trend} ${trend.isPositive ? styles.positive : styles.negative}`}>
            {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <span className={styles.value}>{value}</span>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
    </div>
  );
}

export default StatsCard;
