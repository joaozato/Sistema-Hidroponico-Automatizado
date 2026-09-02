<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import HomeHeader from '@/components/home/HomeHeader.vue'
import SettingsHero from '@/components/settings/SettingsHero.vue'
import ManualModeCard from '@/components/settings/ManualModeCard.vue'
import IdealRangeCard from '@/components/settings/IdealRangeCard.vue'
import SupportButton from '@/components/settings/SupportButton.vue'

import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const { manualMode, phIdealRange, ecIdealRange, minWaterLevel, error, saving } = storeToRefs(settingsStore)

onMounted(() => void settingsStore.loadConfig())

const phone = '5553991031266'
const text = encodeURIComponent('Olá! Preciso de assistência técnica no sistema hidropônico.')
const supportHref = `https://wa.me/${phone}?text=${text}`
</script>

<template>
	<div class="min-h-screen bg-background">
		<div class="mx-auto w-full max-w-md px-4 pb-28">
			<HomeHeader />

			<main class="mt-5 flex flex-col gap-6">
				<SettingsHero
					title="Ajustes"
					subtitle="Controle rápido do modo e das faixas ideais."
				/>

				<ManualModeCard :model-value="manualMode" @update:model-value="settingsStore.setManualMode" />

				<IdealRangeCard
					:ph-range="phIdealRange"
					:ec-range="ecIdealRange"
					@update:ph-range="settingsStore.setRanges($event, ecIdealRange)"
					@update:ec-range="settingsStore.setRanges(phIdealRange, $event)"
				/>

				<div class="rounded-2xl border border-border bg-card p-4 shadow-sm">
					<div class="flex items-center justify-between gap-3">
						<div>
							<p class="text-sm font-semibold text-foreground">Nível mínimo da água</p>
							<p class="text-xs text-muted-foreground">Limite usado pela automação para reabastecimento.</p>
						</div>
						<div class="flex items-center gap-1">
							<input
								:value="minWaterLevel"
								type="number"
								min="0"
								max="100"
								step="1"
								class="h-10 w-20 rounded-md border border-border bg-background px-2 text-right text-sm"
								@change="settingsStore.setMinWaterLevel(Number(($event.target as HTMLInputElement).value))"
							/>
							<span class="text-sm text-muted-foreground">%</span>
						</div>
					</div>
				</div>

				<p v-if="saving" class="text-xs text-muted-foreground">Salvando ajustes…</p>
				<p v-if="error" class="text-xs text-destructive">{{ error }}</p>

				<SupportButton :href="supportHref" />
			</main>
		</div>
	</div>
</template>

