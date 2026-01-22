'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { HuiCard, type LovelaceCardConfig } from './HuiCard';
import type { HassContext, HassEntity, LovelaceGridOptions } from '@/types/hass';
import { useSimpleHass } from '@/hooks/useHass';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, RefreshCw, Wifi, WifiOff } from 'lucide-react';

// ============================================
// View Config Types
// ============================================

export interface LovelaceViewConfig {
  title?: string;
  path?: string;
  icon?: string;
  badges?: any[];
  cards: LovelaceCardConfig[];
  theme?: string;
  background?: string;
  type?: 'masonry' | 'sidebar' | 'panel' | 'sections';
  max_columns?: number;
  dense?: boolean;
}

// ============================================
// Grid Layout Types
// ============================================

interface CardGridConfig {
  columns: number;
  rows: number;
}

// ============================================
// Get Grid Options for Card Type
// ============================================

function getCardGridOptions(config: LovelaceCardConfig): LovelaceGridOptions {
  const type = config.type?.replace('custom:', '');
  
  switch (type) {
    case 'tile':
      return { columns: 6, rows: 1, min_columns: 3 };
    case 'button':
      return { columns: 3, rows: 2, min_columns: 2 };
    case 'light':
      return { columns: 6, rows: 5, min_columns: 4 };
    case 'thermostat':
      return { columns: 6, rows: 5, min_columns: 6 };
    case 'weather-forecast':
      return { columns: 12, rows: 3, min_columns: 6 };
    case 'area':
      return { columns: 6, rows: 3, min_columns: 4 };
    case 'gauge':
      return { columns: 6, rows: 4, min_columns: 4 };
    case 'entities':
      return { columns: 12, rows: 'auto' as any, min_columns: 3 };
    case 'glance':
      return { columns: 12, rows: 2, min_columns: 6 };
    case 'sensor':
      return { columns: 6, rows: 3, min_columns: 3 };
    case 'statistic':
      return { columns: 6, rows: 2, min_columns: 3 };
    case 'vertical-stack':
    case 'horizontal-stack':
    case 'grid':
      return { columns: 12, rows: 'auto' as any, min_columns: 6 };
    default:
      return { columns: 6, rows: 2, min_columns: 3 };
  }
}

// ============================================
// Lovelace Grid Component
// ============================================

interface LovelaceGridProps {
  cards: LovelaceCardConfig[];
  hass: HassContext;
  maxColumns?: number;
  dense?: boolean;
  onMoreInfo?: (entityId: string) => void;
}

