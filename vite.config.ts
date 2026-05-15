import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// EDIT BASE PATH:
//   - User site (YOUR_USERNAME.github.io):  base: '/'
//   - Project site (github.com/USER/REPO):  base: '/REPO_NAME/'
export default defineConfig({
  plugins: [react()],
  base: '/',
})
