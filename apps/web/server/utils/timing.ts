import type { H3Event } from 'h3'

/**
 * Measure a step of a request and report it in the `Server-Timing` header
 * (visible in the browser devtools Network tab), e.g. `auth;dur=12.3`.
 */
export async function timed<T>(event: H3Event, name: string, run: () => Promise<T>): Promise<T> {
  const start = performance.now()
  try {
    return await run()
  }
  finally {
    const dur = (performance.now() - start).toFixed(1)
    const prev = event.node.res.getHeader('Server-Timing')
    event.node.res.setHeader('Server-Timing', prev ? `${prev}, ${name};dur=${dur}` : `${name};dur=${dur}`)
  }
}
