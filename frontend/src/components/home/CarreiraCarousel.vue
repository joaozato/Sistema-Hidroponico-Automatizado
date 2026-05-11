<script setup lang="ts">
import CarreiraCard from './CarreiraCard.vue'
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/stores/home'

// lista e seleção vêm do store para evitar repasse de props
const homeStore = useHomeStore()
const { carreiras } = storeToRefs(homeStore)
</script>

<template>
  <div
    class="-mx-1 mt-1 flex gap-4 overflow-x-auto px-1 py-4 snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    <CarreiraCard
      v-for="carreira in carreiras"
      :key="carreira.id"
      :carreira-id="carreira.id"
    />
  </div>
</template>
