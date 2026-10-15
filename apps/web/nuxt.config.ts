import tailwindcss from '@tailwindcss/vite'
import { ALL_ICONS } from './app/utils/icon-names'

/**
 * NUXT_MOBILE=1 → static SPA for the Capacitor shell (apps/mobile).
 * The native app then talks to the Nitro API at NUXT_PUBLIC_API_BASE.
 */
const isMobile = !!process.env.NUXT_MOBILE

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },
  // The app is client-rendered: auth lives in a bearer token on the device,
  // and the same bundle ships inside the Capacitor app.
  ssr: false,
  modules: ['shadcn-nuxt', '@nuxt/icon', '@nuxtjs/i18n'],
  i18n: {
    // Language is a user setting (Settings page), not part of the URL.
    strategy: 'no_prefix',
    defaultLocale: 'vi',
    locales: [
      { code: 'vi', language: 'vi-VN', name: 'Tiếng Việt', file: 'vi.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: false,
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },
  icon: {
    // Bundle the Hugeicons we use into the client so icons work offline in the app.
    clientBundle: { icons: ALL_ICONS, scan: true, sizeLimitKb: 512 },
    serverBundle: { collections: ['hugeicons'] },
    provider: 'none',
    // put icon CSS in a layer so Tailwind size-* utilities can override the 1em default
    cssLayer: 'base',
  },
  app: {
    head: {
      title: 'Motivation',
      htmlAttrs: { lang: 'vi' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#E6E5EA' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  // JSON database + uploads live in ./data — keep them out of the file watcher
  ignore: ['data/**'],
  nitro: {
    watchOptions: { ignored: ['**/data/**'] },
  },
  runtimeConfig: {
    dataDir: './data',
    public: {
      /** Empty on the web (same origin). Set to the server URL for the mobile build. */
      apiBase: '',
      mobile: isMobile,
    },
  },
})
