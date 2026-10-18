/**
 * Export the garden plants and the hand-drawn icons as template images for the
 * iOS widget (ios/App/TinyMotivateWidget/Assets.xcassets). Template images are
 * tinted by SwiftUI with the accent colour, so one black-on-clear PNG per icon.
 *   plant-p1 … plant-p55   garden plants (32px grid)
 *   hand-<name>            hand-drawn UI / goal / farm icons (24px grid)
 *
 * Run: pnpm --filter @motivation/mobile widget-icons
 */
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { HAND_ICONS, HAND_VIEWBOX, PLANTS, VIEWBOX } from '@motivation/garden'

const ASSETS = join(import.meta.dirname, '..', 'ios', 'App', 'TinyMotivateWidget', 'Assets.xcassets')

async function writeIcon(name: string, body: string, viewBox: string, pt: number) {
  const dir = join(ASSETS, `${name}.imageset`)
  await mkdir(dir, { recursive: true })
  const images = []
  for (const scale of [2, 3]) {
    const px = pt * scale
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="${viewBox}" style="color:#000">${body}</svg>`
    const filename = `${name}@${scale}x.png`
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(dir, filename))
    images.push({ idiom: 'universal', filename, scale: `${scale}x` })
  }
  await writeFile(join(dir, 'Contents.json'), JSON.stringify({
    images, info: { author: 'xcode', version: 1 }, properties: { 'template-rendering-intent': 'template' },
  }, null, 2))
}

await rm(ASSETS, { recursive: true, force: true })
await mkdir(ASSETS, { recursive: true })
await writeFile(join(ASSETS, 'Contents.json'), JSON.stringify({ info: { author: 'xcode', version: 1 } }, null, 2))
for (const p of PLANTS) await writeIcon(`plant-p${p.id}`, p.body, VIEWBOX, 56)
for (const [name, body] of Object.entries(HAND_ICONS)) await writeIcon(`hand-${name}`, body, HAND_VIEWBOX, 24)
console.log(`wrote ${PLANTS.length + Object.keys(HAND_ICONS).length} widget icons`)
