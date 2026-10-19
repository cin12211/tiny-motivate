import { VIEWBOX, iconById } from '@motivation/garden'
import type { UserSettings } from '#shared/types'
import { ACCENTS } from '#shared/utils/settings'

/**
 * Browser tab icon = the user's app logo, drawn like the iOS icon:
 * light = white tile + accent icon, dark = #1F1E27 tile + the accent's dark colour.
 * Returned as a PNG data URL (rendered through a canvas) because not every
 * browser accepts SVG favicons. app.vue feeds it to useHead.
 */
/** Every stroke ×1.375 (the hand-drawn 1.31 line becomes 1.8) so it reads at 16px. */
function bolder(body: string) {
  return body.replace(/stroke-width="([\d.]+)"/g, (_, w) => `stroke-width="${(Number(w) * 1.375).toFixed(2)}"`)
}

export async function faviconHref(settings: Pick<UserSettings, 'accent' | 'logo'>, dark: boolean, px = 64) {
  const accent = ACCENTS[settings.accent] ?? ACCENTS[0]!
  const body = iconById(settings.logo)?.body ?? iconById('p2')!.body
  const w = Number(VIEWBOX.split(' ')[2]) // 32
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${w} ${w}">`
    + `<rect width="${w}" height="${w}" rx="${w * 0.2}" fill="${dark ? '#1F1E27' : '#FFFFFF'}"/>`
    // icon fills ~96% of the tile with a bolder line so it stays readable at 16px;
    // nudged up 1.5 units because the garden drawings sit on a ground line near the bottom
    + `<g transform="translate(${w * 0.02} ${w * 0.02 - 1.5}) scale(.96)" style="color:${dark ? accent.dark : accent.light}">${bolder(body)}</g></svg>`
  const svgUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`
  try {
    const img = new Image()
    img.src = svgUrl
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = px
    canvas.getContext('2d')!.drawImage(img, 0, 0, px, px)
    return canvas.toDataURL('image/png')
  }
  catch {
    return svgUrl
  }
}
