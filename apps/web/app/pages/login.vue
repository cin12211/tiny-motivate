<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const { t } = useI18n()
useHead({ title: () => `${t('auth.titleLoginPage')} · Motivation` })
</script>

<template>
  <AuthForm mode="login" />
</template>
