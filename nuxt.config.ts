import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },
  modules: ['shadcn-nuxt', '@nuxt/icon'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },
  icon: {
    serverBundle: { collections: ['hugeicons'] },
    // put icon CSS in a layer so Tailwind size-* utilities can override the 1em default
    cssLayer: 'base',
  },
  app: {
    head: {
      title: 'Motivation',
      htmlAttrs: { lang: 'vi' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#58CC02' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800;900&display=swap' },
      ],
    },
  },
  // JSON database + uploads live in ./data — keep them out of the file watcher
  ignore: ['data/**'],
  nitro: {
    watchOptions: { ignored: ['**/data/**'] },
  },
  runtimeConfig: {
    dataDir: './data',
  },
})
