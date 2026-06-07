<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertCircleIcon,
  CloudIcon,
  DropletIcon,
  MinusIcon,
  PlusIcon,
  ZapIcon,
} from 'lucide-vue-next'
import { createLucideIcon } from 'lucide-vue-next'
import { strawberry } from '@lucide/lab'
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/stores/home'
import type { StatItem } from './types'

const props = defineProps<{
  carreiraId: number
}>()

const homeStore = useHomeStore()
const { carreiras, selectedCarreiraId } = storeToRefs(homeStore)

const carreira = computed(() => carreiras.value.find((c) => c.id === props.carreiraId))
const expanded = computed(() => selectedCarreiraId.value === props.carreiraId)

const StrawberryIcon = createLucideIcon('strawberry', strawberry as any)

const stats = computed<StatItem[]>(() => [
  ...(carreira.value
    ? [
        { label: 'pH', value: carreira.value.ph.toFixed(1), icon: DropletIcon, color: 'text-amber-500' },
        { label: 'EC', value: carreira.value.ec.toFixed(1), icon: ZapIcon, color: 'text-rose-500' },
        { label: 'Umidade', value: `${carreira.value.umidade}%`, icon: CloudIcon, color: 'text-emerald-500' },
      ]
    : []),
])

const onToggle = () => {
  homeStore.toggleCarreira(props.carreiraId)
}
</script>

<template>
  <Card
    v-if="carreira"
    @click="onToggle"
    :class="[
      'relative !overflow-visible w-full cursor-pointer select-none rounded-2xl border py-3 transition-all duration-300 ease-out active:translate-y-0.5 active:shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.1),inset_0_2px_4px_-2px_rgba(0,0,0,0.1)]',
      expanded
        ? 'bg-neutral-50 shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.1),inset_0_2px_4px_-2px_rgba(0,0,0,0.1)] translate-y-0.5'
        : 'shadow-md bg-card',
      carreira.status === 'alerta'
        ? 'ring-2 ring-destructive/30 border-destructive/40'
        : 'border-neutral-200',
    ]"
  >
    <div
      v-if="carreira.status === 'alerta'"
      class="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-lg border border-destructive/30 bg-background text-destructive shadow-sm"
    >
      <AlertCircleIcon class="size-4" />
    </div>

    <CardHeader :class="['px-4', expanded ? 'pt-3' : 'py-3']">
      <div class="flex items-center gap-3">
        <div class="flex size-14 items-center justify-center rounded-2xl border border-neutral-200 bg-background p-2">
          <div class="grid grid-cols-2 gap-1">
            <StrawberryIcon v-for="i in 4" :key="i" class="size-4 text-destructive" />
          </div>
        </div>

        <div class="flex-1">
          <CardTitle class="text-lg font-semibold text-foreground">{{ carreira.nome }}</CardTitle>
          <div class="mt-1 flex gap-2 text-sm font-semibold text-foreground">
            <div class="text-amber-500">pH {{ carreira.ph.toFixed(1) }}</div>
            <div class="text-rose-500">EC {{ carreira.ec.toFixed(1) }}</div>
          </div>
        </div>

        <div
          class="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm"
          aria-hidden="true"
        >
          <component :is="expanded ? MinusIcon : PlusIcon" class="size-4" />
        </div>
      </div>
    </CardHeader>

    <CardContent v-show="expanded" class="px-4">
      <div class="grid grid-cols-3 gap-3 rounded-xl border border-border bg-background p-4 animate-in fade-in zoom-in duration-300">
        <div v-for="stat in stats" :key="stat.label" class="flex items-center gap-2">
          <component :is="stat.icon" :class="['size-5 shrink-0', stat.color]" fill="currentColor" />
          <div class="leading-none">
            <div :class="['text-base font-bold tabular-nums tracking-tight', stat.color]">
              {{ stat.value }}
            </div>
            <div :class="['text-[10px] -mt-0.5 font-semibold uppercase opacity-90', stat.color]">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
