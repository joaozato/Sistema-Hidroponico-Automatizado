<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { FileDownIcon, ImageIcon, Share2Icon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

import HomeHeader from '@/components/home/HomeHeader.vue'
import HistoryIntro from '@/components/history/HistoryIntro.vue'
import HistoryUtilityBar from '@/components/history/HistoryUtilityBar.vue'
import HistoryFilters from '@/components/history/HistoryFilters.vue'
import HistoryChartsSection from '@/components/history/HistoryChartsSection.vue'
import { sortSnapshotsAscending } from '@/components/history/historyData'
import {
  createHistoryPdf,
  createHistoryShareText,
  downloadBlob,
  exportHistoryImage,
  type HistoryExportData,
} from '@/components/history/historyExport'
import { useHomeStore } from '@/stores/home'
import { api, type SensorSnapshot } from '@/services/api'

const timeRanges = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: '1a', label: '1a' },
]
const daysByRange: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1a': 365 }

const selectedRange = ref('7d')
const selectedCarreiraId = ref<number | null>(null)
const historyData = ref<SensorSnapshot[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const utilityBusy = ref<string | null>(null)
const utilityFeedback = ref<{ message: string; type: 'success' | 'error' } | null>(null)
let requestVersion = 0
let feedbackTimer: ReturnType<typeof setTimeout> | undefined

const homeStore = useHomeStore()
const { carreiras } = storeToRefs(homeStore)

const utilityActions = [
  { id: 'pdf', label: 'PDF', icon: FileDownIcon },
  { id: 'imagem', label: 'Imagem', icon: ImageIcon },
  { id: 'compartilhar', label: 'Compartilhar', icon: Share2Icon },
]

const loadHistory = async () => {
  const version = ++requestVersion
  loading.value = true
  error.value = null
  try {
    const data = await api.getHistory(daysByRange[selectedRange.value] ?? 7, selectedCarreiraId.value)
    if (version === requestVersion) historyData.value = data
  } catch (cause) {
    if (version === requestVersion) error.value = cause instanceof Error ? cause.message : 'Não foi possível carregar o histórico.'
  } finally {
    if (version === requestVersion) loading.value = false
  }
}

onMounted(() => void loadHistory())
watch([selectedRange, selectedCarreiraId], () => void loadHistory())

const average = (values: Array<number | null | undefined>) => {
  const valid = values.filter((value): value is number => value !== null && value !== undefined && Number.isFinite(value))
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null
}

const samples = computed(() => sortSnapshotsAscending(historyData.value).flatMap((snapshot) => {
  const values = snapshot.lines
  const ph = average(values.map((line) => line.ph))
  const ec = average(values.map((line) => line.conductivity))
  const humidity = average(values.map((line) => line.soil_humidity))
  if (ph === null && ec === null && humidity === null && snapshot.temperature === null) return []
  return [{
    timestamp: snapshot.timestamp,
    ph,
    ec,
    humidity,
    temperature: snapshot.temperature,
  }]
}))

const displayRangeData = computed(() => {
  const step = Math.max(1, Math.ceil(samples.value.length / 52))
  return samples.value.filter((_, index) => index % step === 0)
})

const formatLabel = (timestamp: string) => {
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

const phSeries = computed(() => [{ label: 'pH', color: '#f59e0b', values: displayRangeData.value.map((item) => item.ph ?? 0) }])
const ecSeries = computed(() => [{ label: 'EC', color: '#f43f5e', values: displayRangeData.value.map((item) => item.ec ?? 0) }])
const humiditySeries = computed(() => [{ label: 'Umidade', color: '#10b981', values: displayRangeData.value.map((item) => item.humidity ?? 0) }])
const rangeLabels = computed(() => displayRangeData.value.map((item) => formatLabel(item.timestamp)))

const barItems = computed(() => {
  const groups: { label: string; value: number }[] = []
  const chunkSize = Math.max(1, Math.ceil(samples.value.length / 6))
  for (let index = 0; index < samples.value.length; index += chunkSize) {
    const chunk = samples.value.slice(index, index + chunkSize)
    const temp = average(chunk.map((item) => item.temperature))
    if (temp !== null) groups.push({ label: `P${groups.length + 1}`, value: Number(temp.toFixed(1)) })
  }
  return groups
})

const formatAverage = (values: Array<number | null | undefined>, digits: number) => {
  const value = average(values)
  return value === null ? '—' : value.toFixed(digits)
}

const averagePh = computed(() => formatAverage(samples.value.map((item) => item.ph), 2))
const averageEc = computed(() => formatAverage(samples.value.map((item) => item.ec), 2))
const averageTemp = computed(() => formatAverage(samples.value.map((item) => item.temperature), 1))
const averageHumidity = computed(() => formatAverage(samples.value.map((item) => item.humidity), 0))

const selectedRangeLabel = computed(() => timeRanges.find((range) => range.value === selectedRange.value)?.label ?? selectedRange.value)
const selectedCarreiraLabel = computed(() => {
  if (selectedCarreiraId.value === null) return 'Todas as carreiras'
  return carreiras.value.find((carreira) => carreira.id === selectedCarreiraId.value)?.nome ?? 'Carreira'
})

const exportData = computed<HistoryExportData>(() => ({
  rangeLabel: selectedRangeLabel.value,
  carreiraLabel: selectedCarreiraLabel.value,
  samples: samples.value,
  chartSamples: displayRangeData.value,
  barItems: barItems.value,
  averages: {
    ph: averagePh.value,
    ec: averageEc.value,
    humidity: averageHumidity.value,
    temperature: averageTemp.value,
  },
}))

const filenamePart = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'historico'

const setUtilityFeedback = (message: string, type: 'success' | 'error' = 'success') => {
  utilityFeedback.value = { message, type }
  if (feedbackTimer) clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => { utilityFeedback.value = null }, 5000)
}

const copyToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('Não foi possível copiar o resumo.')
}

