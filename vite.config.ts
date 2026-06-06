import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = env.VITE_API_BASE_URL || 'http://10.10.7.28:5000'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      open: true,
      proxy: {
        '/uploads': {
          target: apiBase,
          changeOrigin: true,
        },
      },
    },
    preview: {
      proxy: {
        '/uploads': {
          target: apiBase,
          changeOrigin: true,
        },
      },
    },
  }
  
})
