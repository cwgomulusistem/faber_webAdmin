'use client';

import React from 'react';
import { HuiButtonCard } from './cards/HuiButtonCard';
import { HuiEntitiesCard } from './cards/HuiEntitiesCard';
import { HuiGlanceCard } from './cards/HuiGlanceCard';
import { HuiLightCard } from './cards/HuiLightCard';
import { HuiSensorCard } from './cards/HuiSensorCard';
import { HuiVerticalStackCard } from './cards/HuiVerticalStackCard';
import { HuiHorizontalStackCard } from './cards/HuiHorizontalStackCard';
import { HuiGridCard } from './cards/HuiGridCard';
import { HuiStatisticCard } from './cards/HuiStatisticCard';
import { HuiGaugeCard } from './cards/HuiGaugeCard';
import { HassEntity } from '@/types/hass';

export interface LovelaceCardConfig {
  type: string;
  title?: string;
  [key: string]: any;
}

interface CommonCardProps {
  config: LovelaceCardConfig;
  hass: {
    states: { [key: string]: HassEntity };
    callService: (domain: string, service: string, data?: any) => Promise<void>;
  };
}

export function HuiCard({ config, hass }: CommonCardProps) {
  if (!config || !config.type) {
    return <div className="border border-red-500 p-4 text-red-500">Error: No card type defined</div>;
  }

  const type = config.type.replace('custom:', '');

  switch (type) {
    // Basic
    case 'button':
      return <HuiButtonCard config={config} hass={hass} />;
    case 'entities':
      return <HuiEntitiesCard config={config} hass={hass} />;
    case 'glance':
      return <HuiGlanceCard config={config} hass={hass} />;
    
    // Control
    case 'light':
      return <HuiLightCard config={config} hass={hass} />;
    
    // Sensor & Graph
    case 'sensor':
      return <HuiSensorCard config={config} hass={hass} />;
    case 'gauge':
      return <HuiGaugeCard config={config} hass={hass} />;
    case 'statistic':
      return <HuiStatisticCard config={config} hass={hass} />;
      
    // Layout
    case 'vertical-stack':
      return <HuiVerticalStackCard config={config} hass={hass} />;
    case 'horizontal-stack':
      return <HuiHorizontalStackCard config={config} hass={hass} />;
    case 'grid':
      return <HuiGridCard config={config} hass={hass} />;

    default:
      return (
        <div className="border border-yellow-500 p-4 bg-yellow-50">
          <p className="font-bold text-yellow-700">Unknown card type: {config.type}</p>
          <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(config, null, 2)}</pre>
        </div>
      );
  }
}
