'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './StatsCard.module.css';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive?: boolean;
  };
  subtitle?: string;
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'red';
  loading?: boolean;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  subtitle,
  color = 'purple',
  loading = false
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp size={14} />;
    if (trend.value < 0) return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  const getTrendClass = () => {
    if (!trend) return '';
    if (trend.isPositive !== undefined) {
      return trend.isPositive ? styles.positive : styles.negative;
    }
    if (trend.value > 0) return styles.positive;
    if (trend.value < 0) return styles.negative;
    return styles.neutral;
  };

  if (loading) {
    return (
      <div className={`${styles.card} ${styles[color]}`}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonIcon} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonValue} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.iconWrapper}>
        <Icon size={24} />
      </div>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <div className={styles.valueRow}>
          <span className={styles.value}>{value}</span>
          {trend && (
            <span className={`${styles.trend} ${getTrendClass()}`}>
              {getTrendIcon()}
              <span>{Math.abs(trend.value)}%</span>
            </span>
          )}
        </div>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
    </div>
  );
}

export default StatsCard;
