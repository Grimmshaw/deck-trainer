import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // The privacy policy is a plain page of its own, not part of the app
      workbox: { navigateFallbackDenylist: [/^\/privacy/] },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'privacy.html'],
      manifest: {
        name: 'Deck Trainer',
        short_name: 'Deck Trainer',
        description: 'Study app for deck officer cadets: Morse, IALA buoyage, lights and shapes, COLREGs, sound signals, flags and distress signals.',
        lang: 'en',
        theme_color: '#0b1d33',
        background_color: '#0b1d33',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
