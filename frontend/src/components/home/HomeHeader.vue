<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BellIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/stores/home'

// dados do usuário vêm do store para evitar prop drilling
const homeStore = useHomeStore()
const { userName, greeting, initials, avatarSrc } = storeToRefs(homeStore)

defineEmits<{
  notificationsClick: []
}>()
</script>

<template>
  <header class="flex items-center justify-between pt-6">
    <div class="flex items-center gap-3">
      <Avatar class="size-11">
        <AvatarImage :src="avatarSrc ?? ''" alt="Foto de usuário" />
        <AvatarFallback>{{ initials }}</AvatarFallback>
      </Avatar>
      <div class="leading-tight">
        <p class="text-base font-semibold text-foreground">Olá, {{ userName }}!</p>
        <p class="text-sm text-muted-foreground">{{ greeting }}</p>
      </div>
    </div>

    <button
      type="button"
      class="size-10 rounded-full text-muted-foreground hover:text-foreground"
      @click="$emit('notificationsClick')"
    >
      <BellIcon class="mx-auto size-5" />
    </button>
  </header>
</template>
