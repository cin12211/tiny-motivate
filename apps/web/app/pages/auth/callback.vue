<script setup lang="ts">
import { toast } from 'vue-sonner'

/** Landing page after Google sign-in on the web: stores the session token. */
definePageMeta({ layout: 'auth' })
const route = useRoute()
const { t } = useI18n()
const { acceptToken } = useAuth()

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''
  const user = token ? await acceptToken(token) : null
  if (!user) {
    toast(t('auth.errGoogle'))
    return navigateTo('/login', { replace: true })
  }
  toast(t('auth.welcomeBack', { name: user.name }))
  return navigateTo('/', { replace: true })
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 pt-24">
    <Germi pose="wave" :size="84" class="animate-bob" />
    <TypographyMuted>{{ $t('splash.loading') }}…</TypographyMuted>
  </div>
</template>
