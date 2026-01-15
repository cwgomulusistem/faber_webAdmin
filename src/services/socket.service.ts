// Socket Service
// WebSocket connection for real-time device updates

import { io, Socket } from 'socket.io-client';
import env from '../config/env';
import { tokenManager } from './api.service';
import type { Device, DeviceAttributes } from '../types/device.types';

export type DeviceUpdateCallback = (device: Device) => void;
export type ConnectionCallback = (connected: boolean) => void;

class SocketService {
  private socket: Socket | null = null;
  private deviceListeners: Map<string, Set<DeviceUpdateCallback>> = new Map();
  private connectionListeners: Set<ConnectionCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  /**
   * Initialize socket connection
   */
  connect(): void {
    if (this.socket?.connected) return;
    if (!env.ENABLE_SOCKET) return;
    
    const token = tokenManager.getToken();
    if (!token) {
      console.warn('Socket: No auth token available');
      return;
    }
    
    this.socket = io(env.SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });
    
    this.setupEventHandlers();
  }
  
  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.deviceListeners.clear();
    this.connectionListeners.clear();
  }
  
  /**
   * Setup socket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('Socket: Connected');
      this.reconnectAttempts = 0;
      this.notifyConnectionListeners(true);
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('Socket: Disconnected -', reason);
      this.notifyConnectionListeners(false);
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket: Connection error -', error.message);
      this.reconnectAttempts++;
    });
    
    // Device state updates
    this.socket.on('device:update', (data: { deviceId: string; attributes: DeviceAttributes }) => {
      this.notifyDeviceListeners(data.deviceId, data);
    });
    
    // Device online/offline status
    this.socket.on('device:status', (data: { deviceId: string; isOnline: boolean }) => {
      this.notifyDeviceListeners(data.deviceId, data);
    });
  }
  
  /**
   * Subscribe to device updates
   */
  subscribeToDevice(deviceId: string, callback: DeviceUpdateCallback): () => void {
    if (!this.deviceListeners.has(deviceId)) {
      this.deviceListeners.set(deviceId, new Set());
      // Tell server we want updates for this device
      this.socket?.emit('device:subscribe', { deviceId });
    }
    
    this.deviceListeners.get(deviceId)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.deviceListeners.get(deviceId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.deviceListeners.delete(deviceId);
          this.socket?.emit('device:unsubscribe', { deviceId });
        }
      }
    };
  }
  
  /**
   * Subscribe to connection status
   */
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionListeners.add(callback);
    
    // Immediately notify current state
    if (this.socket) {
      callback(this.socket.connected);
    }
    
    return () => {
      this.connectionListeners.delete(callback);
    };
  }
  
  /**
   * Notify device listeners
   */
  private notifyDeviceListeners(deviceId: string, data: Partial<Device>): void {
    const listeners = this.deviceListeners.get(deviceId);
    if (listeners) {
      listeners.forEach((callback) => callback(data as Device));
    }
  }
  
  /**
   * Notify connection listeners
   */
  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach((callback) => callback(connected));
  }
  
  /**
   * Subscribe to entities
   */
  subscribeToEntities(callback: (data: any) => void) {
      if (!this.socket) return;
      
      this.socket.on('entity_update', callback);
      
      this.socket.emit('subscribe_entities', {}, (response: any) => {
          if (response?.success) {
               // Initial state could be handled here or via a separate callback if needed
               // For now, we rely on the caller to handle the initial result if they want
          }
      });
      
      return () => {
          this.socket?.off('entity_update', callback);
      };
  }

  /**
   * Call a service
   */
  async callService(domain: string, service: string, serviceData?: any, targetId?: string): Promise<boolean> {
      if (!this.socket) return false;
      return new Promise((resolve) => {
          this.socket!.emit('call_service', {
              domain,
              service,
              service_data: serviceData,
              target: targetId ? { entity_id: targetId } : undefined
          }, (response: any) => {
              resolve(response?.success || false);
          });
      });
  }

  /**
   * Get initial entities
   */
  getEntities(): Promise<any[]> {
      if (!this.socket) return Promise.resolve([]);
      return new Promise((resolve) => {
          this.socket!.emit('subscribe_entities', {}, (response: any) => {
               if(response?.success) {
                   resolve(response.result);
               } else {
                   resolve([]);
               }
          });
      });
  }

  /**
   * Check if socket is connected
   */
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;
