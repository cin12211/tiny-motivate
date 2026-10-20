import { FOREST, VIEWBOX, iconById } from './index.ts'
import { MASCOT_POSES, MASCOT_STROKE, type MascotPose } from './mascot.ts'

/**
 * The 20 app logos offered in Settings (design v58i / v59d), in this order:
 * Germi standing (the default logo), the forest, 11 plants, 2 mood flowers
 * and Germi's 5 other poses.
 */
export const LOGO_IDS = [
  'gm-idle', 'forest', 'p1', 'p2', 'p4', 'p5', 'p7', 'p10', 'p12', 'p13', 'p21', 'p23', 'p28', 'm2', 'm5',
  'gm-wave', 'gm-cheer', 'gm-gift', 'gm-sleepy', 'gm-sprout',
] as const

/** Germi logos are cropped to the mascot and drawn 2.4× thicker so they read as an icon. */
export const GERMI_LOGO_VIEWBOX = '6 10 88 88'
const GERMI_LOGO_STROKE = 2.4

export interface LogoIcon {
  viewBox: string
  /** Inner SVG markup in currentColor. */
  body: string
  /** Garden drawings sit on a ground line near the bottom and look better nudged up a little. */
  ground: boolean
}

/**
 * Markup for a logo id ("forest", "p4", "m2", "gm-wave"…). `fill` sets the
 * colour inside Germi's gift box (the tile background); by default it uses
 * the CSS variable `--gm-fill`.
 */
export function logoIcon(id: string, fill?: string): LogoIcon | undefined {
  if (id.startsWith('gm-')) {
    const pose = MASCOT_POSES[id.slice(3) as MascotPose]
    if (!pose) return undefined
    const thick = pose.replace(/stroke-width="([\d.]+)"/g, (_, w) => `stroke-width="${(Number(w) * GERMI_LOGO_STROKE).toFixed(2)}"`)
    const filled = thick.replace(/var\(--gm-fill,var\(--paper\)\)/g, fill ?? 'var(--gm-fill, var(--m-tile))')
    return {
      viewBox: GERMI_LOGO_VIEWBOX,
      body: `<g fill="none" stroke="currentColor" stroke-width="${(MASCOT_STROKE * GERMI_LOGO_STROKE).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round">${filled}</g>`,
      ground: false,
    }
  }
  const icon = id === 'forest' ? FOREST : iconById(id)
  return icon ? { viewBox: VIEWBOX, body: icon.body, ground: true } : undefined
}
