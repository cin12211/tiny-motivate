<script setup lang="ts">
import "vue-sonner/style.css";

// Loading screen: shown while the app boots, gone once the first page has rendered
// (the auth check and the layout's goal fetch run before that).
// (not on the public landing page, which should show its content straight away)
const splash = ref(!["/landing-page", "/privacy"].includes(useRoute().path));
const nuxtApp = useNuxtApp();
nuxtApp.hooks.hookOnce("page:finish", () => {
  splash.value = false;
});
nuxtApp.hooks.hookOnce("app:error", () => {
  splash.value = false;
});
useNativeShell();

// Use the accent cached on this device right away (the server copy loads with the user).
const { settings } = useSettings();
onMounted(() => {
  applyAccent(settings.value.accent);
  applyTheme(settings.value.theme);
});

// Favicon follows the chosen logo, accent and light/dark (one <link>, owned by useHead).
const favicon = ref("/favicon.svg");
const systemDark = ref(false);
onMounted(() => {
  const media = matchMedia("(prefers-color-scheme: dark)");
  systemDark.value = media.matches;
  media.addEventListener("change", (e) => (systemDark.value = e.matches));
  watchEffect(async () => {
    const { accent, logo, theme } = settings.value;
    const dark = theme === "dark" || (theme === "system" && systemDark.value);
    favicon.value = await faviconHref({ accent, logo }, dark);
  });
});
useHead({
  link: [
    {
      key: "favicon",
      rel: "icon",
      type: () =>
        favicon.value.startsWith("/") ||
        favicon.value.startsWith("data:image/svg")
          ? "image/svg+xml"
          : "image/png",
      href: favicon,
    },
  ],
});

// Language follows the user's setting (cached on the device, synced from the server).
const { setLocale } = useI18n();
watch(
  () => settings.value.lang,
  (lang) => setLocale(lang),
  { immediate: true },
);
useHead({ htmlAttrs: { lang: () => settings.value.lang } });
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Transition
    leave-active-class="transition-opacity duration-300"
    leave-to-class="opacity-0"
  >
    <SplashScreen v-if="splash" />
  </Transition>
  <!-- toasts at the top, below the notch / status bar -->
  <Toaster position="top-right" />
</template>
