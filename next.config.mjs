/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack optimizasyonları (Next.js 15+)
  turbopack: {
    resolveAlias: {
      '@': './app',
    },
    // Workspace root tanımla
    root: process.cwd(),
  },
  // Experimental optimizasyonlar
  experimental: {
    // CSS optimizasyonu
    optimizeCss: true,
  },
  // Compiler optimizasyonları
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Prefetch optimizasyonu
  reactStrictMode: true,
  // Cross-origin uyarısını kaldır
  allowedDevOrigins: ['31.40.199.71'],
  // Development için optimizasyonlar
  devIndicators: {
    position: 'bottom-right',
  },
  // Daha hızlı rebuild için
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
