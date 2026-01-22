import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compiler optimizasyonları
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  experimental: {
    // lucide-react tree-shaking - sadece kullanılan ikonları bundle'a ekle
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
