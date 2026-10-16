import tailwindcss from '@tailwindcss/vite'

/**
 * NUXT_MOBILE=1 → static SPA for the Capacitor shell (apps/mobile).
 * The native app then talks to the Nitro API at NUXT_PUBLIC_API_BASE.
 */
const isMobile = !!process.env.NUXT_MOBILE
/** NITRO_PRESET=cloudflare_module → Cloudflare Workers build (see wrangler.jsonc). */
const isCloudflare = (process.env.NITRO_PRESET || '').startsWith('cloudflare')

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },
  // The app is client-rendered: auth lives in a bearer token on the device,
  // and the same bundle ships inside the Capacitor app.
  ssr: false,
  modules: ['shadcn-nuxt', '@nuxtjs/i18n'],
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
  app: {
    head: {
      title: 'Motivation',
      htmlAttrs: { lang: 'vi' },
      meta: [
        // maximum-scale=1 stops iOS from zooming in when an input (font < 16px) gets focus
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#E6E5EA' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  // JSON database + uploads live in ./data — keep them out of the file watcher
  ignore: ['data/**'],
  nitro: {
    watchOptions: { ignored: ['**/data/**'] },
    // Reward photos: Cloudflare R2 (binding BUCKET) when deployed, local disk otherwise.
    storage: {
      uploads: isCloudflare
        ? { driver: 'cloudflare-r2-binding', binding: 'BUCKET' }
        : { driver: 'fs', base: './data/uploads' },
    },
    devStorage: {
      uploads: { driver: 'fs', base: './data/uploads' },
    },
    ...(isCloudflare && {
      cloudflare: { deployConfig: false, nodeCompat: true },
    }),
  },
  runtimeConfig: {
    public: {
      /**
       * Empty on the web (same origin). The mobile build talks to the deployed API;
       * override with NUXT_PUBLIC_API_BASE (e.g. http://localhost:3000 for local dev).
       */
      apiBase: isMobile ? 'https://motivation.taccin03.workers.dev' : '',
      mobile: isMobile,
    },
  },
})
