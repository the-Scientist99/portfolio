import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ponytail: base is './' so the same build works on GitHub Pages project
// sites, Vercel, Netlify, or a plain file:// open. No per-host config.
export default defineConfig({
  base: './',
  plugins: [react()],
})
