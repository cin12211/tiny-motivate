<script setup lang="ts">
import type { Reward } from '#shared/types'

/**
 * Celebration popup.
 * - mode "done": the day was ticked (plain cheer).
 * - mode "reward": a reward just unlocked → tap to open the gift.
 */
const props = defineProps<{ mode: 'done' | 'reward', reward?: Reward | null, streak?: number }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ opened: [reward: Reward] }>()

const revealed = ref(false)
watch(open, (v) => {
  if (v) {
    revealed.value = false
    burst()
  }
})

async function burst() {
  if (import.meta.server) return
  const confetti = (await import('canvas-confetti')).default
  const colors = ['#58CC02', '#1CB0F6', '#FFC800', '#FF4B4B', '#FF8FA3']
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors, zIndex: 9999 })
}

function reveal() {
  revealed.value = true
  burst()
  if (props.reward) emit('opened', props.reward)
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-[340px] text-center" :show-close-button="false">
      <template v-if="mode === 'done'">
        <Mochi pose="happy" :size="130" class="mx-auto animate-pop" />
        <DialogTitle class="text-[26px] font-black text-green">Tuyệt vời!</DialogTitle>
        <DialogDescription class="text-base font-bold">
          Bạn đã hoàn thành hôm nay.<template v-if="streak && streak > 1"> Chuỗi {{ streak }} ngày liên tiếp!</template>
        </DialogDescription>
        <Button size="lg" class="mt-2 w-full" @click="open = false">Tiếp tục</Button>
      </template>

      <template v-else-if="reward">
        <template v-if="!revealed">
          <Mochi pose="gift" :size="140" class="mx-auto animate-pop" />
          <DialogTitle class="text-[26px] font-black text-green">Mở khoá phần thưởng!</DialogTitle>
          <DialogDescription class="text-base font-bold">
            Bạn đã đủ {{ reward.day }} ngày. Mochi có quà cho bạn nè.
          </DialogDescription>
          <Button variant="gold" size="lg" class="mt-2 w-full" @click="reveal">
            <Icon name="hugeicons:gift" /> Mở quà
          </Button>
        </template>
        <template v-else>
          <div class="mx-auto grid size-36 animate-pop place-items-center overflow-hidden rounded-3xl border-[3px] border-yellow bg-yellow-soft text-orange">
            <RewardBadge :reward="reward" icon-class="size-16" />
          </div>
          <DialogTitle class="text-[26px] font-black text-green">{{ reward.title }}</DialogTitle>
          <DialogDescription class="text-base font-bold">Tự thưởng cho mình thôi! Bạn xứng đáng mà.</DialogDescription>
          <Button size="lg" class="mt-2 w-full" @click="open = false">Nhận quà</Button>
        </template>
      </template>
    </DialogContent>
  </Dialog>
</template>
