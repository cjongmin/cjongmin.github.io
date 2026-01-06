/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  // CRITICAL: Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Support both deployment modes: user/org page and project page
  // For user/org page (e.g., username.github.io): leave NEXT_PUBLIC_BASE_PATH empty
  // For project page (e.g., username.github.io/repo): set NEXT_PUBLIC_BASE_PATH=/repo
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // Add trailing slash for GitHub Pages compatibility
  trailingSlash: true,
};

export default nextConfig;
