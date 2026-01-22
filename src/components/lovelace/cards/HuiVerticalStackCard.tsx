import React from 'react';
import { HassContext } from '@/types/hass';
import { LovelaceCardConfig, HuiCard } from '../HuiCard';

interface Props {
  config: LovelaceCardConfig;
  hass: HassContext;
}

export function HuiVerticalStackCard({ config, hass }: Props) {
  const cards = config.cards || [];

  return (
    <div className="flex flex-col gap-4">
      {cards.map((cardConfig: LovelaceCardConfig, idx: number) => (
        <HuiCard key={idx} config={cardConfig} hass={hass} />
      ))}
    </div>
  );
}
