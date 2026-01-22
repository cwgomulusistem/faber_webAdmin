'use client';

import React, { useState } from 'react';
import { 
  X, 
  ToggleRight, 
  Lightbulb, 
  Thermometer, 
  Gauge, 
  CloudSun,
  Grid3X3,
  List,
  Activity,
  Home,
  Square,
  Layers,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LovelaceCardConfig } from '../HuiCard';

// ============================================
// Card Type Definitions
// ============================================

interface CardTypeInfo {
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'popular' | 'sensors' | 'controls' | 'layout' | 'other';
  defaultConfig: Partial<LovelaceCardConfig>;
}

const CARD_TYPES: CardTypeInfo[] = [
  // Popular
  {
    type: 'tile',
    name: 'Tile',
    description: 'Modern kompakt kart',
    icon: <Square size={24} />,
    category: 'popular',
    defaultConfig: { type: 'tile', entity: '' },
  },
  {
    type: 'button',
    name: 'Button',
    description: 'Tıklanabilir buton',
    icon: <ToggleRight size={24} />,
    category: 'popular',
    defaultConfig: { type: 'button', entity: '' },
  },
  {
    type: 'light',
    name: 'Light',
    description: 'Işık kontrolü',
    icon: <Lightbulb size={24} />,
    category: 'popular',
    defaultConfig: { type: 'light', entity: '' },
  },
  {
    type: 'thermostat',
    name: 'Thermostat',
    description: 'Klima kontrolü',
    icon: <Thermometer size={24} />,
    category: 'popular',
    defaultConfig: { type: 'thermostat', entity: '' },
  },
  
  // Sensors
  {
    type: 'gauge',
    name: 'Gauge',
    description: 'Yuvarlak gösterge',
    icon: <Gauge size={24} />,
    category: 'sensors',
    defaultConfig: { type: 'gauge', entity: '', min: 0, max: 100 },
  },
  {
    type: 'sensor',
    name: 'Sensor',
    description: 'Sensör değeri',
    icon: <Activity size={24} />,
    category: 'sensors',
    defaultConfig: { type: 'sensor', entity: '' },
  },
  {
    type: 'weather-forecast',
    name: 'Weather',
    description: 'Hava durumu',
    icon: <CloudSun size={24} />,
    category: 'sensors',
    defaultConfig: { type: 'weather-forecast', entity: '' },
  },
  
  // Controls
  {
    type: 'entities',
    name: 'Entities',
    description: 'Entity listesi',
    icon: <List size={24} />,
    category: 'controls',
    defaultConfig: { type: 'entities', entities: [] },
  },
  {
    type: 'glance',
    name: 'Glance',
    description: 'Hızlı bakış',
    icon: <Grid3X3 size={24} />,
    category: 'controls',
    defaultConfig: { type: 'glance', entities: [] },
  },
  {
    type: 'area',
    name: 'Area',
    description: 'Oda kartı',
    icon: <Home size={24} />,
    category: 'controls',
    defaultConfig: { type: 'area', area: '' },
  },
  
  // Layout
  {
    type: 'vertical-stack',
    name: 'Vertical Stack',
    description: 'Dikey kart grubu',
    icon: <Layers size={24} />,
    category: 'layout',
    defaultConfig: { type: 'vertical-stack', cards: [] },
  },
  {
    type: 'horizontal-stack',
    name: 'Horizontal Stack',
    description: 'Yatay kart grubu',
    icon: <Layers size={24} className="rotate-90" />,
    category: 'layout',
    defaultConfig: { type: 'horizontal-stack', cards: [] },
  },
  {
    type: 'grid',
    name: 'Grid',
    description: 'Grid düzeni',
    icon: <Grid3X3 size={24} />,
    category: 'layout',
    defaultConfig: { type: 'grid', cards: [], columns: 2 },
  },
];

const CATEGORIES = [
  { id: 'all', name: 'Tümü' },
  { id: 'popular', name: 'Popüler' },
  { id: 'sensors', name: 'Sensörler' },
  { id: 'controls', name: 'Kontroller' },
  { id: 'layout', name: 'Düzen' },
];

// ============================================
// Props
// ============================================

interface CardPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (config: LovelaceCardConfig) => void;
}

// ============================================
// Card Picker Dialog Component
// ============================================

export function CardPickerDialog({ open, onClose, onSelect }: CardPickerDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  if (!open) return null;
  
  // Filter cards
  const filteredCards = CARD_TYPES.filter(card => {
    const matchesSearch = 
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || card.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const handleCardSelect = (cardType: CardTypeInfo) => {
    onSelect(cardType.defaultConfig as LovelaceCardConfig);
    onClose();
  };
  
  return (
    <div 
      className="ha-dialog-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ha-dialog" style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="ha-dialog__header">
          <h2 className="ha-dialog__title">Kart Ekle</h2>
          <button className="ha-dialog__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        {/* Search */}
        <div className="px-4 pt-4">
          <div className="relative">
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" 
            />
            <input
              type="text"
              placeholder="Kart ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2.5',
                'bg-[var(--secondary-background-color)]',
                'border border-[var(--divider-color)]',
                'rounded-lg',
                'text-[var(--primary-text-color)]',
                'placeholder:text-[var(--secondary-text-color)]',
                'focus:outline-none focus:border-[var(--primary-color)]',
                'transition-colors'
              )}
            />
          </div>
        </div>
        
        {/* Categories */}
        <div className="px-4 pt-3 flex gap-2 flex-wrap">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                selectedCategory === category.id
                  ? 'bg-[var(--primary-color)] text-white'
                  : 'bg-[var(--divider-color)] text-[var(--secondary-text-color)] hover:bg-[var(--secondary-background-color)]'
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Card List */}
        <div className="ha-dialog__content">
          {filteredCards.length === 0 ? (
            <div className="text-center py-8 text-secondary">
              Kart bulunamadı
            </div>
          ) : (
            <div className="card-picker">
              {filteredCards.map(card => (
                <button
                  key={card.type}
                  className="card-picker__item"
                  onClick={() => handleCardSelect(card)}
                >
                  <div className="card-picker__icon">
                    {card.icon}
                  </div>
                  <div className="card-picker__name">{card.name}</div>
                  <div className="card-picker__description">{card.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CardPickerDialog;
