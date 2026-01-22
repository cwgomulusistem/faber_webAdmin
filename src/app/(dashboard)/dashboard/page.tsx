'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Sun, Moon, RefreshCw, Wifi, WifiOff, 
  Plus, Pencil, Check, X, GripVertical,
  LayoutGrid, Settings, Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HuiSection, type SectionConfig } from '@/components/lovelace/sections/HuiSection';
import { HuiCard, type LovelaceCardConfig } from '@/components/lovelace/HuiCard';
import { CardPickerDialog } from '@/components/lovelace/dialogs/CardPickerDialog';
import { useSimpleHass } from '@/hooks/useHass';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import type { HassContext, HassEntity } from '@/types/hass';

// ============================================
// Dashboard Config Types
// ============================================

interface DashboardConfig {
  title: string;
  sections: SectionConfig[];
}

// ============================================
// Default Dashboard Config
// ============================================

const DEFAULT_DASHBOARD: DashboardConfig = {
  title: 'Evim',
  sections: [
    {
      title: 'Salon',
      cards: [
        { type: 'tile', entity: 'light.living_room', name: 'Ana Işık' },
        { type: 'tile', entity: 'switch.tv', name: 'TV' },
        { type: 'tile', entity: 'climate.ac', name: 'Klima' },
        { type: 'tile', entity: 'sensor.temperature', name: 'Sıcaklık' },
      ],
    },
    {
      title: 'Mutfak',
      cards: [
        { type: 'tile', entity: 'light.kitchen', name: 'Mutfak Işığı' },
        { type: 'tile', entity: 'switch.coffee', name: 'Kahve Makinesi' },
      ],
    },
    {
      title: 'Yatak Odası',
      cards: [
        { type: 'light', entity: 'light.bedroom', name: 'Yatak Odası' },
        { type: 'tile', entity: 'cover.blinds', name: 'Perde' },
      ],
    },
  ],
};

// ============================================
// Toolbar Component
// ============================================

interface ToolbarProps {
  title: string;
  connected: boolean;
  editMode: boolean;
  onToggleEditMode: () => void;
  onRefresh: () => void;
  onAddSection: () => void;
}

