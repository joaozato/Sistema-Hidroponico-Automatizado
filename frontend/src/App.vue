<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { HistoryIcon, HouseIcon, Settings2Icon } from 'lucide-vue-next'

const route = useRoute()

const tabs = [
  { label: 'Início', name: 'home' as const, to: { name: 'home' as const }, icon: HouseIcon },
  { label: 'Histórico', name: 'history' as const, to: { name: 'history' as const }, icon: HistoryIcon },
  { label: 'Ajustes', name: 'settings' as const, to: { name: 'settings' as const }, icon: Settings2Icon },
]

const activeTabName = computed(() => route.name)
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col">
    <div class="flex-1">
      <RouterView />
    </div>

    <nav class="sticky bottom-0 z-50 border-t bg-background">
      <div class="mx-auto w-full max-w-md px-4 py-3">
        <div class="grid grid-cols-3 gap-1 rounded-2xl border border-neutral-200 bg-card p-1 shadow-sm">
          <RouterLink
            v-for="tab in tabs"
            :key="tab.name"
            :to="tab.to"
            class="rounded-xl px-3 py-2.5 text-center transition-colors"
            :class="
              activeTabName === tab.name
                ? 'bg-muted/50 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            "
            :aria-current="activeTabName === tab.name ? 'page' : undefined"
          >
            <div class="flex flex-col items-center justify-center gap-1">
              <component :is="tab.icon" class="size-5" aria-hidden="true" />
              <span class="text-[11px] font-semibold leading-none">{{ tab.label }}</span>
            </div>
          </RouterLink>
        </div>
      </div>
    </nav>
  </div>
</template>
