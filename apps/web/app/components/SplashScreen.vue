<script setup lang="ts">
/**
 * Splash / loading gate shown each time the app starts.
 * Seven seeds sprout one after another while Mochi bobs; tap to skip.
 */
const emit = defineEmits<{ done: [] }>()
const seeds = [1, 4, 9, 2, 13, 6, 21]

let timer: ReturnType<typeof setTimeout> | undefined
onMounted(() => {
  timer = setTimeout(() => emit('done'), 3200)
})
onBeforeUnmount(() => clearTimeout(timer))

function skip() {
  clearTimeout(timer)
  emit('done')
}
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-background px-6 pt-10 pb-7 text-indigo"
    role="status"
    aria-live="polite"
    @click="skip"
  >
    <div class="flex flex-col items-center gap-1.5 text-center">
      <div class="animate-bob">
        <Mochi pose="wave" :size="112" />
      </div>
      <TypographyLarge as="h1" class="mt-3.5">motivation</TypographyLarge>
      <TypographyHand as="p">mỗi ngày một mầm nhỏ</TypographyHand>

      <div class="mt-6.5 flex gap-1.5" aria-hidden="true">
        <span v-for="(n, i) in seeds" :key="n" class="relative grid size-[30px] place-items-center" :style="{ '--d': `${(i * 0.28).toFixed(2)}s` }">
          <i class="seed-dot size-1 rounded-full bg-indigo" />
          <GardenIcon :day="n" class="seed-plant absolute inset-0 size-full" />
        </span>
      </div>
      <TypographyMuted as="small" class="mt-3.5 text-[11.5px]">
        đang tưới vườn cho bạn<b class="animate-blink font-normal">.</b><b class="animate-blink font-normal [animation-delay:.2s]">.</b><b class="animate-blink font-normal [animation-delay:.4s]">.</b>
      </TypographyMuted>
    </div>
    <TypographyMuted as="small" class="absolute bottom-[calc(26px+env(safe-area-inset-bottom))] text-[11px] text-faint">chạm để bỏ qua</TypographyMuted>
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
