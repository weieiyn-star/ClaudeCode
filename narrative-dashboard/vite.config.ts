import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Set via VITE_BASE in CI for GitHub Pages project-site path (e.g. "/ClaudeCode/").
  // Defaults to "/" for local dev / preview.
  base: process.env.VITE_BASE ?? '/',
  server: { port: 5173, host: true },
})
