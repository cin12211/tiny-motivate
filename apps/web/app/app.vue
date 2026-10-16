<script setup lang="ts">
import 'vue-sonner/style.css'

// Loading screen: shown while the app boots, gone once the first page has rendered
// (the auth check and the layout's goal fetch run before that).
const splash = ref(true)
const nuxtApp = useNuxtApp()
nuxtApp.hooks.hookOnce('page:finish', () => { splash.value = false })
nuxtApp.hooks.hookOnce('app:error', () => { splash.value = false })
useNativeShell()

// Use the accent cached on this device right away (the server copy loads with the user).
const { settings } = useSettings()
onMounted(() => {
  applyAccent(settings.value.accent)
  applyTheme(settings.value.theme)
})

// Language follows the user's setting (cached on the device, synced from the server).
const { setLocale } = useI18n()
watch(() => settings.value.lang, lang => setLocale(lang), { immediate: true })
useHead({ htmlAttrs: { lang: () => settings.value.lang } })
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Transition leave-active-class="transition-opacity duration-300" leave-to-class="opacity-0">
    <SplashScreen v-if="splash" />
  </Transition>
  <Toaster position="bottom-center" />
</template>
