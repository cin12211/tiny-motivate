<script setup lang="ts">
/**
 * Splash loading screen shown on the first page load only.
 * It is server-rendered so it paints instantly, then fades out once the app
 * has hydrated (with a short minimum so the mascot is actually seen).
 */
const visible = useState('splash-visible', () => true)
const leaving = ref(false)

onMounted(() => {
  if (!visible.value) return
  setTimeout(() => {
    leaving.value = true
    setTimeout(() => (visible.value = false), 400)
  }, 1400)
})
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background transition-opacity duration-400"
    :class="leaving ? 'opacity-0' : 'opacity-100'"
    role="status"
    aria-live="polite"
  >
    <div class="relative">
      <div class="absolute inset-x-6 -bottom-1 h-4 rounded-full bg-black/5 blur-[2px]" />
      <Mochi pose="waving" :size="168" class="splash-bounce" />
    </div>
    <h1 class="text-4xl text-green">motivation</h1>
    <div class="h-4 w-56 overflow-hidden rounded-full bg-line">
      <div class="splash-bar h-full rounded-full bg-green" />
    </div>
    <p class="label-caps">Mochi đang chuẩn bị mục tiêu của bạn…</p>
  </div>
</template>

<style scoped>
.splash-bounce {
  animation: splash-bounce 1s cubic-bezier(.3, 1.6, .5, 1) infinite alternate;
  transform-origin: 50% 100%;
}
@keyframes splash-bounce {
  from { transform: translateY(0) scale(1.03, .97); }
  to { transform: translateY(-14px) scale(.98, 1.02); }
}
.splash-bar {
  animation: splash-fill 1.4s ease-out forwards;
  box-shadow: inset 0 -4px 0 var(--m-green-dark);
}
@keyframes splash-fill {
  from { width: 8%; }
  to { width: 100%; }
}
</style>
