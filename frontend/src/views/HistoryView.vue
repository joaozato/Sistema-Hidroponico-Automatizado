<script setup lang="ts">
import { computed, ref } from 'vue'
import { FileDownIcon, ImageIcon, Share2Icon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

import HomeHeader from '@/components/home/HomeHeader.vue'
import HistoryUtilityBar from '@/components/history/HistoryUtilityBar.vue'
import HistoryTimeRange from '@/components/history/HistoryTimeRange.vue'
import HistoryLineChart from '@/components/history/HistoryLineChart.vue'
import HistoryBarChart from '@/components/history/HistoryBarChart.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

const activeCarreiraLabel = computed(() => {
  if (selectedCarreiraId.value === null) {
    return 'Todas as carreiras'
  }

  return carreiras.value.find((item) => item.id === selectedCarreiraId.value)?.nome ?? 'Carreira'
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

const lineSeries = computed(() => [
	{
		label: 'pH',
		color: '#f59e0b',
		values: displayRangeData.value.map((item) => item.ph),
	},
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

const handleUtilityAction = (_id: string) => {
	// Hook reservado para ações futuras (exportar, compartilhar, etc.).
}
</script>

<template>
	<div class="min-h-screen bg-background">
		<div class="mx-auto w-full max-w-md px-4 pb-28">
			<HomeHeader />

			<section class="mt-5">
				<h1 class="text-xl font-semibold tracking-tight leading-tight">Histórico</h1>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Relatório do sistema e exportação rápida dos dados.
				</p>
			</section>

			<section class="mt-5">
				<HistoryUtilityBar :actions="utilityActions" @action="handleUtilityAction" />
			</section>

			<section class="mt-6 flex items-center justify-between">
				<div>
					<h2 class="text-base font-semibold text-foreground">Período</h2>
					<p class="text-xs text-muted-foreground">Resumo das últimas medições</p>
				</div>
				<HistoryTimeRange v-model="selectedRange" :options="timeRanges" />
			</section>

			<section class="mt-4">
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-base font-semibold text-foreground">Carreiras</h2>
						<p class="text-xs text-muted-foreground">{{ activeCarreiraLabel }}</p>
					</div>
				</div>
				<div class="mt-3">
					<div class="flex gap-2 overflow-x-auto pb-2">
						<Button
							variant="ghost"
							size="sm"
							class="h-8 shrink-0 rounded-full px-3 text-xs font-semibold"
							:class="selectedCarreiraId === null ? 'bg-muted/60 text-foreground' : 'text-muted-foreground'"
							@click="selectedCarreiraId = null"
						>
							Todas
						</Button>
						<Button
							v-for="carreira in carreiras"
							:key="carreira.id"
							variant="ghost"
							size="sm"
							class="h-8 shrink-0 rounded-full px-3 text-xs font-semibold"
							:class="selectedCarreiraId === carreira.id ? 'bg-muted/60 text-foreground' : 'text-muted-foreground'"
							@click="selectedCarreiraId = carreira.id"
						>
							{{ carreira.nome }}
						</Button>
					</div>
				</div>
			</section>

			<section class="mt-4 grid gap-4">
				<Card class="rounded-3xl">
					<CardContent class="flex flex-col gap-3 p-4">
						<div class="flex items-start justify-between gap-3">
							<div>
								<p class="text-sm font-semibold text-foreground">pH e Condutividade</p>
								<p class="text-xs text-muted-foreground">Estabilidade dos sensores no período</p>
							</div>
							<div class="flex items-center gap-3 text-[11px] text-muted-foreground">
								<span class="flex items-center gap-1">
									<span class="size-2 rounded-full" :style="{ backgroundColor: '#f59e0b' }" />
									pH
								</span>
								<span class="flex items-center gap-1">
									<span class="size-2 rounded-full" :style="{ backgroundColor: '#f43f5e' }" />
									EC
								</span>
							</div>
						</div>
						<HistoryLineChart :series="lineSeries" :labels="rangeLabels" />
					</CardContent>
				</Card>

				<Card class="rounded-3xl">
					<CardContent class="flex flex-col gap-3 p-4">
						<div class="flex items-start justify-between gap-3">
							<div>
								<p class="text-sm font-semibold text-foreground">Umidade</p>
								<p class="text-xs text-muted-foreground">Variação de umidade no período</p>
							</div>
							<div class="flex items-center gap-2 text-[11px] text-muted-foreground">
								<span class="flex items-center gap-1">
									<span class="size-2 rounded-full" :style="{ backgroundColor: '#10b981' }" />
									Umidade
								</span>
							</div>
						</div>
						<HistoryLineChart :series="humiditySeries" :labels="rangeLabels" />
					</CardContent>
				</Card>

				<Card class="rounded-3xl">
					<CardContent class="flex flex-col gap-4 p-4">
						<div>
							<p class="text-sm font-semibold text-foreground">Resumo do período</p>
							<p class="text-xs text-muted-foreground">Indicadores médios por janela selecionada</p>
						</div>
						<div class="grid grid-cols-3 gap-3">
							<div class="rounded-2xl bg-muted/40 p-3 text-center">
								<p class="text-[11px] font-semibold text-muted-foreground">pH médio</p>
								<p class="mt-1 text-base font-semibold text-foreground">{{ averagePh }}</p>
							</div>
							<div class="rounded-2xl bg-muted/40 p-3 text-center">
								<p class="text-[11px] font-semibold text-muted-foreground">EC médio</p>
								<p class="mt-1 text-base font-semibold text-foreground">{{ averageEc }}</p>
							</div>
							<div class="rounded-2xl bg-muted/40 p-3 text-center">
								<p class="text-[11px] font-semibold text-muted-foreground">Temp. média</p>
								<p class="mt-1 text-base font-semibold text-foreground">{{ averageTemp }}°C</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card class="rounded-3xl">
					<CardContent class="flex flex-col gap-3 p-4">
						<div>
							<p class="text-sm font-semibold text-foreground">Temperatura média</p>
							<p class="text-xs text-muted-foreground">Distribuição por blocos do período</p>
						</div>
						<HistoryBarChart :items="barItems" color="var(--chart-3)" />
					</CardContent>
				</Card>
			</section>
		</div>
	</div>
</template>

