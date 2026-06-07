<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  type ChartOptions,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

export type LineSeries = {
  label: string
  color: string
  values: number[]
}

const props = withDefaults(defineProps<{
  series: LineSeries[]
  labels?: string[]
  height?: number
}>(), {
  height: 180,
})

const resolveColor = (value: string, fallback: string) => {
  if (typeof window === 'undefined' || !value) {
    return fallback
  }

  if (!value.startsWith('var(')) {
    return value
  }

  const token = value.replace('var(', '').replace(')', '').trim()
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  return resolved || fallback
}

const labels = computed(() => {
  if (props.labels?.length) {
    return props.labels
  }

  const length = props.series[0]?.values.length ?? 0
  return Array.from({ length }, (_, index) => `P${index + 1}`)
})

const datasets = computed(() =>
  props.series.map((item, index) => {
    const fallback = index === 0 ? '#f97316' : '#fb7185'
    const stroke = resolveColor(item.color, fallback)

    return {
      label: item.label,
      data: item.values,
      borderColor: stroke,
      backgroundColor: stroke,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBorderWidth: 2,
      pointBackgroundColor: resolveColor('var(--background)', '#ffffff'),
      tension: 0.4,
    }
  }),
)

const data = computed(() => ({
  labels: labels.value,
  datasets: datasets.value,
}))

const gridColor = computed(() => resolveColor('var(--border)', 'rgba(148, 163, 184, 0.3)'))

const options = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        intersect: false,
        mode: 'index',
      },
    },
    scales: {
      x: {
        type: 'category', // Agora o TS entende que isso é um literal válido
        grid: { display: false },
        ticks: {
          color: resolveColor('var(--muted-foreground)', '#64748b'),
          maxTicksLimit: 6,
          autoSkip: true,
          font: { size: 11, weight: 600 }, // Você pode usar número direto aqui (600) em vez de '600' as const
        },
        border: { display: false },
      },
      y: {
        type: 'linear', // Idem
        grid: { color: gridColor.value },
        ticks: {
          color: resolveColor('var(--muted-foreground)', '#64748b'),
          font: { size: 11, weight: 600 },
          padding: 6,
        },
        border: { display: false },
      },
    },
  } as ChartOptions<'line'>
})
</script>

<template>
  <div class="h-[190px] w-full">
    <Line :data="data" :options="options" />
  </div>
</template>