const handleUtilityAction = async (id: string) => {
  if (utilityBusy.value) return
  utilityBusy.value = id
  utilityFeedback.value = null
  const data = exportData.value
  const baseFilename = `historico-${filenamePart(data.rangeLabel)}-${new Date().toISOString().slice(0, 10)}`

  try {
    if (id === 'pdf') {
      downloadBlob(createHistoryPdf(data), `${baseFilename}.pdf`)
      setUtilityFeedback('PDF exportado com sucesso.')
    } else if (id === 'imagem') {
      await exportHistoryImage(data, `${baseFilename}.png`)
      setUtilityFeedback('Imagem exportada com sucesso.')
    } else if (id === 'compartilhar') {
      const text = createHistoryShareText(data)
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ title: 'Histórico do sistema hidropônico', text, url: window.location.href })
          setUtilityFeedback('Relatório compartilhado com sucesso.')
        } catch (cause) {
          if (cause instanceof Error && cause.name === 'AbortError') return
          throw cause
        }
      } else {
        await copyToClipboard(`${text}\n\n${window.location.href}`)
        setUtilityFeedback('Resumo copiado para a área de transferência.')
      }
    }
  } catch (cause) {
    setUtilityFeedback(cause instanceof Error ? cause.message : 'Não foi possível concluir a ação.', 'error')
  } finally {
    utilityBusy.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="mx-auto w-full max-w-md px-4 pb-28">
      <HomeHeader />
      <section class="mt-5"><HistoryIntro /></section>
      <section class="mt-5">
        <HistoryUtilityBar :actions="utilityActions" :busy-action="utilityBusy" @action="handleUtilityAction" />
        <p
          v-if="utilityFeedback"
          aria-live="polite"
          class="mt-2 text-center text-xs font-medium"
          :class="utilityFeedback.type === 'error' ? 'text-destructive' : 'text-emerald-600'"
        >
          {{ utilityFeedback.message }}
        </p>
      </section>

      <HistoryFilters
        :time-ranges="timeRanges"
        :selected-range="selectedRange"
        :carreiras="carreiras"
        :selected-carreira-id="selectedCarreiraId"
        @update:selected-range="selectedRange = $event"
        @update:selected-carreira-id="selectedCarreiraId = $event"
      />

      <p v-if="loading" class="mt-4 text-sm text-muted-foreground">Carregando histórico…</p>
      <p v-if="error" class="mt-4 text-sm text-destructive">{{ error }}</p>
      <HistoryChartsSection
        :ph-series="phSeries"
        :ec-series="ecSeries"
        :humidity-series="humiditySeries"
        :range-labels="rangeLabels"
        :bar-items="barItems"
        :average-ph="averagePh"
        :average-ec="averageEc"
        :average-humidity="averageHumidity"
        :average-temp="averageTemp"
      />
    </div>
  </div>
</template>