function LovelaceGrid({ cards, hass, maxColumns = 12, dense = false, onMoreInfo }: LovelaceGridProps) {
  return (
    <div 
      className={cn(
        'lovelace-grid grid gap-4',
        dense && 'gap-2'
      )}
      style={{
        gridTemplateColumns: `repeat(${maxColumns}, minmax(0, 1fr))`,
      }}
    >
      {cards.map((cardConfig, idx) => {
        const gridOptions = getCardGridOptions(cardConfig);
        const columns = Math.min(gridOptions.columns || 6, maxColumns);
        const rowsOption = gridOptions.rows;
        const isAutoRows = rowsOption === 'auto' || typeof rowsOption !== 'number';
        const rows = isAutoRows ? 2 : rowsOption;
        
        return (
          <div 
            key={idx}
            className="card-wrapper"
            style={{
              gridColumn: `span ${columns}`,
              gridRow: isAutoRows ? 'auto' : `span ${rows}`,
              minHeight: isAutoRows ? 'auto' : `${rows * 60}px`,
            }}
          >
            <HuiCard 
              config={cardConfig} 
              hass={hass}
              onMoreInfo={onMoreInfo}
            />
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// Header Component
// ============================================

interface LovelaceHeaderProps {
  title?: string;
  connected: boolean;
  onRefresh: () => void;
}

function LovelaceHeader({ title, connected, onRefresh }: LovelaceHeaderProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {title && (
          <h1 className="text-2xl font-bold text-[var(--primary-text-color)]">
            {title}
          </h1>
        )}
        
        {/* Connection status */}
        <div className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs',
          connected 
            ? 'bg-[var(--success-color)]/10 text-[var(--success-color)]'
            : 'bg-[var(--error-color)]/10 text-[var(--error-color)]'
        )}>
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className={cn(
            'p-2 rounded-full transition-colors',
            'hover:bg-[var(--divider-color)]',
            'text-[var(--secondary-text-color)]'
          )}
          title="Refresh"
        >
          <RefreshCw size={20} />
        </button>
        
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'p-2 rounded-full transition-colors',
            'hover:bg-[var(--divider-color)]',
            'text-[var(--secondary-text-color)]'
          )}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}

// ============================================
// More Info Dialog (Placeholder)
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--card-background-color)] rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--divider-color)]">
          <h2 className="text-lg font-semibold text-[var(--primary-text-color)]">
            {entity?.attributes.friendly_name || entityId}
          </h2>
          <p className="text-sm text-[var(--secondary-text-color)]">{entityId}</p>
        </div>
        
        <div className="p-4">
          {entity ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[var(--secondary-text-color)]">State</span>
                <span className="font-medium text-[var(--primary-text-color)]">
                  {hass.formatEntityState(entity)}
                </span>
              </div>
              
              {Object.entries(entity.attributes).map(([key, value]) => {
                if (key === 'friendly_name' || key === 'icon') return null;
                return (
                  <div key={key} className="flex justify-between">
                    <span className="text-[var(--secondary-text-color)] capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-medium text-[var(--primary-text-color)] truncate max-w-[200px]">
                      {hass.formatEntityAttributeValue(entity, key)}
                    </span>
                  </div>
                );
              })}
              
              <div className="flex justify-between text-xs">
                <span className="text-[var(--secondary-text-color)]">Last updated</span>
                <span className="text-[var(--secondary-text-color)]">
                  {new Date(entity.last_updated).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[var(--warning-color)]">Entity not found</p>
          )}
        </div>
        
        <div className="p-4 border-t border-[var(--divider-color)] flex justify-end">
          <button
            onClick={onClose}
            className={cn(
              'px-4 py-2 rounded-lg transition-colors',
              'bg-[var(--primary-color)] text-white',
              'hover:opacity-90'
            )}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main LovelaceView Component
// ============================================

interface LovelaceViewProps {
  config: LovelaceViewConfig;
}

function LovelaceViewContent({ config }: LovelaceViewProps) {
  const hass = useSimpleHass();
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);
  
  const handleMoreInfo = useCallback((entityId: string) => {
    setSelectedEntity(entityId);
  }, []);
  
  const handleCloseMoreInfo = useCallback(() => {
    setSelectedEntity(null);
  }, []);
  
  // Responsive columns
  const [maxColumns, setMaxColumns] = useState(12);
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setMaxColumns(6); // Mobile: 6 columns
      } else if (width < 1024) {
        setMaxColumns(12); // Tablet: 12 columns
      } else {
        setMaxColumns(config.max_columns || 12); // Desktop: configured or 12
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [config.max_columns]);
  
  return (
    <div 
      className="lovelace-view min-h-screen"
      style={{
        backgroundColor: 'var(--primary-background-color)',
        background: config.background,
      }}
    >
      <div className="max-w-7xl mx-auto p-4">
        <LovelaceHeader
          title={config.title}
          connected={hass.connected}
          onRefresh={handleRefresh}
        />
        
        <LovelaceGrid
          key={refreshKey}
          cards={config.cards}
          hass={hass}
          maxColumns={maxColumns}
          dense={config.dense}
          onMoreInfo={handleMoreInfo}
        />
      </div>
      
      {/* More Info Dialog */}
      <MoreInfoDialog
        entityId={selectedEntity}
        hass={hass}
        onClose={handleCloseMoreInfo}
      />
    </div>
  );
}

// ============================================
// Exported Component with Providers
// ============================================

export function LovelaceView({ config }: LovelaceViewProps) {
  return (
    <ThemeProvider>
      <LovelaceViewContent config={config} />
    </ThemeProvider>
  );
}

export default LovelaceView;
