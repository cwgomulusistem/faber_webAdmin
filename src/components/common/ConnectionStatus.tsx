'use client';

import React from 'react';
import { useSocket } from '@/hooks/useSocket';

export function ConnectionStatus() {
  const { isConnected, isInitializing } = useSocket();
  
  // During initialization, show "Bağlanıyor" state
  if (isInitializing && !isConnected) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">Bağlanıyor</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1.5">
      {isConnected ? (
        <>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-green-600 dark:text-green-400">Çevrimiçi</span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs font-semibold text-red-600">Çevrimdışı</span>
        </>
      )}
    </div>
  );
}

export default ConnectionStatus;
