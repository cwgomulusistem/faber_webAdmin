import type { HassEntity, HassContext } from '@/types/hass';

// ============================================
// WebSocket Message Types
// ============================================

interface WebSocketMessage {
  type: string;
  id?: number;
  [key: string]: any;
}

interface StateChangedEvent {
  entity_id: string;
  old_state: HassEntity | null;
  new_state: HassEntity | null;
}

interface AuthMessage {
  type: 'auth';
  access_token: string;
}

interface SubscribeEventsMessage {
  type: 'subscribe_events';
  id: number;
  event_type: string;
}

interface CallServiceMessage {
  type: 'call_service';
  id: number;
  domain: string;
  service: string;
  service_data?: Record<string, any>;
  target?: {
    entity_id?: string | string[];
    device_id?: string | string[];
    area_id?: string | string[];
  };
}

// ============================================
// WebSocket Service Class
// ============================================

type StateCallback = (states: Record<string, HassEntity>) => void;
type ConnectionCallback = (connected: boolean) => void;

interface PendingRequest {
  resolve: (result: any) => void;
  reject: (error: any) => void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private accessToken: string;
  private messageId = 1;
  private isConnected = false;
  private isAuthenticated = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private stateCallbacks: Set<StateCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private pendingRequests: Map<number, PendingRequest> = new Map();
  private states: Record<string, HassEntity> = {};
  private subscriptionId: number | null = null;

  constructor(url: string, accessToken: string) {
    this.url = url;
    this.accessToken = accessToken;
  }

  // ============================================
  // Connection Management
  // ============================================

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data, resolve, reject);
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('[WebSocket] Closed:', event.code, event.reason);
          this.isConnected = false;
          this.isAuthenticated = false;
          this.notifyConnectionChange(false);
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isAuthenticated = false;
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  // ============================================
  // Message Handling
  // ============================================

  private handleMessage(data: string, resolve?: (value: void) => void, reject?: (reason?: any) => void): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);

      switch (message.type) {
        case 'auth_required':
          this.authenticate();
          break;

        case 'auth_ok':
          console.log('[WebSocket] Authenticated');
          this.isAuthenticated = true;
          this.notifyConnectionChange(true);
          this.subscribeToStateChanges();
          this.fetchInitialStates();
          resolve?.();
          break;

        case 'auth_invalid':
          console.error('[WebSocket] Authentication failed:', message.message);
          reject?.(new Error(message.message || 'Authentication failed'));
          break;

        case 'result':
          this.handleResult(message);
          break;

        case 'event':
          this.handleEvent(message);
          break;

        default:
          console.log('[WebSocket] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[WebSocket] Failed to parse message:', error);
    }
  }

  private handleResult(message: WebSocketMessage): void {
    const pending = this.pendingRequests.get(message.id!);
    if (pending) {
      this.pendingRequests.delete(message.id!);
      if (message.success) {
        pending.resolve(message.result);
      } else {
        pending.reject(new Error(message.error?.message || 'Unknown error'));
      }
    }
  }

  private handleEvent(message: WebSocketMessage): void {
    const event = message.event;
    
    if (event?.event_type === 'state_changed') {
      const data = event.data as StateChangedEvent;
      if (data.new_state) {
        this.states[data.entity_id] = data.new_state;
        this.notifyStateChange();
      } else if (data.old_state && !data.new_state) {
        // Entity was removed
        delete this.states[data.entity_id];
        this.notifyStateChange();
      }
    }
  }

  // ============================================
  // Send Messages
  // ============================================

  private send(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[WebSocket] Not connected');
      return;
    }
    this.ws.send(JSON.stringify(message));
  }

  private sendWithResponse<T>(message: Omit<WebSocketMessage, 'id'>): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = this.messageId++;
      this.pendingRequests.set(id, { resolve, reject });
      this.send({ ...message, id } as WebSocketMessage);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 10000);
    });
  }

  private authenticate(): void {
    const authMessage: AuthMessage = {
      type: 'auth',
      access_token: this.accessToken,
    };
    this.ws?.send(JSON.stringify(authMessage));
  }

  private async subscribeToStateChanges(): Promise<void> {
    try {
      const result = await this.sendWithResponse<{ id: number }>({
        type: 'subscribe_events',
        event_type: 'state_changed',
      });
      this.subscriptionId = result.id;
      console.log('[WebSocket] Subscribed to state changes');
    } catch (error) {
      console.error('[WebSocket] Failed to subscribe to state changes:', error);
    }
  }

  private async fetchInitialStates(): Promise<void> {
    try {
      const states = await this.sendWithResponse<HassEntity[]>({
        type: 'get_states',
      });
      
      this.states = {};
      states.forEach(state => {
        this.states[state.entity_id] = state;
      });
      
      console.log(`[WebSocket] Loaded ${states.length} entities`);
      this.notifyStateChange();
    } catch (error) {
      console.error('[WebSocket] Failed to fetch states:', error);
    }
  }

  // ============================================
  // Public API
  // ============================================

  async callService(
    domain: string,
    service: string,
    data?: Record<string, any>,
    target?: { entity_id?: string | string[]; device_id?: string | string[]; area_id?: string | string[] }
  ): Promise<void> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    const message: Omit<CallServiceMessage, 'id'> = {
      type: 'call_service',
      domain,
      service,
      service_data: data,
      target,
    };

    await this.sendWithResponse(message);
  }

  getStates(): Record<string, HassEntity> {
    return { ...this.states };
  }

  getState(entityId: string): HassEntity | undefined {
    return this.states[entityId];
  }

  onStateChange(callback: StateCallback): () => void {
    this.stateCallbacks.add(callback);
    // Immediately call with current states
    callback(this.states);
    return () => {
      this.stateCallbacks.delete(callback);
    };
  }

  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.add(callback);
    callback(this.isConnected && this.isAuthenticated);
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  // ============================================
  // Notifications
  // ============================================

  private notifyStateChange(): void {
    const states = { ...this.states };
    this.stateCallbacks.forEach(callback => {
      try {
        callback(states);
      } catch (error) {
        console.error('[WebSocket] State callback error:', error);
      }
    });
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('[WebSocket] Connection callback error:', error);
      }
    });
  }
}

// ============================================
// Singleton Instance
// ============================================

let instance: WebSocketService | null = null;

export function getWebSocketService(url?: string, accessToken?: string): WebSocketService {
  if (!instance && url && accessToken) {
    instance = new WebSocketService(url, accessToken);
  }
  if (!instance) {
    throw new Error('WebSocket service not initialized');
  }
  return instance;
}

export function initWebSocketService(url: string, accessToken: string): WebSocketService {
  if (instance) {
    instance.disconnect();
  }
  instance = new WebSocketService(url, accessToken);
  return instance;
}

export default WebSocketService;
