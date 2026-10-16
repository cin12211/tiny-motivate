/**
 * Generate the iOS app icons from the garden icon set.
 *
 * iOS can only switch the home-screen icon between images bundled in the
 * app, so we pre-render one icon per (accent colour × logo × light/dark):
 * light = white tile, icon in the accent's light colour;
 * dark  = #1F1E27 tile, icon in the accent's dark colour.
 *   AppIcon.appiconset                       – primary icon: default settings (ink, p2 "mầm đôi", light)
 *   AppIcon-<accent>-<logo>.appiconset       – every other light combination
 *   AppIcon-<accent>-<logo>-dark.appiconset  – every dark combination
 *
 * Alternate sets only carry the device sizes (iPhone 60pt @2x/@3x, iPad
 * 76pt @2x, 83.5pt @2x) as small palette PNGs to keep the app size down;
 * the primary set also has the 1024px App Store icon.
 *
 * Run: pnpm --filter @motivation/mobile icons
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { FOREST, MOODS, PLANTS } from '@motivation/garden'
import { ACCENTS, DEFAULT_SETTINGS } from '../../web/shared/utils/settings.ts'

const WHITE = '#FFFFFF'
const DARK_TILE = '#1F1E27'
const ASSETS = join(import.meta.dirname, '..', 'ios', 'App', 'App', 'Assets.xcassets')

const logos = [
  { id: 'forest', body: FOREST.body },
  ...PLANTS.map(p => ({ id: `p${p.id}`, body: p.body })),
  ...MOODS.map(m => ({ id: m.id, body: m.body })),
]

const DEVICE_SIZES = [
  { idiom: 'iphone', size: '60x60', scale: '2x', px: 120 },
  { idiom: 'iphone', size: '60x60', scale: '3x', px: 180 },
  { idiom: 'ipad', size: '76x76', scale: '2x', px: 152 },
  { idiom: 'ipad', size: '83.5x83.5', scale: '2x', px: 167 },
]

function render(body: string, fg: string, bg: string, px: number) {
  // icon drawn at 64% of the tile, centred; strokes scale with it
  const scale = (px * 0.64) / 32
  const offset = (px - 32 * scale) / 2
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}">
  <rect width="${px}" height="${px}" fill="${bg}"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})" style="color:${fg}">${body}</g>
</svg>`
  // iOS icons must be opaque
  return sharp(Buffer.from(svg)).removeAlpha().png({ palette: true, colours: 32 })
}

async function writeSet(name: string, body: string, fg: string, bg: string, marketing = false) {
  const dir = join(ASSETS, `${name}.appiconset`)
  await mkdir(dir, { recursive: true })
  const images = []
  for (const s of DEVICE_SIZES) {
    const filename = `${s.idiom}-${s.px}.png`
    await render(body, fg, bg, s.px).toFile(join(dir, filename))
    images.push({ filename, idiom: s.idiom, size: s.size, scale: s.scale })
  }
  if (marketing) {
    await render(body, fg, bg, 1024).toFile(join(dir, 'marketing-1024.png'))
    images.push({ filename: 'marketing-1024.png', idiom: 'ios-marketing', size: '1024x1024', scale: '1x' })
  }
  await writeFile(join(dir, 'Contents.json'), JSON.stringify({ images, info: { author: 'xcode', version: 1 } }, null, 2))
}

// start clean: drop every previously generated icon set
for (const entry of await readdir(ASSETS)) {
  if (entry.startsWith('AppIcon') && entry.endsWith('.appiconset')) await rm(join(ASSETS, entry), { recursive: true })
}

const def = DEFAULT_SETTINGS
await writeSet('AppIcon', logos.find(l => l.id === def.logo)!.body, ACCENTS[def.accent]!.light, WHITE, true)
let count = 1
for (const accent of ACCENTS) {
  for (const logo of logos) {
    await writeSet(`AppIcon-${accent.key}-${logo.id}`, logo.body, accent.light, WHITE)
    await writeSet(`AppIcon-${accent.key}-${logo.id}-dark`, logo.body, accent.dark, DARK_TILE)
    count += 2
  }
}
console.log(`wrote ${count} icon sets`)
