import React from 'react';
import { HassContext } from '@/types/hass';
import { LovelaceCardConfig } from '../HuiCard';

interface Props {
  config: LovelaceCardConfig;
  hass: HassContext;
}

export function HuiEntitiesCard({ config, hass }: Props) {
  const title = config.title;
  const entities = config.entities || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-slate-100 font-medium text-slate-800">
          {title}
        </div>
      )}
      <div className="divide-y divide-slate-100">
        {entities.map((item: any, idx: number) => {
          const entityId = typeof item === 'string' ? item : item.entity;
          const entity = hass.states[entityId];
          const name = (typeof item === 'object' && item.name) || entity?.attributes.friendly_name || entityId;
          const state = entity?.state || 'Unknown';

          return (
            <div key={idx} className="flex justify-between items-center px-4 py-3 hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  {/* Icon placeholder */}
                  <span className="text-xs">Icon</span>
                </div>
                <span className="text-sm font-medium text-slate-700">{name}</span>
              </div>
              <span className="text-sm text-slate-600">{state} {entity?.attributes.unit_of_measurement}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
