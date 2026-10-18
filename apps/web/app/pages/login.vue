<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const { t } = useI18n()
useHead({ title: () => `${t('auth.titleLoginPage')} · Tiny Motivate` })
</script>

<template>
  <AuthForm mode="login" />
</template>
