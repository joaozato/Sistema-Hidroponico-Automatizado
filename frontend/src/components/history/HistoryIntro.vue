<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
  }>(),
  {
    title: 'Histórico',
    subtitle: 'Relatório do sistema e exportação rápida dos dados.',
  },
)
</script>

<template>
  <section class="mt-5">
    <h1 class="text-xl font-semibold leading-tight tracking-tight">{{ props.title }}</h1>
    <p class="text-sm leading-relaxed text-muted-foreground">
      {{ props.subtitle }}
    </p>
  </section>
</template>
