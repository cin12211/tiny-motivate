<script setup lang="ts">
import 'vue-sonner/style.css'

// The splash plays once per app start (web reload or native launch).
const splash = ref(true)
useNativeShell()
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Transition leave-active-class="transition-opacity duration-300" leave-to-class="opacity-0">
    <SplashScreen v-if="splash" @done="splash = false" />
  </Transition>
  <Toaster position="bottom-center" />
</template>
