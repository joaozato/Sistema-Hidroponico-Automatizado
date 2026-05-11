<script setup lang="ts">
import { useRouter } from 'vue-router'
import CarreiraCarousel from './CarreiraCarousel.vue'

const props = withDefaults(
  defineProps<{
    title?: string
    verTodas?: boolean
    verTodasLabel?: string
  }>(),
  {
    title: 'Carreiras',
    verTodas: false,
    verTodasLabel: 'Ver todas',
  },
)

const router = useRouter()

const onVerTodas = () => {
  router.push({ name: 'rows' })
}
</script>

<template>
  <section>
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold tracking-tight text-foreground">{{ props.title }}</h2>
      <button
        v-if="props.verTodas"
        type="button"
        class="text-sm font-medium text-primary hover:underline"
        @click="onVerTodas"
      >
        {{ props.verTodasLabel }}
      </button>
    </div>

    <CarreiraCarousel />
  </section>
</template>
