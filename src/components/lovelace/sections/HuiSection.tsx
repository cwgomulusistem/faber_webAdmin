'use client';

import React, { useCallback, useState } from 'react';
import { HuiCard, type LovelaceCardConfig } from '../HuiCard';
import type { HassContext } from '@/types/hass';
import { GripVertical, Plus, Settings, Trash2, ChevronUp, ChevronDown, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// Section Config Type
// ============================================

export interface SectionConfig {
  type?: 'grid';
  title?: string;
  cards: LovelaceCardConfig[];
  column_span?: number;
  row_span?: number;
  collapsed?: boolean;
}

// ============================================
// Props
// ============================================

interface HuiSectionProps {
  config: SectionConfig;
  hass: HassContext;
  index: number;
  editMode?: boolean;
  onConfigChange?: (index: number, config: SectionConfig) => void;
  onDelete?: (index: number) => void;
  onAddCard?: (sectionIndex: number) => void;
  onEditCard?: (sectionIndex: number, cardIndex: number) => void;
  onDeleteCard?: (sectionIndex: number, cardIndex: number) => void;
  onDuplicateCard?: (sectionIndex: number, cardIndex: number) => void;
  onMoveCard?: (sectionIndex: number, fromIndex: number, toIndex: number) => void;
  onMoreInfo?: (entityId: string) => void;
}

// ============================================
// Card Wrapper with Edit Controls
// ============================================

interface CardWrapperProps {
  config: LovelaceCardConfig;
  hass: HassContext;
  editMode: boolean;
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMoreInfo?: (entityId: string) => void;
}

function CardWrapper({ 
  config, 
  hass, 
  editMode, 
  index,
  onEdit,
  onDelete,
  onDuplicate,
  onMoreInfo 
}: CardWrapperProps) {
  // Calculate grid span based on card type
  const getGridSpan = () => {
    const type = config.type?.replace('custom:', '');
    switch (type) {
      case 'tile':
      case 'button':
        return 6;
      case 'light':
      case 'gauge':
      case 'thermostat':
        return 6;
      case 'weather-forecast':
      case 'entities':
        return 12;
      case 'glance':
        return 12;
      default:
        return 6;
    }
  };
  
  const span = getGridSpan();
  
  return (
    <div 
      className={cn(
        'card-wrapper relative group',
        editMode && 'cursor-grab'
      )}
      style={{ gridColumn: `span ${span}` }}
      data-card-index={index}
    >
      <HuiCard config={config} hass={hass} onMoreInfo={onMoreInfo} />
      
      {/* Edit Mode Overlay */}
      {editMode && (
        <div className="card-edit-overlay">
          <button 
            className="card-edit-btn" 
            onClick={onEdit}
            title="Düzenle"
          >
            <Settings size={16} />
          </button>
          <button 
            className="card-edit-btn" 
            onClick={onDuplicate}
            title="Kopyala"
          >
            <Copy size={16} />
          </button>
          <button 
            className="card-edit-btn" 
            onClick={onDelete}
            title="Sil"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Section Component
// ============================================

export function HuiSection({
  config,
  hass,
  index,
  editMode = false,
  onConfigChange,
  onDelete,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onDuplicateCard,
  onMoveCard,
  onMoreInfo,
}: HuiSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(config.collapsed ?? false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Toggle collapse
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
    onConfigChange?.(index, { ...config, collapsed: !isCollapsed });
  }, [config, index, isCollapsed, onConfigChange]);
  
  // Drag handlers
  const handleDragStart = (e: React.DragEvent, cardIndex: number) => {
    e.dataTransfer.setData('cardIndex', cardIndex.toString());
    e.dataTransfer.setData('sectionIndex', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent, cardIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(cardIndex);
  };
  
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };
  
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('cardIndex'));
    const fromSectionIndex = parseInt(e.dataTransfer.getData('sectionIndex'));
    
    if (fromSectionIndex === index && fromIndex !== targetIndex) {
      onMoveCard?.(index, fromIndex, targetIndex);
    }
    
    setDragOverIndex(null);
  };
  
  return (
    <div 
      className={cn(
        'section',
        editMode && 'section--editing'
      )}
      style={{
        gridColumn: config.column_span ? `span ${config.column_span}` : undefined,
        gridRow: config.row_span ? `span ${config.row_span}` : undefined,
      }}
    >
      {/* Section Header */}
      {(config.title || editMode) && (
        <div className="section__header">
          <div className="flex items-center gap-2">
            {editMode && (
              <button className="ha-btn--icon p-1 cursor-grab">
                <GripVertical size={16} className="text-secondary" />
              </button>
            )}
            
            {config.title && (
              <h3 className="section__title">{config.title}</h3>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* Collapse Toggle */}
            <button
              className="ha-btn--icon p-1"
              onClick={handleToggleCollapse}
              title={isCollapsed ? 'Genişlet' : 'Daralt'}
            >
              {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            
            {editMode && (
              <>
                <button
                  className="ha-btn--icon p-1"
                  onClick={() => onDelete?.(index)}
                  title="Bölümü Sil"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Cards Grid */}
      {!isCollapsed && (
        <div className="section__cards">
          {config.cards.map((cardConfig, cardIndex) => (
            <div
              key={cardIndex}
              draggable={editMode}
              onDragStart={(e) => handleDragStart(e, cardIndex)}
              onDragOver={(e) => handleDragOver(e, cardIndex)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, cardIndex)}
              className={cn(
                'transition-all duration-200',
                dragOverIndex === cardIndex && 'drag-over'
              )}
              style={{ gridColumn: 'span 6' }}
            >
              <CardWrapper
                config={cardConfig}
                hass={hass}
                editMode={editMode}
                index={cardIndex}
                onEdit={() => onEditCard?.(index, cardIndex)}
                onDelete={() => onDeleteCard?.(index, cardIndex)}
                onDuplicate={() => onDuplicateCard?.(index, cardIndex)}
                onMoreInfo={onMoreInfo}
              />
            </div>
          ))}
          
          {/* Add Card Button */}
          {editMode && (
            <div style={{ gridColumn: 'span 6' }}>
              <button
                className="add-card-btn w-full"
                onClick={() => onAddCard?.(index)}
              >
                <div className="add-card-btn__icon">
                  <Plus size={20} />
                </div>
                <span className="add-card-btn__text">Kart Ekle</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HuiSection;
