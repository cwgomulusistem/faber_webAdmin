'use client';

import React, { useState, useEffect } from 'react';
import { HuiCard, LovelaceCardConfig } from './HuiCard';
import { HassContext, HassEntity } from '@/types/hass';
import env from '@/config/env';

interface Props {
  config: {
    title?: string;
    cards: LovelaceCardConfig[];
  };
}

export function LovelaceView({ config }: Props) {
  // Mock Hass Context for now, or fetch from simplified backend
  const [hass, setHass] = useState<HassContext>({
    states: {},
    callService: async (domain, service, data) => {
        console.log('Call Service:', domain, service, data);
        // Implement API call to /api/services here
    }
  });

  // Fetch states from backend
  useEffect(() => {
    const fetchStates = async () => {
        try {
            // env.API_URL is the base host (e.g. https://testapi...), so we append /api/v1
            const res = await fetch(`${env.API_URL}/api/v1/states`); 
            if (res.ok) {
                const entities: HassEntity[] = await res.json();
                const statesMap: {[key: string]: HassEntity} = {};
                entities.forEach(e => statesMap[e.entity_id] = e);
                setHass(prev => ({ ...prev, states: statesMap }));
            }
        } catch (e) {
            console.error("Failed to fetch states", e);
        }
    };
    
    // Initial fetch
    fetchStates();
    // Poll every 5 seconds
    const interval = setInterval(fetchStates, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="lovelace-view p-4 max-w-7xl mx-auto">
      {config.title && <h1 className="text-2xl font-bold mb-6 text-slate-800">{config.title}</h1>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {config.cards.map((cardConfig, idx) => (
             <div key={idx} className="mb-4">
               <HuiCard config={cardConfig} hass={hass} />
             </div>
        ))}
      </div>
    </div>
  );
}
