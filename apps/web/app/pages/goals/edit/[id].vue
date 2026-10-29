<script setup lang="ts">
/** Edit a goal (v72): the create form, prefilled, with received rewards locked. */
const route = useRoute()
const { t } = useI18n()
const { goals, refresh } = useGoals()

const goal = computed(() => goals.value.find(g => g.id === route.params.id))
if (!goal.value) await refresh()
if (!goal.value) throw createError({ statusCode: 404, statusMessage: t('goal.notFound'), fatal: true })

useHead({ title: () => `${t('edit.title')} · Tiny Motivate` })
</script>

<template>
  <!-- keyed: a fresh form whenever another goal is opened -->
  <GoalForm v-if="goal" :key="goal.id" :goal="goal" />
</template>
