// WebSocket Service v2.0
// Native WebSocket implementation with reconnection and event emitter
// Compatible with Faber Backend v2.0 Enterprise Architecture
// Features: Room-based broadcasting, State restoration, Graceful shutdown handling

import env from '../config/env';
import { tokenManager } from './api.service';
import type { Device, DeviceAttributes } from '../types/device.types';

// Message types (must match backend v2.0)
type MessageType =
  | 'entity_update'
  | 'device_update'
  | 'device_telemetry'      // Real-time telemetry from ESP32 devices
  | 'dashboard:layout_updated'
  | 'SHUTDOWN'              // Graceful server shutdown notification
  | 'result'
  | 'error'
  | 'command'
  | 'subscribe_entities'
  | 'call_service'
  | 'join:home'             // Join home room for room-based broadcasts
  | 'leave:home'            // Leave home room
  | 'device:subscribe'
  | 'device:unsubscribe';

interface WebSocketMessage {
  type: MessageType | string;
  payload?: unknown;
}

interface ResultPayload {
  success: boolean;
  result?: unknown;
  error?: string;
}

interface ShutdownPayload {
  reason: string;
  retry_in: number;
}

// Telemetry payload from ESP32 devices (v2.0)
interface TelemetryPayload {
  deviceId: string;
  topic: string;
  payload: Record<string, unknown>;
}

