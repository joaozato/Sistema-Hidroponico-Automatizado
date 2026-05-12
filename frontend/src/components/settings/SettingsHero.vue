<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold tracking-tight leading-tight">{{ title }}</h1>
    <p class="text-sm leading-relaxed text-muted-foreground">{{ subtitle }}</p>
  </div>
</template>
