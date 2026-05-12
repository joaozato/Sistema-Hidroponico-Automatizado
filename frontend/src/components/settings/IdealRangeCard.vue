<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import type { Range } from '@/stores/settings'

type Props = {
  phRange: Range
  ecRange: Range
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:phRange': [value: Range]
  'update:ecRange': [value: Range]
}>()

const formatNumber = (value: number, fractionDigits = 1) =>
  value.toLocaleString('pt-BR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })

const phLabel = computed(() => `${formatNumber(props.phRange[0])}–${formatNumber(props.phRange[1])}`)
const ecLabel = computed(() => `${formatNumber(props.ecRange[0])}–${formatNumber(props.ecRange[1])}`)

const numberOfDigits = (step: number) => {
  const text = String(step)
  const decimals = text.split('.')[1]
  return decimals ? decimals.length : 0
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const parseNumber = (raw: string, fallback: number) => {
  const normalized = raw.replace(',', '.').trim()
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : fallback
}

type ChangedSide = 'min' | 'max'

const normalizeRange = (range: Range, bounds: { min: number; max: number; step: number }, changed: ChangedSide): Range => {
  const digits = numberOfDigits(bounds.step)

  let nextMin = clamp(range[0], bounds.min, bounds.max)
  let nextMax = clamp(range[1], bounds.min, bounds.max)

  if (changed === 'min' && nextMin > nextMax) nextMax = nextMin
  if (changed === 'max' && nextMax < nextMin) nextMin = nextMax

  nextMin = Number(nextMin.toFixed(digits))
  nextMax = Number(nextMax.toFixed(digits))

  return [nextMin, nextMax]
}

const phMinText = ref(props.phRange[0].toFixed(1))
const phMaxText = ref(props.phRange[1].toFixed(1))
const ecMinText = ref(props.ecRange[0].toFixed(1))
const ecMaxText = ref(props.ecRange[1].toFixed(1))

watch(
  () => props.phRange,
  (value) => {
    phMinText.value = value[0].toFixed(1)
    phMaxText.value = value[1].toFixed(1)
  },
  { deep: true },
)

watch(
  () => props.ecRange,
  (value) => {
    ecMinText.value = value[0].toFixed(1)
    ecMaxText.value = value[1].toFixed(1)
  },
  { deep: true },
)

const commitPh = (changed: ChangedSide) => {
  const current: Range = [
    parseNumber(phMinText.value, props.phRange[0]),
    parseNumber(phMaxText.value, props.phRange[1]),
  ]

  emit('update:phRange', normalizeRange(current, { min: 4, max: 8, step: 0.1 }, changed))
}

const commitEc = (changed: ChangedSide) => {
  const current: Range = [
    parseNumber(ecMinText.value, props.ecRange[0]),
    parseNumber(ecMaxText.value, props.ecRange[1]),
  ]

  emit('update:ecRange', normalizeRange(current, { min: 0, max: 3, step: 0.1 }, changed))
}
</script>

<template>
  <Card class="rounded-2xl">
    <CardHeader class="border-b border-border">
      <CardTitle class="leading-snug">Faixa ideal</CardTitle>
      <CardDescription class="leading-relaxed">Ajuste os limites usados como referência.</CardDescription>
    </CardHeader>

    <CardContent>
      <div class="flex flex-col gap-6">
        <section class="flex flex-col gap-3">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-sm font-semibold leading-snug text-foreground">pH</h2>
            <span class="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">{{ phLabel }}</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label for="ph-min" class="text-xs font-medium text-muted-foreground">Mín.</label>
              <input
                id="ph-min"
                v-model="phMinText"
                inputmode="decimal"
                type="text"
                autocomplete="off"
                class="h-10 w-full rounded-md border border-border bg-background px-3 text-sm tabular-nums shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                @blur="commitPh('min')"
                @keydown.enter.prevent="commitPh('min')"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label for="ph-max" class="text-xs font-medium text-muted-foreground">Máx.</label>
              <input
                id="ph-max"
                v-model="phMaxText"
                inputmode="decimal"
                type="text"
                autocomplete="off"
                class="h-10 w-full rounded-md border border-border bg-background px-3 text-sm tabular-nums shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                @blur="commitPh('max')"
                @keydown.enter.prevent="commitPh('max')"
              />
            </div>
          </div>

          <Slider
            :model-value="phRange"
            :min="4"
            :max="8"
            :step="0.1"
            :min-steps-between-thumbs="1"
            aria-label="Faixa ideal de pH"
            @update:model-value="emit('update:phRange', $event as Range)"
          />

          <p class="text-xs leading-relaxed text-muted-foreground">Arraste as extremidades ou digite os valores de mínimo e máximo.</p>
        </section>

        <section class="flex flex-col gap-3">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-sm font-semibold leading-snug text-foreground">EC</h2>
            <span class="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">{{ ecLabel }}</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label for="ec-min" class="text-xs font-medium text-muted-foreground">Mín.</label>
              <input
                id="ec-min"
                v-model="ecMinText"
                inputmode="decimal"
                type="text"
                autocomplete="off"
                class="h-10 w-full rounded-md border border-border bg-background px-3 text-sm tabular-nums shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                @blur="commitEc('min')"
                @keydown.enter.prevent="commitEc('min')"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label for="ec-max" class="text-xs font-medium text-muted-foreground">Máx.</label>
              <input
                id="ec-max"
                v-model="ecMaxText"
                inputmode="decimal"
                type="text"
                autocomplete="off"
                class="h-10 w-full rounded-md border border-border bg-background px-3 text-sm tabular-nums shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                @blur="commitEc('max')"
                @keydown.enter.prevent="commitEc('max')"
              />
            </div>
          </div>

          <Slider
            :model-value="ecRange"
            :min="0"
            :max="3"
            :step="0.1"
            :min-steps-between-thumbs="1"
            aria-label="Faixa ideal de EC"
            @update:model-value="emit('update:ecRange', $event as Range)"
          />

          <p class="text-xs leading-relaxed text-muted-foreground">Use essa faixa como referência para alertas.</p>
        </section>
      </div>
    </CardContent>
  </Card>
</template>
