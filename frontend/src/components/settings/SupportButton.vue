<script setup lang="ts">
import { MessageCircleIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

defineProps<{
  href: string
}>()
</script>

<template>
  <Button
    as="a"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    size="lg"
    class="w-full rounded-2xl h-14"
  >
    <MessageCircleIcon class="size-5" aria-hidden="true" />
    Chamar assistência técnica
  </Button>
</template>
