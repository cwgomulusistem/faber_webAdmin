import React from 'react';
import { HassContext, HassEntity } from '@/types/hass';
import { LovelaceCardConfig } from '../HuiCard';
import { Lightbulb } from 'lucide-react';

interface Props {
  config: LovelaceCardConfig;
  hass: HassContext;
}

export function HuiButtonCard({ config, hass }: Props) {
  const entityId = config.entity;
  const entity = hass.states[entityId];
  const name = config.name || entity?.attributes.friendly_name || entityId;
  const state = entity?.state || 'unavailable';
  const isOn = state === 'on';

  const handleToggle = () => {
    if (entityId) {
       const domain = entityId.split('.')[0];
       hass.callService(domain, 'toggle', { entity_id: entityId });
    }
  };

  return (
    <div 
      onClick={handleToggle}
      className={`
        cursor-pointer rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all
        ${isOn ? 'bg-amber-100 text-amber-900' : 'bg-white border border-slate-200 text-slate-600'}
        shadow-sm hover:shadow-md
      `}
    >
      <div className={`p-3 rounded-full ${isOn ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
        <Lightbulb size={24} />
      </div>
      <span className="font-medium text-sm text-center">{name}</span>
      <span className="text-xs opacity-70 uppercase">{state}</span>
    </div>
  );
}
