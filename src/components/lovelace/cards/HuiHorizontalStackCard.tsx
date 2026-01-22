import React from 'react';
import { HassContext } from '@/types/hass';
import { LovelaceCardConfig, HuiCard } from '../HuiCard';

interface Props {
  config: LovelaceCardConfig;
  hass: HassContext;
}

export function HuiHorizontalStackCard({ config, hass }: Props) {
  const cards = config.cards || [];

  return (
    <div className="flex flex-row gap-4 w-full">
      {cards.map((cardConfig: LovelaceCardConfig, idx: number) => (
        <div key={idx} className="flex-1 min-w-0">
          <HuiCard config={cardConfig} hass={hass} />
        </div>
      ))}
    </div>
  );
}
