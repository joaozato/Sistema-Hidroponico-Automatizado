<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { CloudIcon, DropletIcon, ThermometerIcon, ZapIcon } from 'lucide-vue-next'
import HistoryLineChart, { type LineSeries } from '@/components/history/HistoryLineChart.vue'
import HistoryBarChart, { type BarItem } from '@/components/history/HistoryBarChart.vue'

const props = defineProps<{
  phSeries: LineSeries[]
  ecSeries: LineSeries[]
  humiditySeries: LineSeries[]
  rangeLabels: string[]
  barItems: BarItem[]
  averagePh: string
  averageEc: string
  averageHumidity: string
  averageTemp: string
}>()
</script>

<template>
  <section class="mt-4 grid gap-4">
    <Card class="rounded-3xl">
      <CardContent class="flex flex-col gap-4 p-4">
        <div>
          <p class="text-sm font-semibold text-foreground">Resumo do período</p>
          <p class="text-xs text-muted-foreground">Indicadores médios por janela selecionada</p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-2xl bg-muted/40 p-3">
            <div class="flex items-center gap-3">
              <DropletIcon class="size-6 text-amber-500" fill="currentColor" />
              <div class="leading-none">
                <div class="text-lg font-bold tabular-nums tracking-tight text-amber-500">
                  {{ props.averagePh }}
                </div>
                <div class="text-[11px] -mt-0.5 font-semibold uppercase text-amber-500/90">
                  pH médio
                </div>
              </div>
            </div>
          </div>
          <div class="rounded-2xl bg-muted/40 p-3">
            <div class="flex items-center gap-3">
              <ZapIcon class="size-6 text-rose-500" fill="currentColor" />
              <div class="leading-none">
                <div class="text-lg font-bold tabular-nums tracking-tight text-rose-500">
                  {{ props.averageEc }}
                </div>
                <div class="text-[11px] -mt-0.5 font-semibold uppercase text-rose-500/90">
                  EC médio
                </div>
              </div>
            </div>
          </div>
          <div class="rounded-2xl bg-muted/40 p-3">
            <div class="flex items-center gap-3">
              <CloudIcon class="size-6 text-emerald-500" fill="currentColor" />
              <div class="leading-none">
                <div class="text-lg font-bold tabular-nums tracking-tight text-emerald-500">
                  {{ props.averageHumidity }}%
                </div>
                <div class="text-[11px] -mt-0.5 font-semibold uppercase text-emerald-500/90">
                  Umidade média
                </div>
              </div>
            </div>
          </div>
          <div class="rounded-2xl bg-muted/40 p-3">
            <div class="flex items-center gap-3">
              <ThermometerIcon class="size-6 text-sky-500" fill="currentColor" />
              <div class="leading-none">
                <div class="text-lg font-bold tabular-nums tracking-tight text-sky-500">
                  {{ props.averageTemp }}°C
                </div>
                <div class="text-[11px] -mt-0.5 font-semibold uppercase text-sky-500/90">
                  Temp. média
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="rounded-3xl">
      <CardContent class="flex flex-col gap-3 p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-2">
            <DropletIcon class="mt-0.5 size-5 text-amber-500" fill="currentColor" />
            <div>
              <p class="text-sm font-semibold text-foreground">pH</p>
              <p class="text-xs text-muted-foreground">Leituras de acidez no período</p>
            </div>
          </div>
          <div class="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span class="flex items-center gap-1">
              <span class="size-2 rounded-full" :style="{ backgroundColor: '#f59e0b' }" />
              pH
            </span>
          </div>
        </div>
        <HistoryLineChart :series="props.phSeries" :labels="props.rangeLabels" />
      </CardContent>
    </Card>

    <Card class="rounded-3xl">
      <CardContent class="flex flex-col gap-3 p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-2">
            <ZapIcon class="mt-0.5 size-5 text-rose-500" fill="currentColor" />
            <div>
              <p class="text-sm font-semibold text-foreground">Condutividade</p>
              <p class="text-xs text-muted-foreground">Variação de EC no período</p>
            </div>
          </div>
          <div class="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span class="flex items-center gap-1">
              <span class="size-2 rounded-full" :style="{ backgroundColor: '#f43f5e' }" />
              EC
            </span>
          </div>
        </div>
        <HistoryLineChart :series="props.ecSeries" :labels="props.rangeLabels" />
      </CardContent>
    </Card>

    <Card class="rounded-3xl">
      <CardContent class="flex flex-col gap-3 p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-2">
            <CloudIcon class="mt-0.5 size-5 text-emerald-500" fill="currentColor" />
            <div>
              <p class="text-sm font-semibold text-foreground">Umidade</p>
              <p class="text-xs text-muted-foreground">Variação de umidade no período</p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span class="flex items-center gap-1">
              <span class="size-2 rounded-full" :style="{ backgroundColor: '#10b981' }" />
              Umidade
            </span>
          </div>
        </div>
        <HistoryLineChart :series="props.humiditySeries" :labels="props.rangeLabels" />
      </CardContent>
    </Card>

    <Card class="rounded-3xl">
      <CardContent class="flex flex-col gap-3 p-4">
        <div class="flex items-start gap-2">
          <ThermometerIcon class="mt-0.5 size-5 text-sky-500" fill="currentColor" />
          <div>
            <p class="text-sm font-semibold text-foreground">Temperatura média</p>
            <p class="text-xs text-muted-foreground">Distribuição por blocos do período</p>
          </div>
        </div>
        <HistoryBarChart :items="props.barItems" color="#0ea5e9" />
      </CardContent>
    </Card>
  </section>
</template>
