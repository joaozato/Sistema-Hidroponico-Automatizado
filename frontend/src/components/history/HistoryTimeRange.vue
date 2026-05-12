<script setup lang="ts">
import { Button } from '@/components/ui/button'

export type TimeRangeOption = {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: string
  options: TimeRangeOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="inline-flex rounded-full bg-muted p-1">
    <Button
      v-for="option in props.options"
      :key="option.value"
      size="sm"
      :variant="props.modelValue === option.value ? 'default' : 'ghost'"
      class="h-8 rounded-full px-3 text-xs font-semibold"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </Button>
  </div>
</template>
