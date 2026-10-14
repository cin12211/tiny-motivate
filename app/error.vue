<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
</script>

<template>
  <div class="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
    <Mochi pose="sleepy" :size="150" />
    <h1 class="text-3xl text-green">{{ props.error.statusCode === 404 ? 'Không tìm thấy trang' : 'Có lỗi xảy ra' }}</h1>
    <p class="text-muted-foreground">{{ props.error.statusMessage || props.error.message }}</p>
    <Button size="lg" @click="clearError({ redirect: '/' })">Về trang chủ</Button>
  </div>
</template>
