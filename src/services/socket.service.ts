// Socket Service v2.0 (Compatibility Layer)
// This file re-exports from websocket.service.ts for backward compatibility
// All new code should import directly from websocket.service.ts

import { webSocketService } from './websocket.service';

export type { 
  DeviceUpdateCallback, 
  ConnectionCallback, 
  MessageCallback,
  TelemetryCallback  // v2.0: Real-time telemetry support
} from './websocket.service';

// Re-export the service with the old name for backward compatibility
export const socketService = webSocketService;
export default webSocketService;
