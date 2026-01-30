// WebSocket Service v3.0
// Native WebSocket implementation with reconnection and event emitter
// Compatible with Faber Backend v3.0 Enterprise Architecture
// Features: Room-based broadcasting, State restoration, Graceful shutdown handling
// v3.0: Entity-based messaging, Device discovery, Online/Offline status

import env from '../config/env';
import { tokenManager } from './api.service';
import type { Device, DeviceAttributes } from '../types/device.types';
import type { 
  DeviceEntity, 
  EntityUpdatePayload,
  DeviceDiscoveredPayload,
  DeviceOfflinePayload 
} from '../types/entity.types';

// Message types (must match backend v3.0)
type MessageType =
  | 'entity_update'           // v3.0: Entity value change
  | 'device_update'
  | 'device_telemetry'        // Real-time telemetry from ESP32 devices
  | 'device_discovered'       // v3.0: New device announces entities
  | 'device_offline'          // v3.0: LWT - device went offline
  | 'device_online'           // v3.0: Device came back online
  | 'dashboard:layout_updated'
  | 'SHUTDOWN'                // Graceful server shutdown notification
  | 'result'
  | 'error'
  | 'command'
  | 'subscribe_entities'
  | 'call_service'
  | 'join:home'               // Join home room for room-based broadcasts
  | 'leave:home'              // Leave home room
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

// Telemetry payload from ESP32 devices
interface TelemetryPayload {
  deviceId: string;
  topic: string;
  payload: Record<string, unknown>;
}

// v3.0: Callback types for entity-based messaging
export type EntityUpdateCallback = (data: EntityUpdatePayload) => void;
export type DeviceDiscoveredCallback = (deviceId: string, entities: DeviceEntity[]) => void;
export type DeviceOfflineCallback = (deviceId: string) => void;
export type DeviceOnlineCallback = (deviceId: string) => void;

