<script setup lang="ts">
import type { Reward } from '#shared/types'

/** "mở quà rồi!" popup shown when a tick unlocks a reward. */
defineProps<{ reward: Reward | null }>()
const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-[320px] justify-items-center gap-3 px-5 py-[22px] text-center" :show-close-button="false">
      <Mochi pose="gift" :size="110" />
      <template v-if="reward">
        <span class="grid size-[120px] place-items-center overflow-hidden rounded-2xl border border-line bg-surface text-indigo">
          <RewardBadge :reward="reward" icon-class="size-14" />
        </span>
        <DialogTitle class="text-[18px]">{{ $t('reward.opened') }}</DialogTitle>
        <DialogDescription as-child>
          <TypographyP class="text-[13px]">
            <i18n-t keypath="reward.kept" tag="span" scope="global"><template #n>{{ reward.day }}</template><template #reward><b class="font-semibold">{{ reward.title }}</b></template></i18n-t>
          </TypographyP>
        </DialogDescription>
      </template>
      <Button class="mt-2 w-full" @click="open = false">{{ $t('reward.claim') }}</Button>
    </DialogContent>
  </Dialog>
</template>
