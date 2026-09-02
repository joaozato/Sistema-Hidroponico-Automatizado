<script setup lang="ts">
import HomeHeader from '@/components/home/HomeHeader.vue'
import HomeAlert from '@/components/home/HomeAlert.vue'
import SectionCarreiras from '@/components/home/SectionCarreiras.vue'
import SectionInformacoesGerais from '@/components/home/SectionInformacoesGerais.vue'
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/stores/home'

const homeStore = useHomeStore()
const { loading, error } = storeToRefs(homeStore)
</script>

<template>
	<div class="min-h-screen bg-background">
		<div class="mx-auto w-full max-w-md px-4 pb-10">

			<!-- cabeçalho -->
			<HomeHeader />

			<main class="mt-5 flex flex-col gap-6">
				<p v-if="loading && !homeStore.snapshot" class="text-sm text-muted-foreground">Carregando telemetria…</p>
				<p v-if="error && !homeStore.snapshot" class="text-sm text-destructive">{{ error }}</p>
				<!-- alertas -->
				<HomeAlert />

				<!-- carreiras -->
				<SectionCarreiras ver-todas />

				<!-- informações gerais -->
				<SectionInformacoesGerais />
			</main>

		</div>
	</div>
</template>
