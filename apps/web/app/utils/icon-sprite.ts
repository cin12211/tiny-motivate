const SVG_NS = 'http://www.w3.org/2000/svg'
const added = new Set<string>()
let sprite: SVGSVGElement | null = null

/**
 * Shared SVG sprite: each icon's markup goes into the page once, as a
 * <symbol>, the first time it is used; every icon on screen is then a single
 * <use> pointing at it instead of its own copy of the paths (v-html), which
 * keeps the DOM small and skips re-parsing markup on every render.
 */
export function iconHref(id: string, viewBox: string, body: string | undefined) {
  if (!body) return ''
  if (!added.has(id) && typeof document !== 'undefined') {
    added.add(id)
    if (!sprite) {
      sprite = document.createElementNS(SVG_NS, 'svg')
      sprite.setAttribute('aria-hidden', 'true')
      sprite.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden')
      document.body.prepend(sprite)
    }
    const symbol = document.createElementNS(SVG_NS, 'symbol')
    symbol.id = id
    symbol.setAttribute('viewBox', viewBox)
    // hand-drawn strokes may poke out of the 24px box, like before
    symbol.setAttribute('overflow', 'visible')
    symbol.innerHTML = body
    sprite.appendChild(symbol)
  }
  return `#${id}`
}