function Toolbar({ 
  title, 
  connected, 
  editMode, 
  onToggleEditMode, 
  onRefresh,
  onAddSection 
}: ToolbarProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <header className="sections-view__header">
      <div className="flex items-center gap-4">
        {/* Home Icon */}
        <div className="w-10 h-10 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white">
          <Home size={20} />
        </div>
        
        {/* Title */}
        <div>
          <h1 className="sections-view__title">{title}</h1>
          <div className={cn(
            'flex items-center gap-1.5 text-xs',
            connected ? 'text-[var(--success-color)]' : 'text-[var(--error-color)]'
          )}>
            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {connected ? 'Bağlı' : 'Bağlantı Yok'}
          </div>
        </div>
      </div>
      
      <div className="sections-view__actions">
        {editMode ? (
          <>
            {/* Add Section Button */}
            <button
              onClick={onAddSection}
              className="ha-btn ha-btn--secondary"
            >
              <Plus size={18} />
              <span>Bölüm Ekle</span>
            </button>
            
            {/* Done Button */}
            <button
              onClick={onToggleEditMode}
              className="ha-btn ha-btn--primary"
            >
              <Check size={18} />
              <span>Bitti</span>
            </button>
          </>
        ) : (
          <>
            {/* Refresh */}
            <button
              onClick={onRefresh}
              className="ha-btn ha-btn--icon"
              title="Yenile"
            >
              <RefreshCw size={20} />
            </button>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="ha-btn ha-btn--icon"
              title={isDarkMode ? 'Açık Tema' : 'Koyu Tema'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Edit Mode */}
            <button
              onClick={onToggleEditMode}
              className="ha-btn ha-btn--icon"
              title="Düzenle"
            >
              <Pencil size={20} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

// ============================================
// Empty State Component
// ============================================

function EmptyState({ onAddSection }: { onAddSection: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-[var(--divider-color)] flex items-center justify-center mb-6">
        <LayoutGrid size={40} className="text-[var(--secondary-text-color)]" />
      </div>
      <h2 className="text-xl font-semibold text-[var(--primary-text-color)] mb-2">
        Dashboard Boş
      </h2>
      <p className="text-[var(--secondary-text-color)] mb-6 max-w-sm">
        Cihazlarınızı kontrol etmek için bölümler ve kartlar ekleyin.
      </p>
      <button
        onClick={onAddSection}
        className="ha-btn ha-btn--primary"
      >
        <Plus size={18} />
        <span>İlk Bölümü Ekle</span>
      </button>
    </div>
  );
}

// ============================================
// More Info Dialog
// ============================================

interface MoreInfoDialogProps {
  entityId: string | null;
  hass: HassContext;
  onClose: () => void;
}

function MoreInfoDialog({ entityId, hass, onClose }: MoreInfoDialogProps) {
  if (!entityId) return null;
  
  const entity = hass.states[entityId];
  
  return (
    <div 
      className="ha-dialog-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ha-dialog">
        <div className="ha-dialog__header">
          <h2 className="ha-dialog__title">
            {entity?.attributes.friendly_name || entityId}
          </h2>
          <button className="ha-dialog__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="ha-dialog__content">
          {entity ? (
            <div className="space-y-4">
              {/* State */}
              <div className="flex justify-between items-center py-2 border-b border-[var(--divider-color)]">
                <span className="text-[var(--secondary-text-color)]">Durum</span>
                <span className="font-medium text-[var(--primary-text-color)]">
                  {hass.formatEntityState(entity)}
                </span>
              </div>
              
              {/* Attributes */}
              {Object.entries(entity.attributes)
                .filter(([key]) => !['friendly_name', 'icon', 'supported_features'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-[var(--divider-color)]">
                    <span className="text-[var(--secondary-text-color)] capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-medium text-[var(--primary-text-color)] truncate max-w-[200px]">
                      {hass.formatEntityAttributeValue(entity, key)}
                    </span>
                  </div>
                ))
              }
              
              {/* Last Updated */}
              <div className="text-xs text-[var(--secondary-text-color)] text-center pt-2">
                Son güncelleme: {new Date(entity.last_updated).toLocaleString('tr-TR')}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--warning-color)]">
              Entity bulunamadı
            </div>
          )}
        </div>
        
        <div className="ha-dialog__footer">
          <button onClick={onClose} className="ha-btn ha-btn--primary">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Dashboard Component
// ============================================

function DashboardContent() {
  const hass = useSimpleHass();
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_DASHBOARD);
  const [editMode, setEditMode] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [cardPickerOpen, setCardPickerOpen] = useState(false);
  const [targetSectionIndex, setTargetSectionIndex] = useState<number>(0);
  
  // Handlers
  const handleRefresh = useCallback(() => {
    // Force re-render
    setConfig(prev => ({ ...prev }));
  }, []);
  
  const handleToggleEditMode = useCallback(() => {
    setEditMode(prev => !prev);
  }, []);
  
  const handleAddSection = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          title: `Bölüm ${prev.sections.length + 1}`,
          cards: [],
        },
      ],
    }));
  }, []);
  
  const handleDeleteSection = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  }, []);
  
  const handleSectionConfigChange = useCallback((index: number, sectionConfig: SectionConfig) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => i === index ? sectionConfig : s),
    }));
  }, []);
  
  const handleAddCard = useCallback((sectionIndex: number) => {
    setTargetSectionIndex(sectionIndex);
    setCardPickerOpen(true);
  }, []);
  
  const handleCardSelect = useCallback((cardConfig: LovelaceCardConfig) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => {
        if (i === targetSectionIndex) {
          return {
            ...section,
            cards: [...section.cards, cardConfig],
          };
        }
        return section;
      }),
    }));
  }, [targetSectionIndex]);
  
  const handleEditCard = useCallback((sectionIndex: number, cardIndex: number) => {
    // TODO: Open card editor dialog
    console.log('Edit card:', sectionIndex, cardIndex);
  }, []);
  
  const handleDeleteCard = useCallback((sectionIndex: number, cardIndex: number) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => {
        if (i === sectionIndex) {
          return {
            ...section,
            cards: section.cards.filter((_, ci) => ci !== cardIndex),
          };
        }
        return section;
      }),
    }));
  }, []);
  
  const handleDuplicateCard = useCallback((sectionIndex: number, cardIndex: number) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => {
        if (i === sectionIndex) {
          const cardToDuplicate = section.cards[cardIndex];
          return {
            ...section,
            cards: [
              ...section.cards.slice(0, cardIndex + 1),
              { ...cardToDuplicate },
              ...section.cards.slice(cardIndex + 1),
            ],
          };
        }
        return section;
      }),
    }));
  }, []);
  
  const handleMoveCard = useCallback((sectionIndex: number, fromIndex: number, toIndex: number) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => {
        if (i === sectionIndex) {
          const cards = [...section.cards];
          const [movedCard] = cards.splice(fromIndex, 1);
          cards.splice(toIndex, 0, movedCard);
          return { ...section, cards };
        }
        return section;
      }),
    }));
  }, []);
  
  const handleMoreInfo = useCallback((entityId: string) => {
    setSelectedEntity(entityId);
  }, []);
  
  return (
    <div className={cn('sections-view', editMode && 'edit-mode')}>
      {/* Toolbar */}
      <Toolbar
        title={config.title}
        connected={hass.connected}
        editMode={editMode}
        onToggleEditMode={handleToggleEditMode}
        onRefresh={handleRefresh}
        onAddSection={handleAddSection}
      />
      
      {/* Content */}
      {config.sections.length === 0 ? (
        <EmptyState onAddSection={handleAddSection} />
      ) : (
        <div className="sections-view__content">
          {config.sections.map((section, index) => (
            <HuiSection
              key={index}
              config={section}
              hass={hass}
              index={index}
              editMode={editMode}
              onConfigChange={handleSectionConfigChange}
              onDelete={handleDeleteSection}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
              onDuplicateCard={handleDuplicateCard}
              onMoveCard={handleMoveCard}
              onMoreInfo={handleMoreInfo}
            />
          ))}
        </div>
      )}
      
      {/* Dialogs */}
      <CardPickerDialog
        open={cardPickerOpen}
        onClose={() => setCardPickerOpen(false)}
        onSelect={handleCardSelect}
      />
      
      <MoreInfoDialog
        entityId={selectedEntity}
        hass={hass}
        onClose={() => setSelectedEntity(null)}
      />
    </div>
  );
}

// ============================================
// Exported Page with Providers
// ============================================

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}