export type DeviceUpdateCallback = (device: Device) => void;
export type TelemetryCallback = (data: TelemetryPayload) => void;
export type ConnectionCallback = (connected: boolean) => void;
export type MessageCallback = (payload: unknown) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageListeners: Map<string, Set<MessageCallback>> = new Map();
  private deviceListeners: Map<string, Set<DeviceUpdateCallback>> = new Map();
  private telemetryListeners: Map<string, Set<TelemetryCallback>> = new Map(); // Per-device telemetry
  private globalTelemetryListeners: Set<TelemetryCallback> = new Set(); // All telemetry
  private connectionListeners: Set<ConnectionCallback> = new Set();
  
  // v3.0: Entity-based listeners
  private entityUpdateListeners: Map<string, Set<EntityUpdateCallback>> = new Map(); // Per-entity
  private globalEntityUpdateListeners: Set<EntityUpdateCallback> = new Set(); // All entities
  private discoveryListeners: Set<DeviceDiscoveredCallback> = new Set();
  private offlineListeners: Set<DeviceOfflineCallback> = new Set();
  private onlineListeners: Set<DeviceOnlineCallback> = new Set();
  
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

  // Auth token for connection
  private authToken: string | null = null;

  /**
   * Initialize WebSocket connection
   * v3.1: Token sent via auth message after connection (NOT in URL for security)
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
    this.authToken = token;
    
    // Build WebSocket URL (NO token in URL - security)
    const wsUrl = this.buildWebSocketUrl();
    
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
   * v3.1: Token NOT included in URL (sent via auth message)
   */
  private buildWebSocketUrl(): string {
    const baseUrl = env.SOCKET_URL || env.API_URL;
    // Convert http(s) to ws(s)
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = baseUrl.replace(/^https?:\/\//, '');
    return `${wsProtocol}://${wsHost}/ws`;
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
      console.log('WebSocket: Connected, sending auth...');
      
      // v3.1: Send auth message with token (NOT in URL for security)
      if (this.authToken) {
        this.ws?.send(JSON.stringify({
          type: 'auth',
          payload: { token: this.authToken }
        }));
      }
      
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
      
      // Handle real-time telemetry from ESP32 devices
      // Telemetry is room-based - only received if joined to the device's home
      if (message.type === 'device_telemetry') {
        const data = message.payload as TelemetryPayload;
        if (data?.deviceId) {
          this.notifyTelemetryListeners(data.deviceId, data);
        }
      }
      
      // v3.0: Handle entity value updates
      if (message.type === 'entity_update') {
        const data = message.payload as EntityUpdatePayload;
        if (data?.entityId) {
          this.notifyEntityUpdateListeners(data.entityId, data);
        }
      }
      
      // v3.0: Handle device discovery (new device announces capabilities)
      if (message.type === 'device_discovered') {
        const data = message.payload as DeviceDiscoveredPayload;
        if (data?.deviceId && data?.entities) {
          console.log('WebSocket: Device discovered:', data.deviceId, 'with', data.entities.length, 'entities');
          this.notifyDiscoveryListeners(data.deviceId, data.entities);
        }
      }
      
      // v3.0: Handle device offline (LWT)
      if (message.type === 'device_offline') {
        const data = message.payload as DeviceOfflinePayload;
        if (data?.deviceId) {
          console.log('WebSocket: Device went offline:', data.deviceId);
          this.notifyOfflineListeners(data.deviceId);
        }
      }
      
      // v3.0: Handle device online
      if (message.type === 'device_online') {
        const data = message.payload as { deviceId: string };
        if (data?.deviceId) {
          console.log('WebSocket: Device came online:', data.deviceId);
          this.notifyOnlineListeners(data.deviceId);
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
   * Notify telemetry listeners
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
   * Notify entity update listeners (v3.0)
   */
  private notifyEntityUpdateListeners(entityId: string, data: EntityUpdatePayload): void {
    // Notify entity-specific listeners
    const listeners = this.entityUpdateListeners.get(entityId);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
    
    // Notify global entity update listeners
    this.globalEntityUpdateListeners.forEach((callback) => callback(data));
  }
  
  /**
   * Notify discovery listeners (v3.0)
   */
  private notifyDiscoveryListeners(deviceId: string, entities: DeviceEntity[]): void {
    this.discoveryListeners.forEach((callback) => callback(deviceId, entities));
  }
  
  /**
   * Notify offline listeners (v3.0)
   */
  private notifyOfflineListeners(deviceId: string): void {
    this.offlineListeners.forEach((callback) => callback(deviceId));
  }
  
  /**
   * Notify online listeners (v3.0)
   */
  private notifyOnlineListeners(deviceId: string): void {
    this.onlineListeners.forEach((callback) => callback(deviceId));
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
   * Subscribe to all telemetry from joined home
   * NOTE: You must join a home room first to receive telemetry
   */
  onAllTelemetry(callback: TelemetryCallback): () => void {
    this.globalTelemetryListeners.add(callback);
    return () => {
      this.globalTelemetryListeners.delete(callback);
    };
  }
  
  // =========================================
  // v3.0 Entity-Based Subscription Methods
  // =========================================
  
  /**
   * Subscribe to updates for a specific entity (v3.0)
   * @param entityId Entity identifier (e.g., "relay_1")
   */
  onEntityUpdate(entityId: string, callback: EntityUpdateCallback): () => void {
    if (!this.entityUpdateListeners.has(entityId)) {
      this.entityUpdateListeners.set(entityId, new Set());
    }
    this.entityUpdateListeners.get(entityId)!.add(callback);
    
    return () => {
      const listeners = this.entityUpdateListeners.get(entityId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.entityUpdateListeners.delete(entityId);
        }
      }
    };
  }
  
  /**
   * Subscribe to all entity updates from joined home (v3.0)
   * NOTE: You must join a home room first to receive updates
   */
  onAllEntityUpdates(callback: EntityUpdateCallback): () => void {
    this.globalEntityUpdateListeners.add(callback);
    return () => {
      this.globalEntityUpdateListeners.delete(callback);
    };
  }
  
  /**
   * Subscribe to device discovery events (v3.0)
   * Called when a new device announces its capabilities
   */
  onDeviceDiscovered(callback: DeviceDiscoveredCallback): () => void {
    this.discoveryListeners.add(callback);
    return () => {
      this.discoveryListeners.delete(callback);
    };
  }
  
  /**
   * Subscribe to device offline events (v3.0)
   * Called when LWT indicates device disconnected
   */
  onDeviceOffline(callback: DeviceOfflineCallback): () => void {
    this.offlineListeners.add(callback);
    return () => {
      this.offlineListeners.delete(callback);
    };
  }
  
  /**
   * Subscribe to device online events (v3.0)
   * Called when device reconnects
   */
  onDeviceOnline(callback: DeviceOnlineCallback): () => void {
    this.onlineListeners.add(callback);
    return () => {
      this.onlineListeners.delete(callback);
    };
  }
  
  /**
   * Send a command to an entity (v3.0)
   */
  sendEntityCommand(
    deviceId: string,
    entityId: string,
    command: string | number | boolean
  ): void {
    this.send({
      type: 'command',
      payload: {
        device_id: deviceId,
        entity_id: entityId,
        command: command,
      },
    });
  }
  
  /**
   * Subscribe to any event type by name (PBAC v2.0)
   * Generic method for subscribing to custom events like PERMISSION_UPDATE
   */
  subscribeToEvent(eventType: string, callback: MessageCallback): () => void {
    return this.on(eventType, callback);
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
