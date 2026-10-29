<script setup lang="ts">
const { t } = useI18n()
useHead({ title: () => `${t('create.pageTitle')} · Tiny Motivate` })
</script>

<template>
  <GoalForm />
</template>
