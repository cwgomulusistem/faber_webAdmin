import React from 'react';
import { HassContext } from '@/types/hass';
import { LovelaceCardConfig } from '../HuiCard';
import { Sun } from 'lucide-react';

interface Props {
  config: LovelaceCardConfig;
  hass: HassContext;
}

export function HuiLightCard({ config, hass }: Props) {
  const entityId = config.entity;
  const entity = hass.states[entityId];
  const name = config.name || entity?.attributes.friendly_name || entityId;
  const isOn = entity?.state === 'on';
  const brightness = entity?.attributes.brightness || 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${isOn ? 'bg-amber-400 text-white shadow-lg shadow-amber-200' : 'bg-slate-100 text-slate-400'}`}>
          <Sun size={24} />
        </div>
        <div className="flex-1">
          <div className="font-medium text-slate-800">{name}</div>
          <div className="text-xs text-slate-500">{isOn ? `${Math.round((brightness/255)*100)}% Brightness` : 'Off'}</div>
        </div>
        <div className="bg-slate-100 rounded-lg p-1 flex">
           {/* Toggle Switch Placeholder */}
           <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isOn ? 'bg-green-500' : 'bg-slate-300'}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${isOn ? 'translate-x-4' : ''}`}></div>
           </div>
        </div>
      </div>
      {/* Brightness Slider could go here */}
    </div>
  );
}
