import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react-datepicker',
      'date-fns' // React-datepicker dependency
    ]
  },
  server: {
    hmr: true,
    watch: {
      usePolling: true
    }
  }
})
