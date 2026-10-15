import type { CapacitorConfig } from '@capacitor/cli'

/**
 * The native apps load the static SPA produced by `pnpm mobile:build`
 * (apps/web → `NUXT_MOBILE=1 nuxt generate`). API calls go to the Nitro
 * server configured through NUXT_PUBLIC_API_BASE at generate time.
 *
 * Live reload while developing: set CAP_SERVER_URL=http://<your-LAN-IP>:3000
 * and run `pnpm --filter @motivation/mobile sync`.
 */
const liveUrl = process.env.CAP_SERVER_URL

const config: CapacitorConfig = {
  appId: 'app.motivation.mochi',
  appName: 'Motivation',
  webDir: '../web/.output/public',
  backgroundColor: '#E6E5EA',
  server: liveUrl ? { url: liveUrl, cleartext: true } : { androidScheme: 'https' },
  ios: { contentInset: 'never' },
  // Prototype backend runs over plain http (e.g. http://192.168.x.x:3000); allow it until the API has https.
  android: { allowMixedContent: true },
}

export default config
