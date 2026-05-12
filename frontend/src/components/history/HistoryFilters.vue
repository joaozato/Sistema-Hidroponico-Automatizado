<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import HistoryTimeRange, { type TimeRangeOption } from '@/components/history/HistoryTimeRange.vue'
import type { Carreira } from '@/components/home/types'

const props = defineProps<{
  timeRanges: TimeRangeOption[]
  selectedRange: string
  carreiras: Carreira[]
  selectedCarreiraId: number | null
}>()

const emit = defineEmits<{
  'update:selectedRange': [value: string]
  'update:selectedCarreiraId': [value: number | null]
}>()

const activeCarreiraLabel = computed(() => {
  if (props.selectedCarreiraId === null) {
    return 'Todas as carreiras'
  }

  return props.carreiras.find((item) => item.id === props.selectedCarreiraId)?.nome ?? 'Carreira'
})
</script>

<template>

  <section class="mt-6">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-foreground">Período</h2>
      <HistoryTimeRange :model-value="props.selectedRange" :options="props.timeRanges"
        @update:model-value="emit('update:selectedRange', $event)" />
    </div>
    <div class="mt-3">
      <div class="flex gap-2 overflow-x-auto pb-2">
        <Button variant="ghost" size="sm"
          class="h-10 shrink-0 rounded-full px-4 text-sm font-semibold border border-neutral-200 bg-background shadow-sm transition-all duration-200 active:translate-y-0.5 active:shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.1),inset_0_2px_4px_-2px_rgba(0,0,0,0.1)]"
          :class="props.selectedCarreiraId === null
            ? 'bg-muted/60 text-foreground shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.1),inset_0_2px_4px_-2px_rgba(0,0,0,0.1)] translate-y-0.5'
            : 'text-muted-foreground'" @click="emit('update:selectedCarreiraId', null)">
          Todas
        </Button>
        <Button v-for="carreira in props.carreiras" :key="carreira.id" variant="ghost" size="sm"
          class="h-10 shrink-0 rounded-full px-4 text-sm font-semibold border border-neutral-200 bg-background shadow-sm transition-all duration-200 active:translate-y-0.5 active:shadow-[inset_0_2px_4px_-1px_rgba(0,0,0,0.1),inset_0_2px_4px_-2px_rgba(0,0,0,0.1)]"
          :class="props.selectedCarreiraId === carreira.id
            ? 'bg-muted/60 text-foreground shadow-[inset_0_2px_4px_-1px_rgba(0,0,0,0.1),inset_0_2px_4px_-2px_rgba(0,0,0,0.1)] translate-y-0.5'
            : 'text-muted-foreground'" @click="emit('update:selectedCarreiraId', carreira.id)">
          {{ carreira.nome }}
        </Button>
      </div>
    </div>
  </section>
</template>
