'use client';

// Dashboard Page
// Ported to use LovelaceView for dynamic Home Assistant-like experience

import React from 'react';
import { LovelaceView } from '../../../components/lovelace/LovelaceView';

// Example Configuration (mimicking lovelace.yaml)
// In a real app, this would be fetched from the backend (dashboard configuration API)
const dashboardConfig = {
  title: 'Faber Smart Home',
  cards: [
    {
      type: 'horizontal-stack',
      cards: [
        {
          type: 'glance',
          title: 'Durum',
          entities: [
             { entity: 'sensor.kitchen_temperature', name: 'Mutfak' },
             { entity: 'sensor.living_room_humidity', name: 'Nem' },
             { entity: 'light.living_room', name: 'Salon' }
          ]
        },
        {
          type: 'gauge',
          entity: 'sensor.power_usage',
          min: 0,
          max: 1000,
          name: 'Güç Tüketimi',
        }
      ]
    },
    {
       type: 'grid',
       columns: 2,
       cards: [
          {
             type: 'light',
             entity: 'light.living_room',
             name: 'Salon Işığı'
          },
          {
             type: 'light',
             entity: 'light.kitchen',
             name: 'Mutfak Işığı'
          },
          {
             type: 'button',
             entity: 'switch.tv_socket',
             name: 'TV Priz',
          },
          {
             type: 'button',
             entity: 'switch.ac',
             name: 'Klima',
          }
       ]
    },
    {
        type: 'entities',
        title: 'Tüm Sensörler',
        entities: [
            'sensor.kitchen_temperature',
            'sensor.living_room_humidity',
            'sensor.bedroom_temperature',
        ]
    }
  ]
};

export default function DashboardPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <LovelaceView config={dashboardConfig} />
    </div>
  );
}
