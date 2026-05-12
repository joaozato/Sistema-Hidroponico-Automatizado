<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  type ChartOptions,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

export type BarItem = {
  label: string
  value: number
}

const props = defineProps<{
  items: BarItem[]
  color: string
  height?: number
}>()

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

const labels = computed(() => props.items.map((item) => item.label))

const data = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      data: props.items.map((item) => item.value),
      backgroundColor: resolveColor(props.color, '#fb7185'),
      borderRadius: 10,
      maxBarThickness: 28,
    },
  ],
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
        grid: { display: false },
        ticks: {
          color: resolveColor('var(--muted-foreground)', '#64748b'),
          font: { size: 11, weight: 600 },
        },
        border: { display: false },
      },
      y: {
        grid: { color: gridColor.value },
        ticks: {
          color: resolveColor('var(--muted-foreground)', '#64748b'),
          font: { size: 11, weight: 600 },
          padding: 6,
        },
        border: { display: false },
      },
    },
  } as ChartOptions<'bar'>
})
</script>

<template>
  <div :class="['w-full', props.height ? '' : 'h-[190px]']" :style="props.height ? { height: `${props.height}px` } : undefined">
    <Bar :data="data" :options="options" />
  </div>
</template>