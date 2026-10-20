import { logoIcon } from '@motivation/garden'
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
  const tile = dark ? '#1F1E27' : '#FFFFFF'
  const logo = logoIcon(settings.logo, tile) ?? logoIcon('gm-idle', tile)!
  const [x, y, w] = logo.viewBox.split(' ').map(Number) as [number, number, number]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${w} ${w}">`
    + `<rect width="${w}" height="${w}" rx="${w * 0.2}" fill="${tile}"/>`
    // icon fills ~96% of the tile with a bolder line so it stays readable at 16px;
    // garden drawings sit on a ground line near the bottom, so they are nudged up a little
    + `<g transform="translate(${w * 0.02 - x * 0.96} ${w * 0.02 - y * 0.96 - (logo.ground ? w * 0.047 : 0)}) scale(.96)" style="color:${dark ? accent.dark : accent.light}">${logo.ground ? bolder(logo.body) : logo.body}</g></svg>`
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
