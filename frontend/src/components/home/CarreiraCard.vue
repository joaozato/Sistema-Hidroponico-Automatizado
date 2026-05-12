<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertCircleIcon,
  CloudIcon,
  DropletIcon,
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

// card puxa a carreira do store para evitar prop drilling
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
      'relative !overflow-visible shrink-0 cursor-pointer snap-center select-none rounded-2xl gap-2 py-4 border transition-all duration-300 ease-out active:translate-y-0.5 active:shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.1),inset_0_2px_4px_-2px_rgba(0,0,0,0.1)]',
      expanded
        ? 'w-72 bg-neutral-50 shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.1),inset_0_2px_4px_-2px_rgba(0,0,0,0.1)] translate-y-0.5'
        : 'w-40 shadow-md bg-card',
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

    <CardHeader class="px-4 pb-1 pt-0">
      <CardTitle class="text-sm font-semibold text-foreground">{{ carreira.nome }}</CardTitle>
    </CardHeader>

    <CardContent class="h-full px-4 pt-0">
      <div class="flex h-full items-stretch gap-3" :class="{ 'justify-center': !expanded }">
        <div class="w-28 shrink-0 flex items-center justify-center rounded-xl border border-neutral-200 bg-background p-2">
          <div class="grid grid-cols-2 place-items-center gap-2">
            <StrawberryIcon v-for="i in 8" :key="i" class="size-6 text-destructive" />
          </div>
        </div>

        <div
          v-show="expanded"
          class="flex-1 flex flex-col justify-between rounded-xl border border-border bg-background p-3 animate-in fade-in zoom-in duration-300"
        >
          <div v-for="stat in stats" :key="stat.label" class="flex items-center gap-3">
            <component :is="stat.icon" :class="['size-6 shrink-0', stat.color]" fill="currentColor" />

            <div class="leading-none">
              <div :class="['text-xl font-bold tabular-nums tracking-tight', stat.color]">
                {{ stat.value }}
              </div>
              <div :class="['text-[11px] -mt-0.5 font-semibold uppercase opacity-90', stat.color]">
                {{ stat.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
