import React from 'react';
import { HassContext } from '@/types/hass';
import { LovelaceCardConfig } from '../HuiCard';
import dynamic from 'next/dynamic';

const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });

interface Props {
  config: LovelaceCardConfig;
  hass: HassContext;
}

export function HuiGaugeCard({ config, hass }: Props) {
  const entityId = config.entity;
  const entity = hass.states[entityId];
  const name = config.name || entity?.attributes.friendly_name || entityId;
  const state = parseFloat(entity?.state) || 0;
  const unit = entity?.attributes.unit_of_measurement || '';
  const min = config.min || 0;
  const max = config.max || 100;
  
  // Calculate gauge angle
  const normalized = Math.min(Math.max((state - min) / (max - min), 0), 1);
  const data = [
      { name: 'value', value: normalized },
      { name: 'empty', value: 1 - normalized }
  ];
  const startAngle = 180;
  const endAngle = 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col items-center">
      <div className="text-sm font-medium text-slate-500 mb-2">{name}</div>
      <div className="relative w-32 h-16">
         <PieChart width={128} height={128} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
                data={data}
                cx="50%"
                cy="100%"
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={40}
                outerRadius={60}
                paddingAngle={0}
                dataKey="value"
            >
                <Cell fill="#3b82f6" />
                <Cell fill="#f1f5f9" />
            </Pie>
         </PieChart>
          <div className="absolute bottom-0 left-0 w-full text-center pb-0">
             <div className="text-xl font-bold text-slate-800">{state}</div>
             <div className="text-xs text-slate-500">{unit}</div>
         </div>
      </div>
    </div>
  );
}