export type DeviceUpdateCallback = (device: Device) => void;
export type TelemetryCallback = (data: TelemetryPayload) => void;
export type ConnectionCallback = (connected: boolean) => void;
export type MessageCallback = (payload: unknown) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageListeners: Map<string, Set<MessageCallback>> = new Map();
  private deviceListeners: Map<string, Set<DeviceUpdateCallback>> = new Map();
  private telemetryListeners: Map<string, Set<TelemetryCallback>> = new Map(); // v2.0: Per-device telemetry
  private globalTelemetryListeners: Set<TelemetryCallback> = new Set(); // v2.0: All telemetry
  private connectionListeners: Set<ConnectionCallback> = new Set();
  
  // Reconnection state
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000; // 1 second
  private maxReconnectDelay = 30000; // 30 seconds
  private reconnectTimeout: NodeJS.Timeout | null = null;
  
  // Server shutdown handling (v2.0: Graceful shutdown support)
  private isServerShutdown = false;
  private serverSuggestedDelay = 5000;
  
  // Message queue for offline messages
  private messageQueue: WebSocketMessage[] = [];
  private isConnecting = false;
  
  // Pending requests (for request-response pattern)
  private pendingRequests: Map<string, { resolve: (value: unknown) => void; reject: (error: Error) => void }> = new Map();
  private requestId = 0;
  
  // State restoration - track active subscriptions for auto-rejoin on reconnect (v2.0)
  private currentHomeId: string | null = null;
  private subscribedDevices: Set<string> = new Set();

  /**
   * Initialize WebSocket connection
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;
    if (!env.ENABLE_SOCKET) return;
    
    const token = tokenManager.getToken();
    if (!token) {
      console.warn('WebSocket: No auth token available');
      return;
    }
    
    this.isConnecting = true;
    
    // Build WebSocket URL with token as query parameter
    const wsUrl = this.buildWebSocketUrl(token);
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket: Failed to create connection', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }
  
  /**
   * Build WebSocket URL from API URL
   */
  private buildWebSocketUrl(token: string): string {
    const baseUrl = env.SOCKET_URL || env.API_URL;
    // Convert http(s) to ws(s)
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = baseUrl.replace(/^https?:\/\//, '');
    return `${wsProtocol}://${wsHost}/ws?token=${encodeURIComponent(token)}`;
  }
  
  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.messageQueue = [];
    this.deviceListeners.clear();
    this.connectionListeners.clear();
    this.messageListeners.clear();
    
    // Clear state restoration tracking (full disconnect, not reconnect)
    this.currentHomeId = null;
    this.subscribedDevices.clear();
  }
  
  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;
    
    this.ws.onopen = () => {
      console.log('WebSocket: Connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.isServerShutdown = false;
      this.notifyConnectionListeners(true);
      
      // State restoration: Auto-rejoin home room if we were in one before disconnect
      if (this.currentHomeId) {
        console.log('WebSocket: Restoring home subscription:', this.currentHomeId);
        this.send({ type: 'join:home', payload: { homeId: this.currentHomeId } });
      }
      
      // State restoration: Re-subscribe to devices we were watching
      for (const deviceId of this.subscribedDevices) {
        console.log('WebSocket: Restoring device subscription:', deviceId);
        this.send({ type: 'device:subscribe', payload: { deviceId } });
      }
      
      // Send queued messages
      this.flushMessageQueue();
    };
    
    this.ws.onclose = (event) => {
      console.log('WebSocket: Disconnected -', event.code, event.reason);
      this.isConnecting = false;
      this.notifyConnectionListeners(false);
      
      // Don't reconnect if manually disconnected
      if (event.code !== 1000) {
        this.scheduleReconnect();
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket: Error -', error);
      this.isConnecting = false;
    };
    
    this.ws.onmessage = (event) => {
      this.handleMessage(event);
    };
  }
  
  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      // Handle server shutdown gracefully
      if (message.type === 'SHUTDOWN') {
        const payload = message.payload as ShutdownPayload;
        console.log('WebSocket: Server restarting, will reconnect in', payload.retry_in, 'seconds');
        this.isServerShutdown = true;
        this.serverSuggestedDelay = (payload.retry_in || 5) * 1000;
        return;
      }
      
      // Handle result messages (for request-response pattern)
      if (message.type === 'result') {
        // Results are handled by the emit listeners
      }
      
      // Emit to type-specific listeners
      this.emit(message.type, message.payload);
      
      // Handle device updates specifically
      if (message.type === 'device_update' || message.type === 'device:update') {
        const data = message.payload as { deviceId: string; attributes: DeviceAttributes };
        if (data?.deviceId) {
          this.notifyDeviceListeners(data.deviceId, data);
        }
      }
      
      // v2.0: Handle real-time telemetry from ESP32 devices
      // Telemetry is room-based - only received if joined to the device's home
      if (message.type === 'device_telemetry') {
        const data = message.payload as TelemetryPayload;
        if (data?.deviceId) {
          this.notifyTelemetryListeners(data.deviceId, data);
        }
      }
      
    } catch (error) {
      console.error('WebSocket: Failed to parse message', error);
    }
  }
  
  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket: Max reconnect attempts reached');
      return;
    }
    
    let delay: number;
    
    if (this.isServerShutdown) {
      // Use server-suggested delay to prevent thundering herd
      delay = this.serverSuggestedDelay;
      this.isServerShutdown = false;
      console.log('WebSocket: Using server-suggested delay:', delay, 'ms');
    } else {
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
      delay = Math.min(
        this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
        this.maxReconnectDelay
      );
    }
    
    this.reconnectAttempts++;
    console.log(`WebSocket: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }
  
  /**
   * Send a message to the server
   */
  private send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later
      this.messageQueue.push(message);
      // Try to connect if not already
      if (!this.isConnecting && !this.ws) {
        this.connect();
      }
    }
  }
  
  /**
   * Subscribe to a specific message type
   */
  on(type: string, callback: MessageCallback): () => void {
    if (!this.messageListeners.has(type)) {
      this.messageListeners.set(type, new Set());
    }
    this.messageListeners.get(type)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.messageListeners.get(type);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.messageListeners.delete(type);
        }
      }
    };
  }
  
  /**
   * Emit to type-specific listeners
   */
  private emit(type: string, payload: unknown): void {
    const listeners = this.messageListeners.get(type);
    if (listeners) {
      listeners.forEach((callback) => callback(payload));
    }
  }
  
  /**
   * Subscribe to device updates
   */
  subscribeToDevice(deviceId: string, callback: DeviceUpdateCallback): () => void {
    if (!this.deviceListeners.has(deviceId)) {
      this.deviceListeners.set(deviceId, new Set());
      this.subscribedDevices.add(deviceId); // Track for state restoration on reconnect
      // Tell server we want updates for this device
      this.send({ type: 'device:subscribe', payload: { deviceId } });
    }
    
    this.deviceListeners.get(deviceId)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.deviceListeners.get(deviceId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.deviceListeners.delete(deviceId);
          this.subscribedDevices.delete(deviceId); // Remove from tracking
          this.send({ type: 'device:unsubscribe', payload: { deviceId } });
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
    if (this.ws) {
      callback(this.ws.readyState === WebSocket.OPEN);
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
   * Notify telemetry listeners (v2.0)
   */
  private notifyTelemetryListeners(deviceId: string, data: TelemetryPayload): void {
    // Notify device-specific listeners
    const listeners = this.telemetryListeners.get(deviceId);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
    
    // Notify global telemetry listeners
    this.globalTelemetryListeners.forEach((callback) => callback(data));
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
  subscribeToEntities(callback: (data: unknown) => void): () => void {
    // Subscribe to entity updates
    const unsubscribe = this.on('entity_update', callback);
    
    // Request initial entities
    this.send({ type: 'subscribe_entities', payload: {} });
    
    return unsubscribe;
  }
  
  /**
   * Call a service
   */
  async callService(domain: string, service: string, serviceData?: unknown, targetId?: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Subscribe to result temporarily
      const unsubscribe = this.on('result', (payload) => {
        const result = payload as ResultPayload;
        unsubscribe();
        resolve(result?.success || false);
      });
      
      this.send({
        type: 'call_service',
        payload: {
          domain,
          service,
          service_data: serviceData,
          target: targetId ? { entity_id: targetId } : undefined
        }
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, 10000);
    });
  }
  
  /**
   * Get initial entities
   */
  getEntities(): Promise<unknown[]> {
    return new Promise((resolve) => {
      // Subscribe to result temporarily
      const unsubscribe = this.on('result', (payload) => {
        const result = payload as ResultPayload;
        unsubscribe();
        if (result?.success) {
          resolve(result.result as unknown[]);
        } else {
          resolve([]);
        }
      });
      
      this.send({ type: 'subscribe_entities', payload: {} });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        unsubscribe();
        resolve([]);
      }, 10000);
    });
  }
  
  /**
   * Join a home room for updates
   */
  joinHome(homeId: string): void {
    this.currentHomeId = homeId; // Track for state restoration on reconnect
    this.send({ type: 'join:home', payload: { homeId } });
    console.log('WebSocket: Joining home', homeId);
  }
  
  /**
   * Leave a home room
   */
  leaveHome(homeId: string): void {
    if (this.currentHomeId === homeId) {
      this.currentHomeId = null; // Clear tracked home
    }
    this.send({ type: 'leave:home', payload: { homeId } });
    console.log('WebSocket: Leaving home', homeId);
  }
  
  /**
   * Subscribe to dashboard updates
   */
  onDashboardUpdate(callback: (homeId: string) => void): () => void {
    return this.on('dashboard:layout_updated', (payload) => {
      const data = payload as { homeId: string };
      callback(data.homeId);
    });
  }
  
  /**
   * Subscribe to telemetry for a specific device (v2.0)
   * NOTE: You must join the device's home room first to receive telemetry
   */
  onDeviceTelemetry(deviceId: string, callback: TelemetryCallback): () => void {
    if (!this.telemetryListeners.has(deviceId)) {
      this.telemetryListeners.set(deviceId, new Set());
    }
    this.telemetryListeners.get(deviceId)!.add(callback);
    
    return () => {
      const listeners = this.telemetryListeners.get(deviceId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.telemetryListeners.delete(deviceId);
        }
      }
    };
  }
  
  /**
   * Subscribe to all telemetry from joined home (v2.0)
   * NOTE: You must join a home room first to receive telemetry
   */
  onAllTelemetry(callback: TelemetryCallback): () => void {
    this.globalTelemetryListeners.add(callback);
    return () => {
      this.globalTelemetryListeners.delete(callback);
    };
  }
  
  /**
   * Check if WebSocket is connected
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
  
  /**
   * Get current home ID (v2.0)
   */
  get currentHome(): string | null {
    return this.currentHomeId;
  }
  
  /**
   * Reconnect with new token (after refresh)
   */
  reconnectWithNewToken(): void {
    this.disconnect();
    this.connect();
  }
  
  /**
   * Subscribe to state changes (for useHass compatibility)
   * Returns all states when any entity updates
   */
  onStateChange(callback: (states: Record<string, unknown>) => void): () => void {
    return this.on('entity_update', (payload) => {
      const data = payload as { entityId: string; new_state: unknown };
      // Build a states object with the updated entity
      const states: Record<string, unknown> = {};
      states[data.entityId] = data.new_state;
      callback(states);
    });
  }
  
  /**
   * Connect with Promise return (for useHass compatibility)
   */
  connectAsync(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);
      
      const unsubscribe = this.onConnectionChange((connected) => {
        if (connected) {
          clearTimeout(timeout);
          unsubscribe();
          resolve();
        }
      });
      
      this.connect();
    });
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;

// Export class for type usage
export { WebSocketService };

// Factory function for useHass compatibility
export function initWebSocketService(wsUrl: string, accessToken: string): WebSocketService {
  // Note: This creates a new instance, not using the singleton
  // This is for compatibility with useHass hook that manages its own connection
  const service = new WebSocketService();
  // Override the buildWebSocketUrl method for custom URL
  (service as any).customWsUrl = wsUrl;
  (service as any).customToken = accessToken;
  return service;
}
