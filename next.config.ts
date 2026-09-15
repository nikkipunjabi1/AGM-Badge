import type { NextConfig } from 'next';

/**
 * Static export (ADR-008). There are no server routes, so `npm run build` produces a
 * folder of plain files that any host will serve — see docs/DEPLOYMENT.md.
 */
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
