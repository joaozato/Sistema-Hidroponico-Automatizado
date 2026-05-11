<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/stores/home'

// infos gerais vêm do store
const homeStore = useHomeStore()
const { generalInfos } = storeToRefs(homeStore)
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <Card
      v-for="info in generalInfos"
      :key="info.label"
      :class="[
        'rounded-2xl border border-neutral-200 shadow-sm bg-card',
        info.fullWidth ? 'col-span-2' : '',
      ]"
    >
      <CardContent class="flex items-center gap-3 p-4">
        <component :is="info.icon" :class="['size-6 shrink-0', info.color]" />
        <div class="leading-tight">
          <p class="text-xs font-medium text-muted-foreground">{{ info.label }}</p>
          <p class="text-base font-semibold tabular-nums text-foreground">{{ info.value }}</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
