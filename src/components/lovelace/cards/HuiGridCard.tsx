import React from 'react';
import { HassContext } from '@/types/hass';
import { LovelaceCardConfig, HuiCard } from '../HuiCard';

interface Props {
  config: LovelaceCardConfig;
  hass: HassContext;
}

export function HuiGridCard({ config, hass }: Props) {
  const cards = config.cards || [];
  const columns = config.columns || 3;

  return (
    <div 
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {cards.map((cardConfig: LovelaceCardConfig, idx: number) => (
        <HuiCard key={idx} config={cardConfig} hass={hass} />
      ))}
    </div>
  );
}
