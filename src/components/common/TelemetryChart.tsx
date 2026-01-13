'use client';

// Telemetry Chart Component
// Charts for displaying telemetry data (Energy, Temperature, etc.)

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './TelemetryChart.module.css';

interface TelemetryData {
  time: string;
  value: number;
}

interface TelemetryChartProps {
  title: string;
  data: TelemetryData[];
  unit: string;
  color?: string;
  height?: number;
}

export function TelemetryChart({
  title,
  data,
  unit,
  color = '#3b82f6',
  height = 300,
}: TelemetryChartProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `${value} ${unit}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              itemStyle={{ color: '#0f172a', fontWeight: 500 }}
              formatter={(value: any) => [`${value} ${unit}`, title]}
              labelStyle={{ color: '#64748b', marginBottom: '0.25rem' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${title})`}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TelemetryChart;
