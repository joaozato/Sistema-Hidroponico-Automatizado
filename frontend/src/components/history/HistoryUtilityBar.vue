<script setup lang="ts">
import type { Component } from 'vue'

export type UtilityAction = {
  id: string
  label: string
  icon: Component
}

const props = defineProps<{
  actions: UtilityAction[]
}>()

const emit = defineEmits<{
  action: [id: string]
}>()
</script>

<template>
  <div class="grid grid-cols-3 gap-3">
    <button
      v-for="action in props.actions"
      :key="action.id"
      type="button"
      class="flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-2 py-2 text-[11px] font-semibold leading-tight text-foreground shadow-sm transition hover:bg-muted/40"
      :aria-label="action.label"
      @click="emit('action', action.id)"
    >
      <component :is="action.icon" class="size-5 text-muted-foreground" />
      <span class="text-center leading-tight whitespace-normal">{{ action.label }}</span>
    </button>
  </div>
</template>
