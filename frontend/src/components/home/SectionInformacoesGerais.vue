<script setup lang="ts">
import GeneralInfoGrid from './GeneralInfoGrid.vue'

const props = withDefaults(
  defineProps<{
    title?: string
  }>(),
  {
    title: 'Informações Gerais',
  },
)
</script>

<template>
  <section>
    <h2 class="mb-3 text-lg font-semibold tracking-tight text-foreground">{{ props.title }}</h2>
    <GeneralInfoGrid />
  </section>
</template>
