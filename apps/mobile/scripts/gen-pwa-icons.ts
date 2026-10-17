/**
 * Generate the web app (PWA) icons into apps/web/public from the default logo
 * (p2 "mầm đôi", ink accent): white tile, accent icon - same look as the iOS icon.
 *   pwa-192.png, pwa-512.png        any purpose
 *   pwa-maskable-512.png            extra padding for Android masks
 *   apple-touch-icon.png (180px)    iOS "Add to Home Screen"
 *
 * Run: pnpm --filter @motivation/mobile pwa-icons
 */
import { join } from 'node:path'
import sharp from 'sharp'
import { iconById } from '@motivation/garden'
import { ACCENTS, DEFAULT_SETTINGS } from '../../web/shared/utils/settings.ts'

const OUT = join(import.meta.dirname, '..', '..', 'web', 'public')
const body = iconById(DEFAULT_SETTINGS.logo)!.body
const fg = ACCENTS[DEFAULT_SETTINGS.accent]!.light

function render(px: number, fill: number) {
  const scale = (px * fill) / 32
  const offset = (px - 32 * scale) / 2
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}">
  <rect width="${px}" height="${px}" fill="#FFFFFF"/>
  <g transform="translate(${offset} ${offset - 1.5 * scale}) scale(${scale})" style="color:${fg}">${body}</g>
</svg>`
  return sharp(Buffer.from(svg)).removeAlpha().png()
}

await render(192, 0.84).toFile(join(OUT, 'pwa-192.png'))
await render(512, 0.84).toFile(join(OUT, 'pwa-512.png'))
await render(512, 0.62).toFile(join(OUT, 'pwa-maskable-512.png'))
await render(180, 0.84).toFile(join(OUT, 'apple-touch-icon.png'))
console.log('wrote PWA icons to apps/web/public')
