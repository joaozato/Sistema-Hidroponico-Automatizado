<script setup lang="ts">
import { ArrowLeftIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import CarreiraListCard from '@/components/home/CarreiraListCard.vue'
import { useHomeStore } from '@/stores/home'

const router = useRouter()
const homeStore = useHomeStore()
const { carreiras, initials, avatarSrc } = storeToRefs(homeStore)

const goBack = () => {
	void router.push({ name: 'home' })
}
</script>

<template>
	<div class="min-h-screen bg-background">
		<div class="mx-auto w-full max-w-md px-4 pb-10 pt-6">
			<header class="flex items-center justify-between gap-4">
				<button
					type="button"
					class="flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-muted"
					@click="goBack"
				>
					<ArrowLeftIcon class="size-4" />
				</button>

				<h1 class="flex-1 text-base font-semibold tracking-tight">Todas as Carreiras</h1>

				<Avatar class="size-11">
					<AvatarImage :src="avatarSrc ?? ''" alt="Foto de usuário" />
					<AvatarFallback>{{ initials }}</AvatarFallback>
				</Avatar>
			</header>

			<section class="mt-6 flex flex-col gap-4">
				<CarreiraListCard
					v-for="carreira in carreiras"
					:key="carreira.id"
					:carreira-id="carreira.id"
				/>
			</section>
		</div>
	</div>
</template>

