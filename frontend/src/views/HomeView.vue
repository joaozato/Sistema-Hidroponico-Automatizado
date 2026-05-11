<script setup lang="ts">
import HomeHeader from '@/components/home/HomeHeader.vue'
import HomeAlert from '@/components/home/HomeAlert.vue'
import SectionCarreiras from '@/components/home/SectionCarreiras.vue'
import SectionInformacoesGerais from '@/components/home/SectionInformacoesGerais.vue'
</script>

<template>
	<div class="min-h-screen bg-background">
		<div class="mx-auto w-full max-w-md px-4 pb-10">

			<!-- cabeçalho -->
			<HomeHeader />

			<main class="mt-5 flex flex-col gap-6">
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