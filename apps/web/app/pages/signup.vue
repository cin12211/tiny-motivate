<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const { t } = useI18n()
useHead({ title: () => `${t('auth.titleSignupPage')} · Motivation` })
</script>

<template>
  <AuthForm mode="signup" />
</template>
