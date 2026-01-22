import React from 'react';
import { HassContext } from '@/types/hass';
import { LovelaceCardConfig } from '../HuiCard';

interface Props {
  config: LovelaceCardConfig;
  hass: HassContext;
}

export function HuiGlanceCard({ config, hass }: Props) {
  const title = config.title;
  const entities = config.entities || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      {title && <div className="mb-4 font-medium text-slate-800">{title}</div>}
      <div className="flex flex-wrap gap-4 justify-around">
        {entities.map((item: any, idx: number) => {
          const entityId = typeof item === 'string' ? item : item.entity;
          const entity = hass.states[entityId];
          const name = (typeof item === 'object' && item.name) || entity?.attributes.friendly_name || entityId;
          const state = entity?.state || '-';

          return (
            <div key={idx} className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80">
               <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                 {/* Icon */}
               </div>
               <span className="text-xs text-slate-500 text-center max-w-[80px] truncate">{name}</span>
               <span className="text-sm font-semibold text-slate-700">{state}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
