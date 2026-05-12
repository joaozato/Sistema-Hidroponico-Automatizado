<script setup lang="ts">
import { storeToRefs } from 'pinia'

import HomeHeader from '@/components/home/HomeHeader.vue'
import SettingsHero from '@/components/settings/SettingsHero.vue'
import ManualModeCard from '@/components/settings/ManualModeCard.vue'
import IdealRangeCard from '@/components/settings/IdealRangeCard.vue'
import SupportButton from '@/components/settings/SupportButton.vue'

import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const { manualMode, phIdealRange, ecIdealRange } = storeToRefs(settingsStore)

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

				<ManualModeCard v-model="manualMode" />

				<IdealRangeCard
					:ph-range="phIdealRange"
					:ec-range="ecIdealRange"
					@update:ph-range="phIdealRange = $event"
					@update:ec-range="ecIdealRange = $event"
				/>

				<SupportButton :href="supportHref" />
			</main>
		</div>
	</div>
</template>

