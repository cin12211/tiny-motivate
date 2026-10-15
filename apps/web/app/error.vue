<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
</script>

<template>
  <div class="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background p-6 text-center">
    <Mochi pose="sleepy" :size="110" />
    <TypographyH1>{{ props.error.statusCode === 404 ? 'không tìm thấy trang' : 'có lỗi xảy ra' }}</TypographyH1>
    <TypographyMuted>{{ props.error.statusMessage || props.error.message }}</TypographyMuted>
    <Button class="mt-2" @click="clearError({ redirect: '/' })">về trang chủ</Button>
  </div>
</template>
