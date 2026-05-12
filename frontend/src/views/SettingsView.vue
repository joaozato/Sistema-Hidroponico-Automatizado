<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import HomeHeader from '@/components/home/HomeHeader.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { MessageCircleIcon } from 'lucide-vue-next'

import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const { manualMode, phIdealRange, ecIdealRange } = storeToRefs(settingsStore)

const formatNumber = (value: number, fractionDigits = 1) =>
	value.toLocaleString('pt-BR', {
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	})

const phLabel = computed(() => `${formatNumber(phIdealRange.value[0])}–${formatNumber(phIdealRange.value[1])}`)
const ecLabel = computed(() => `${formatNumber(ecIdealRange.value[0])}–${formatNumber(ecIdealRange.value[1])}`)

const supportHref = computed(() => {
	const phone = '5553999535431'
	const text = encodeURIComponent('Olá! Preciso de assistência técnica no sistema hidropônico.')
	return `https://wa.me/${phone}?text=${text}`
})
</script>

<template>
	<div class="min-h-screen bg-background">
		<div class="mx-auto w-full max-w-md px-4 pb-28">
			<HomeHeader />

			<main class="mt-5 flex flex-col gap-6">
				<div>
					<h1 class="text-xl font-semibold tracking-tight leading-tight">Ajustes</h1>
					<p class="mb-1 text-sm leading-relaxed text-muted-foreground">Controle rápido do modo e das faixas ideais.</p>
				</div>

				<Card>
					<CardHeader class="border-b border-border">
						<CardTitle class="leading-snug">Modo manual</CardTitle>
						<CardDescription class="leading-relaxed">Quando ativo, o sistema não aplica automações.</CardDescription>
					</CardHeader>
					<CardContent class="pt-5">
						<div class="flex items-center justify-between gap-4">
							<label for="manual-mode" class="text-sm font-medium leading-snug text-foreground">Ligar/desligar modo manual</label>
							<Switch id="manual-mode" v-model="manualMode" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader class="border-b border-border">
						<CardTitle class="leading-snug">Faixa ideal</CardTitle>
						<CardDescription class="leading-relaxed">Ajuste os limites usados como referência.</CardDescription>
					</CardHeader>

					<CardContent class="pt-5">
						<div class="flex flex-col gap-6">
							<section class="flex flex-col gap-3">
								<div class="flex items-center justify-between gap-3">
									<h2 class="text-sm font-semibold leading-snug text-foreground">pH</h2>
									<span class="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">{{ phLabel }}</span>
								</div>

								<Slider
									v-model="phIdealRange"
									:min="4"
									:max="8"
									:step="0.1"
									:min-steps-between-thumbs="1"
									aria-label="Faixa ideal de pH"
								/>

								<p class="text-xs leading-relaxed text-muted-foreground">Arraste as extremidades para definir o mínimo e o máximo.</p>
							</section>

							<section class="flex flex-col gap-3">
								<div class="flex items-center justify-between gap-3">
									<h2 class="text-sm font-semibold leading-snug text-foreground">EC</h2>
									<span class="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">{{ ecLabel }}</span>
								</div>

								<Slider
									v-model="ecIdealRange"
									:min="0"
									:max="3"
									:step="0.1"
									:min-steps-between-thumbs="1"
									aria-label="Faixa ideal de EC"
								/>

								<p class="text-xs leading-relaxed text-muted-foreground">Use essa faixa como referência para alertas e controle.</p>
							</section>
						</div>
					</CardContent>
				</Card>

				<Button
					as="a"
					:href="supportHref"
					target="_blank"
					rel="noopener noreferrer"
					size="lg"
					class="w-full rounded-3xl h-14"
				>
					<MessageCircleIcon class="size-5" aria-hidden="true" />
					Chamar assistência técnica
				</Button>
			</main>
		</div>
	</div>
</template>

