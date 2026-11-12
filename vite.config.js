
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.ico'
      ],

      manifest: {
        name: 'TaskFlow',
        short_name: 'TaskFlow',
        description: 'PWA-застосунок для керування завданнями та проєктами',
        theme_color: '#7952b3',
        background_color: '#f8f6fc',
        display: 'standalone',
        start_url: '/',
        scope: '/',

        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp}'
        ],

        navigateFallback: '/index.html',

        cleanupOutdatedCaches: true,

        clientsClaim: true,
        skipWaiting: true
      }
    })
  ]
})
