<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, useAttrs } from 'vue'
import type { SliderRootProps } from 'reka-ui'
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<SliderRootProps & { class?: HTMLAttributes['class'] }>()
const attrs = useAttrs()

const thumbs = computed(() => {
  if (Array.isArray(props.modelValue) && props.modelValue.length > 0) return props.modelValue
  if (Array.isArray(props.defaultValue) && props.defaultValue.length > 0) return props.defaultValue
  return [0]
})

const forwarded = computed(() => {
  const { class: _class, ...attrsNoClass } = attrs as Record<string, unknown>
  const { class: _propsClass, ...delegated } = props
  return { ...attrsNoClass, ...delegated }
})
</script>

<template>
  <SliderRoot
    data-slot="slider"
    v-bind="forwarded"
    :class="cn('relative flex w-full touch-none select-none items-center', props.class, (attrs as any).class)"
  >
    <SliderTrack
      data-slot="slider-track"
      class="relative h-2 w-full grow overflow-hidden rounded-full bg-muted"
    >
      <SliderRange data-slot="slider-range" class="absolute h-full bg-primary" />
    </SliderTrack>

    <SliderThumb
      v-for="(thumb, index) in thumbs"
      :key="index"
      data-slot="slider-thumb"
      class="block size-5 rounded-full border border-border bg-background shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    />
  </SliderRoot>
</template>
