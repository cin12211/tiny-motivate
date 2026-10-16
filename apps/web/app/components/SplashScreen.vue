<script setup lang="ts">
/**
 * Loading screen shown while the app starts (auth check, settings, first page data).
 * app.vue removes it as soon as the first page has rendered.
 * Seven seeds sprout one after another while Mochi bobs.
 */
const seeds = [1, 4, 9, 2, 13, 6, 21]
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background px-6 pt-10 pb-7 text-indigo"
    role="status"
    aria-live="polite"
  >
    <div class="flex flex-col items-center gap-1.5 text-center">
      <div class="animate-bob">
        <Mochi pose="wave" :size="112" />
      </div>
      <TypographyLarge as="h1" class="mt-3.5">motivation</TypographyLarge>
      <TypographyHand as="p">{{ $t('splash.tagline') }}</TypographyHand>

      <div class="mt-6.5 flex gap-1.5" aria-hidden="true">
        <span v-for="(n, i) in seeds" :key="n" class="relative grid size-[30px] place-items-center" :style="{ '--d': `${(i * 0.28).toFixed(2)}s` }">
          <i class="seed-dot size-1 rounded-full bg-indigo" />
          <GardenIcon :day="n" class="seed-plant absolute inset-0 size-full" />
        </span>
      </div>
      <TypographyMuted as="small" class="mt-3.5 text-[11.5px]">
        {{ $t('splash.loading') }}<b class="animate-blink font-normal">.</b><b class="animate-blink font-normal [animation-delay:.2s]">.</b><b class="animate-blink font-normal [animation-delay:.4s]">.</b>
      </TypographyMuted>
    </div>
  </div>
</template>

<style scoped>
.seed-dot {
  opacity: 0.5;
  animation: dot 3s var(--d) infinite;
}
.seed-plant {
  transform-origin: 50% 90%;
  transform: scale(0);
  opacity: 0;
  animation: grow 3s var(--d) infinite;
}
@keyframes dot {
  0% { opacity: 0.5; transform: scale(1); }
  12%, 80% { opacity: 0; transform: scale(0); }
  100% { opacity: 0.5; transform: scale(1); }
}
@keyframes grow {
  0% { transform: scale(0); opacity: 0; }
  14% { transform: scale(1.1); opacity: 1; }
  20%, 80% { transform: scale(1); opacity: 1; }
  92%, 100% { transform: scale(0); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .seed-plant { transform: none; opacity: 1; animation: none; }
  .seed-dot { opacity: 0; animation: none; }
}
</style>
