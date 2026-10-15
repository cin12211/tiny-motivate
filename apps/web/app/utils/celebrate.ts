/** Indigo confetti burst (skipped when the user prefers reduced motion). */
export async function confettiBurst() {
  if (import.meta.server || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const confetti = (await import('canvas-confetti')).default
  const indigo = getComputedStyle(document.documentElement).getPropertyValue('--m-indigo').trim() || '#1A0DC9'
  confetti({
    particleCount: 140,
    spread: 80,
    origin: { y: 0.6 },
    colors: [indigo, '#4B3FE0', '#8C84F0', '#B9B4F5'],
    zIndex: 9999,
  })
}
