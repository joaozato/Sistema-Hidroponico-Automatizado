<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '.'
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { buttonVariants } from '.'

type ButtonAs = 'button' | 'a'

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
    as?: ButtonAs
    href?: string
    target?: string
    rel?: string
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    as: 'button',
    type: 'button',
  },
)

const isLink = computed(() => props.as === 'a')
</script>

<template>
  <component
    :is="props.as"
    data-slot="button"
    :href="isLink ? props.href : undefined"
    :target="isLink ? props.target : undefined"
    :rel="isLink ? props.rel : undefined"
    :type="!isLink ? props.type : undefined"
    :disabled="!isLink ? props.disabled : undefined"
    :aria-disabled="isLink && props.disabled ? 'true' : undefined"
    :tabindex="isLink && props.disabled ? -1 : undefined"
    :class="cn(buttonVariants({ variant: props.variant, size: props.size }), props.class, isLink && props.disabled ? 'pointer-events-none opacity-50' : '')"
  >
    <slot />
  </component>
</template>
