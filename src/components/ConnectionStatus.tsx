'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useIsConnected, useEntityStore } from '@/stores/entityStore';

interface ConnectionStatusProps {
  className?: string;
  showAlways?: boolean; // Show even when connected
}

type ConnectionState = 'connected' | 'disconnected' | 'reconnecting' | 'error';

/**
 * ConnectionStatus - Shows WebSocket connection state with reconnection feedback
 * 
 * Features:
 * - Exponential backoff visualization (1s, 2s, 4s, 8s... max 30s)
 * - Toast-style notification when connection drops
 * - Stale-while-revalidate: Data remains visible during reconnection
 */
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  className = '', 
  showAlways = false 
}) => {
  const isConnected = useIsConnected();
  const [connectionState, setConnectionState] = useState<ConnectionState>('connected');
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [nextReconnectIn, setNextReconnectIn] = useState(0);
  const [showBanner, setShowBanner] = useState(false);

  // Calculate next reconnect delay using exponential backoff
  const getReconnectDelay = useCallback((attempt: number) => {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds max
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    return delay;
  }, []);

  // Handle connection state changes
  useEffect(() => {
    if (isConnected) {
      setConnectionState('connected');
      setReconnectAttempt(0);
      setNextReconnectIn(0);
      // Hide banner after 2 seconds when reconnected
      const timeout = setTimeout(() => setShowBanner(false), 2000);
      return () => clearTimeout(timeout);
    } else {
      setConnectionState('reconnecting');
      setShowBanner(true);
      setReconnectAttempt((prev) => prev + 1);
    }
  }, [isConnected]);

  // Countdown timer for next reconnect
  useEffect(() => {
    if (connectionState !== 'reconnecting') return;

    const delay = getReconnectDelay(reconnectAttempt);
    setNextReconnectIn(Math.ceil(delay / 1000));

    const interval = setInterval(() => {
      setNextReconnectIn((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [connectionState, reconnectAttempt, getReconnectDelay]);

  // Don't show anything if connected and showAlways is false
  if (isConnected && !showAlways && !showBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      {(showBanner || showAlways) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-4 right-4 z-50 ${className}`}
        >
          <ConnectionBanner
            state={connectionState}
            nextReconnectIn={nextReconnectIn}
            attempt={reconnectAttempt}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==================== SUB-COMPONENTS ====================

interface ConnectionBannerProps {
  state: ConnectionState;
  nextReconnectIn: number;
  attempt: number;
}

const ConnectionBanner: React.FC<ConnectionBannerProps> = ({ 
  state, 
  nextReconnectIn, 
  attempt 
}) => {
  const config = {
    connected: {
      icon: CheckCircle,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-900/90',
      borderColor: 'border-green-500/30',
      title: 'Bağlantı kuruldu',
      subtitle: 'Veriler güncel',
    },
    disconnected: {
      icon: WifiOff,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-900/90',
      borderColor: 'border-red-500/30',
      title: 'Bağlantı koptu',
      subtitle: 'Yeniden bağlanılamadı',
    },
    reconnecting: {
      icon: RefreshCw,
      iconColor: 'text-yellow-400',
      bgColor: 'bg-yellow-900/90',
      borderColor: 'border-yellow-500/30',
      title: 'Yeniden bağlanılıyor...',
      subtitle: nextReconnectIn > 0 
        ? `${nextReconnectIn}sn içinde tekrar deneniyor (${attempt}. deneme)`
        : 'Bağlanıyor...',
    },
    error: {
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-900/90',
      borderColor: 'border-red-500/30',
      title: 'Bağlantı hatası',
      subtitle: 'Lütfen internet bağlantınızı kontrol edin',
    },
  };

  const currentConfig = config[state];
  const Icon = currentConfig.icon;

  return (
    <div 
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl 
        ${currentConfig.bgColor} ${currentConfig.borderColor}
        border backdrop-blur-xl shadow-2xl min-w-[280px]
      `}
    >
      <div className={`${currentConfig.iconColor}`}>
        <Icon 
          size={24} 
          className={state === 'reconnecting' ? 'animate-spin' : ''} 
        />
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-medium text-white">
          {currentConfig.title}
        </p>
        <p className="text-xs text-gray-300">
          {currentConfig.subtitle}
        </p>
      </div>

      {/* Connection quality indicator */}
      {state === 'connected' && (
        <div className="flex gap-0.5">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className="w-1 rounded-full bg-green-400"
              style={{ height: `${bar * 4}px` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== INLINE STATUS INDICATOR ====================

interface InlineConnectionStatusProps {
  className?: string;
}

/**
 * Compact inline connection indicator for headers/sidebars
 */
export const InlineConnectionStatus: React.FC<InlineConnectionStatusProps> = ({ 
  className = '' 
}) => {
  const isConnected = useIsConnected();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`
          w-2 h-2 rounded-full
          ${isConnected ? 'bg-green-500' : 'bg-red-500'}
          ${!isConnected ? 'animate-pulse' : ''}
        `}
      />
      <span className="text-xs text-gray-400">
        {isConnected ? 'Çevrimiçi' : 'Çevrimdışı'}
      </span>
    </div>
  );
};

// ==================== OFFLINE OVERLAY ====================

interface OfflineOverlayProps {
  children: React.ReactNode;
}

/**
 * Wrapper that shows offline indicator over content
 * Uses stale-while-revalidate pattern - content remains visible
 */
export const OfflineOverlay: React.FC<OfflineOverlayProps> = ({ children }) => {
  const isConnected = useIsConnected();

  return (
    <div className="relative">
      {children}
      
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] 
                       flex items-center justify-center z-10 rounded-xl"
          >
            <div className="flex flex-col items-center gap-2 text-center p-4">
              <WifiOff className="text-gray-400" size={32} />
              <p className="text-sm text-gray-300">Bağlantı bekleniyor...</p>
              <p className="text-xs text-gray-500">Veriler eski olabilir</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectionStatus;
