/**
 * Generate the iOS app icons from the garden icon set.
 *
 * iOS can only switch the home-screen icon between images bundled in the
 * app, so we pre-render one icon per logo choice:
 *   AppIcon.appiconset            – primary icon (default logo p2 "mầm đôi", white tile + accent icon)
 *   AppIcon-<id>.appiconset       – accent tile + light icon
 *   AppIcon-<id>-inv.appiconset   – light tile + accent icon
 *
 * Run: pnpm --filter @motivation/mobile icons
 */
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { FOREST, MOODS, PLANTS } from '@motivation/garden'

const SIZE = 1024
const ACCENT = '#1A0DC9' // "mực xanh", the default accent
const LIGHT = '#FFFFFF' // white tile for the inverted style
const ASSETS = join(import.meta.dirname, '..', 'ios', 'App', 'App', 'Assets.xcassets')

const icons = [
  { id: 'forest', body: FOREST.body },
  ...PLANTS.map(p => ({ id: `p${p.id}`, body: p.body })),
  ...MOODS.map(m => ({ id: m.id, body: m.body })),
]

function svg(body: string, invert: boolean) {
  const bg = invert ? LIGHT : ACCENT
  const fg = invert ? ACCENT : '#FFFFFF'
  // icon drawn at 64% of the tile, centred; strokes scale with it
  const scale = (SIZE * 0.64) / 32
  const offset = (SIZE - 32 * scale) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="${bg}"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})" style="color:${fg}">${body}</g>
</svg>`
}

async function writeSet(name: string, body: string, invert: boolean) {
  const dir = join(ASSETS, `${name}.appiconset`)
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
  // iOS icons must be opaque: flatten and drop the alpha channel
  await sharp(Buffer.from(svg(body, invert))).flatten({ background: invert ? LIGHT : ACCENT }).removeAlpha().png().toFile(join(dir, 'icon.png'))
  await writeFile(join(dir, 'Contents.json'), JSON.stringify({
    images: [{ filename: 'icon.png', idiom: 'universal', platform: 'ios', size: '1024x1024' }],
    info: { author: 'xcode', version: 1 },
  }, null, 2))
}

await writeSet('AppIcon', PLANTS[1]!.body, true) // p2 inverted, the default logo
for (const icon of icons) {
  await writeSet(`AppIcon-${icon.id}`, icon.body, false)
  await writeSet(`AppIcon-${icon.id}-inv`, icon.body, true)
}
console.log(`wrote ${1 + icons.length * 2} icon sets`)
