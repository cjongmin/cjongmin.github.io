import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// EDIT BASE PATH:
//   - User site (YOUR_USERNAME.github.io):  base: '/'
//   - Project site (github.com/USER/REPO):  base: '/REPO_NAME/'
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        // Split stable vendor code from app code so content edits
        // don't invalidate the whole bundle in browser caches.
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
