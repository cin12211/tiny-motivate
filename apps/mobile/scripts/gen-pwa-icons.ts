/**
 * Generate the web app (PWA) icons into apps/web/public from the default logo
 * (Germi standing, ink accent): white tile, accent icon - same look as the iOS icon.
 *   pwa-192.png, pwa-512.png        any purpose
 *   pwa-maskable-512.png            extra padding for Android masks
 *   apple-touch-icon.png (180px)    iOS "Add to Home Screen"
 *
 * Run: pnpm --filter @motivation/mobile pwa-icons
 */
import { join } from 'node:path'
import sharp from 'sharp'
import { logoIcon } from '@motivation/garden'
import { ACCENTS, DEFAULT_SETTINGS } from '../../web/shared/utils/settings.ts'

const OUT = join(import.meta.dirname, '..', '..', 'web', 'public')
const { viewBox, body, ground } = logoIcon(DEFAULT_SETTINGS.logo, '#FFFFFF')!
const [vx, vy, vw] = viewBox.split(' ').map(Number) as [number, number, number]
const fg = ACCENTS[DEFAULT_SETTINGS.accent]!.light

function render(px: number, fill: number) {
  const scale = (px * fill) / vw
  const offset = (px - vw * scale) / 2
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}">
  <rect width="${px}" height="${px}" fill="#FFFFFF"/>
  <g transform="translate(${offset - vx * scale} ${offset - vy * scale - (ground ? vw * 0.047 : 0) * scale}) scale(${scale})" style="color:${fg}">${body}</g>
</svg>`
  return sharp(Buffer.from(svg)).removeAlpha().png()
}

await render(192, 0.84).toFile(join(OUT, 'pwa-192.png'))
await render(512, 0.84).toFile(join(OUT, 'pwa-512.png'))
await render(512, 0.62).toFile(join(OUT, 'pwa-maskable-512.png'))
await render(180, 0.84).toFile(join(OUT, 'apple-touch-icon.png'))
console.log('wrote PWA icons to apps/web/public')
