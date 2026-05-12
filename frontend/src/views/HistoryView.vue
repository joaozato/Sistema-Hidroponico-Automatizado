<script setup lang="ts">
import { computed, ref } from 'vue'
import { FileDownIcon, ImageIcon, Share2Icon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

import HomeHeader from '@/components/home/HomeHeader.vue'
import HistoryIntro from '@/components/history/HistoryIntro.vue'
import HistoryUtilityBar from '@/components/history/HistoryUtilityBar.vue'
import HistoryFilters from '@/components/history/HistoryFilters.vue'
import HistoryChartsSection from '@/components/history/HistoryChartsSection.vue'
import { useHomeStore } from '@/stores/home'

const timeRanges = [
	{ value: '7d', label: '7d' },
	{ value: '30d', label: '30d' },
	{ value: '90d', label: '90d' },
	{ value: '1a', label: '1a' },
]

const selectedRange = ref('7d')
const selectedCarreiraId = ref<number | null>(null)

const homeStore = useHomeStore()
const { carreiras } = storeToRefs(homeStore)

const utilityActions = [
	{ id: 'pdf', label: 'PDF', icon: FileDownIcon },
	{ id: 'imagem', label: 'Imagem', icon: ImageIcon },
	{ id: 'compartilhar', label: 'Compartilhar', icon: Share2Icon },
]

const rangeSizeByKey: Record<string, number> = {
	'7d': 7,
	'30d': 14,
	'90d': 26,
	'1a': 52,
}

// Mock de série contínua para alimentar os gráficos enquanto não há API.
const baseSeries = Array.from({ length: 52 }, (_, index) => {
	const step = index + 1

	return {
		label: `S${step}`,
		ph: 5.9 + Math.sin(step / 6) * 0.35,
		ec: 1.45 + Math.cos(step / 7) * 0.22,
		temp: 22 + Math.sin(step / 5) * 2.1,
		umidade: 78 + Math.cos(step / 8) * 8,
	}
})

const rangeData = computed(() => {
	const size = rangeSizeByKey[selectedRange.value] ?? 7
	const slice = baseSeries.slice(-size)

	if (selectedCarreiraId.value === null) {
		return slice
	}

	const seed = selectedCarreiraId.value * 0.12

	return slice.map((item, index) => ({
		...item,
		ph: item.ph + Math.sin((index + 1) / 5) * seed,
		ec: item.ec + Math.cos((index + 1) / 6) * seed,
		temp: item.temp + Math.sin((index + 1) / 7) * seed,
		umidade: item.umidade + Math.cos((index + 1) / 8) * seed,
	}))
})

const sampleEveryByRange: Record<string, number> = {
	'7d': 1,
	'30d': 2,
	'90d': 4,
	'1a': 4,
}

const displayRangeData = computed(() => {
	const step = sampleEveryByRange[selectedRange.value] ?? 1
	return rangeData.value.filter((_, index) => index % step === 0)
})

const phSeries = computed(() => [
	{
		label: 'pH',
		color: '#f59e0b',
		values: displayRangeData.value.map((item) => item.ph),
	},
])

const ecSeries = computed(() => [
	{
		label: 'EC',
		color: '#f43f5e',
		values: displayRangeData.value.map((item) => item.ec),
	},
])

const humiditySeries = computed(() => [
	{
		label: 'Umidade',
		color: '#10b981',
		values: displayRangeData.value.map((item) => item.umidade),
	},
])

const rangeLabels = computed(() => displayRangeData.value.map((item) => item.label))

const barItems = computed(() => {
	const groups: { label: string; value: number }[] = []
	const chunkSize = Math.max(1, Math.round(rangeData.value.length / 6))

	// Agrupa em blocos para manter a leitura do gráfico de barras.
	for (let index = 0; index < rangeData.value.length; index += chunkSize) {
		const chunk = rangeData.value.slice(index, index + chunkSize)
		const avg = chunk.reduce((sum, item) => sum + item.temp, 0) / chunk.length
		groups.push({ label: `P${groups.length + 1}`, value: Number(avg.toFixed(1)) })
	}

	return groups
})

const averagePh = computed(() => {
	const avg = rangeData.value.reduce((sum, item) => sum + item.ph, 0) / rangeData.value.length
	return avg.toFixed(2)
})

const averageEc = computed(() => {
	const avg = rangeData.value.reduce((sum, item) => sum + item.ec, 0) / rangeData.value.length
	return avg.toFixed(2)
})

const averageTemp = computed(() => {
	const avg = rangeData.value.reduce((sum, item) => sum + item.temp, 0) / rangeData.value.length
	return avg.toFixed(1)
})

const averageHumidity = computed(() => {
	const avg = rangeData.value.reduce((sum, item) => sum + item.umidade, 0) / rangeData.value.length
	return avg.toFixed(0)
})

const handleUtilityAction = (_id: string) => {
	// Hook reservado para ações futuras (exportar, compartilhar, etc.).
}
</script>

<template>
	<div class="min-h-screen bg-background">
		<div class="mx-auto w-full max-w-md px-4 pb-28">
			<HomeHeader />

			<section class="mt-5">
				<HistoryIntro />
			</section>

			<section class="mt-5">
				<HistoryUtilityBar :actions="utilityActions" @action="handleUtilityAction" />
			</section>

			<HistoryFilters
				:time-ranges="timeRanges"
				:selected-range="selectedRange"
				:carreiras="carreiras"
				:selected-carreira-id="selectedCarreiraId"
				@update:selected-range="selectedRange = $event"
				@update:selected-carreira-id="selectedCarreiraId = $event"
			/>

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

