import React from 'react';
import { HassContext } from '@/types/hass';
import { LovelaceCardConfig } from '../HuiCard';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  config: LovelaceCardConfig;
  hass: HassContext;
}

export function HuiSensorCard({ config, hass }: Props) {
  const entityId = config.entity;
  const entity = hass.states[entityId];
  const name = config.name || entity?.attributes.friendly_name || entityId;
  const state = entity?.state || '-';
  const unit = entity?.attributes.unit_of_measurement || '';

  // Mock historic data for the graph
  const data = [
    { value: 20 }, { value: 22 }, { value: 21 }, { value: 24 }, { value: 23 }, { value: 25 }, { value: 24 }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between h-40">
      <div className="flex justify-between items-start">
        <div className="text-sm font-medium text-slate-500">{name}</div>
        <div className="text-slate-400 text-xs">24h</div>
      </div>
      
      <div className="flex items-end justify-between mt-2">
         <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-800">{state}</span>
            <span className="text-sm text-slate-500 font-medium">{unit}</span>
         </div>
         <div className="h-16 w-1/2">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={data}>
               <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
             </LineChart>
           </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
}
