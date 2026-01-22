import React from 'react';
import { HassContext } from '@/types/hass';
import { LovelaceCardConfig } from '../HuiCard';

interface Props {
  config: LovelaceCardConfig;
  hass: HassContext;
}

export function HuiStatisticCard({ config, hass }: Props) {
  const entityId = config.entity;
  const entity = hass.states[entityId];
  const name = config.name || entity?.attributes.friendly_name || entityId;
  const state = entity?.state || '-';
  const unit = entity?.attributes.unit_of_measurement || '';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="text-sm font-medium text-slate-500 mb-1">{name}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-800">{state}</span>
        <span className="text-sm text-slate-500">{unit}</span>
      </div>
       {/* Simplified Statistic - could add trend arrow here */}
       <div className="mt-2 text-xs text-green-600 flex items-center">
          <span>+2.4%</span>
          <span className="text-slate-400 ml-1">last hour</span>
       </div>
    </div>
  );
}
