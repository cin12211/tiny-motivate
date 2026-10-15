<script setup lang="ts">
import 'vue-sonner/style.css'

// The splash plays once per app start (web reload or native launch).
const splash = ref(true)
useNativeShell()

// Use the accent cached on this device right away (the server copy loads with the user).
const { settings } = useSettings()
onMounted(() => applyAccent(settings.value.accent))
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
