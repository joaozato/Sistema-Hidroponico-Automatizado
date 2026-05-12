<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <Card class="rounded-2xl">
    <CardHeader class="border-b border-border">
      <CardTitle class="leading-snug">Modo manual</CardTitle>
      <CardDescription class="leading-relaxed">Quando ativo, o sistema não aplica automações.</CardDescription>
    </CardHeader>

    <CardContent>
      <div class="flex items-center justify-between gap-4">
        <label for="manual-mode" class="text-sm font-medium leading-snug text-foreground">
          Ligar/desligar modo manual
        </label>
        <Switch
          id="manual-mode"
          :model-value="modelValue"
          @update:model-value="$emit('update:modelValue', $event as boolean)"
        />
      </div>
    </CardContent>
  </Card>
</template>
