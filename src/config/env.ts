// Environment Configuration
// Extended environment variables for faber_webAdmin

const env = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001',
  
  // Tenant Configuration
  DEFAULT_TENANT: process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'everyone',
  
  // Feature Flags
  ENABLE_SOCKET: process.env.NEXT_PUBLIC_ENABLE_SOCKET === 'true',
  ENABLE_TELEMETRY: process.env.NEXT_PUBLIC_ENABLE_TELEMETRY === 'true',
  
  // Debug
  DEBUG_MODE: process.env.NODE_ENV === 'development',
};

export default env;
