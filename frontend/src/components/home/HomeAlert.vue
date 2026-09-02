<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircleIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/stores/home'

// alerta centralizado no store
const homeStore = useHomeStore()
const { alert, error } = storeToRefs(homeStore)
</script>

<template>
  <Alert v-if="alert.show || error" variant="destructive" class="border-destructive/40 bg-destructive/5">
    <AlertCircleIcon class="size-4 text-destructive" />
    <AlertTitle class="font-semibold text-destructive">{{ error ? 'Falha na telemetria' : alert.title }}</AlertTitle>
    <AlertDescription class="text-destructive">
      {{ error ?? alert.description }}
    </AlertDescription>
  </Alert>
</template>
