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
      open: false,
      allowedHosts: [
        '46.202.176.52',
        "10.10.7.30",
      ],
      proxy: {
        '/uploads': {
          target: apiBase,
          changeOrigin: true,
        },
      },
    },
    // preview: {
    //   host: true,
    //   port: 5175,
    //   allowedHosts: [
    //     '193.46.198.251',
    //     "10.10.7.30",
    //     'localhost',
    //   ],
    // },
    preview: {
      proxy: {
        '/uploads': {
          target: apiBase,
          changeOrigin: true,
        },
      },
      host: true,
      open: false,
      port: 4176,
      allowedHosts: [
        '46.202.176.52',
        "10.10.7.30",
        'localhost',
      ],

    },
  }
  
})
