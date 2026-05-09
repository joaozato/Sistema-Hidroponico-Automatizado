<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// componentes ui (shadcn/ui)
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// ícones
import {
    AlertCircleIcon,
    BellIcon,
    DropletIcon,
    CloudIcon,
    ThermometerIcon,
    ZapIcon,
    DropletsIcon,
    CheckCircleIcon,
} from 'lucide-vue-next'
import { createLucideIcon } from 'lucide-vue-next'
import { strawberry } from '@lucide/lab'

// definição de tipos
type Carreira = {
    id: number
    nome: string
    status: 'ok' | 'alerta'
    ph: number
    ec: number
    umidade: number
}

const router = useRouter()
const showAlert = ref(true)
const selectedCarreiraId = ref<number | null>(null)
const StrawberryIcon = createLucideIcon('strawberry', strawberry as any)

// mock de dados das carreiras
const carreiras = ref<Carreira[]>([
    { id: 1, nome: 'Carreira 01', status: 'ok', ph: 6.5, ec: 1.6, umidade: 14 },
    { id: 2, nome: 'Carreira 02', status: 'alerta', ph: 5.4, ec: 1.6, umidade: 14 },
    { id: 3, nome: 'Carreira 03', status: 'ok', ph: 6.5, ec: 1.6, umidade: 14 },
])

// alterna a seleção da carreira para expandir o card
const toggleCarreira = (id: number) => {
    selectedCarreiraId.value = selectedCarreiraId.value === id ? null : id
}

// métricas formatadas para a visão expandida
const getStats = (c: Carreira) => [
    { label: 'pH', value: c.ph.toFixed(1), icon: DropletIcon, color: 'text-amber-500' },
    { label: 'EC', value: c.ec.toFixed(1), icon: ZapIcon, color: 'text-rose-500' },
    { label: 'Umidade', value: `${c.umidade}%`, icon: CloudIcon, color: 'text-emerald-500' },
]

// informações globais do sistema
const generalInfos = [
    { label: 'Temperatura', value: '24 °C', icon: ThermometerIcon, color: 'text-amber-500', fullWidth: false },
    { label: 'Status', value: 'Normal', icon: CheckCircleIcon, color: 'text-emerald-500', fullWidth: false },
    { label: 'Nível do tanque', value: '84%', icon: DropletsIcon, color: 'text-sky-500', fullWidth: true },
]
</script>

<template>
    <div class="min-h-screen bg-background">
        <div class="mx-auto w-full max-w-md px-4 pb-10">

            <!-- cabeçalho -->
            <header class="flex items-center justify-between pt-6">
                <div class="flex items-center gap-3">
                    <Avatar class="size-11">
                        <AvatarImage src="" alt="Foto de usuário" />
                        <AvatarFallback>PS</AvatarFallback>
                    </Avatar>
                    <div class="leading-tight">
                        <p class="text-base font-semibold text-foreground">Olá, Pedro!</p>
                        <p class="text-sm text-muted-foreground">Bom dia</p>
                    </div>
                </div>
                <button class="size-10 rounded-full text-muted-foreground hover:text-foreground">
                    <BellIcon class="size-5 mx-auto" />
                </button>
            </header>

            <main class="mt-5 flex flex-col gap-6">
                <!-- alertas -->
                <Alert v-if="showAlert" variant="destructive" class="border-destructive/40 bg-destructive/5">
                    <AlertCircleIcon class="size-4 text-destructive" />
                    <AlertTitle class="font-semibold text-destructive">Alerta na Carreira 2!</AlertTitle>
                    <AlertDescription class="text-destructive">
                        Nível de pH abaixo do ideal. Verifique a solução nutritiva.
                    </AlertDescription>
                </Alert>

                <!-- carreiras -->
                <section>
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-semibold tracking-tight text-foreground">Carreiras</h2>
                        <button @click="router.push({ name: 'rows' })"
                            class="text-sm font-medium text-primary hover:underline">
                            Ver todas
                        </button>
                    </div>

                    <div
                        class="mt-1 flex gap-4 overflow-x-auto py-4 px-1 -mx-1 snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <Card v-for="carreira in carreiras" :key="carreira.id" @click="toggleCarreira(carreira.id)"
                            :class="[
                                'relative !overflow-visible shrink-0 cursor-pointer snap-center select-none rounded-2xl gap-2 py-4 border transition-all duration-300 ease-out active:translate-y-0.5 active:shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.1),inset_0_2px_4px_-2px_rgba(0,0,0,0.1)]',
                                selectedCarreiraId === carreira.id
                                    ? 'w-72 bg-neutral-50 shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.1),inset_0_2px_4px_-2px_rgba(0,0,0,0.1)] translate-y-0.5'
                                    : 'w-40 shadow-md bg-card',
                                carreira.status === 'alerta' ? 'ring-2 ring-destructive/30 border-destructive/40' : 'border-neutral-200'
                            ]">
                            <!-- selo de alerta -->
                            <div v-if="carreira.status === 'alerta'"
                                class="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-lg border border-destructive/30 bg-background text-destructive shadow-sm">
                                <AlertCircleIcon class="size-4" />
                            </div>

                            <CardHeader class="px-4 pt-0 pb-1">
                                <CardTitle class="text-sm font-semibold text-foreground">{{ carreira.nome }}</CardTitle>
                            </CardHeader>

                            <CardContent class="px-4 pt-0 h-full">
                                <div class="flex items-stretch gap-3 h-full"
                                    :class="{ 'justify-center': selectedCarreiraId !== carreira.id }">

                                    <!-- grade de morangos -->
                                    <div
                                        class="w-28 shrink-0 flex items-center justify-center rounded-xl border border-neutral-200 bg-background p-2">
                                        <div class="grid grid-cols-2 place-items-center gap-2">
                                            <StrawberryIcon v-for="i in 8" :key="i" class="size-6 text-destructive" />
                                        </div>
                                    </div>

                                    <!-- estatísticas (apenas visão expandida) -->
                                    <div v-show="selectedCarreiraId === carreira.id"
                                        class="flex-1 flex flex-col justify-between rounded-xl border border-border bg-background p-3 animate-in fade-in zoom-in duration-300">

                                        <div v-for="stat in getStats(carreira)" :key="stat.label"
                                            class="flex items-center gap-3">
                                            <component :is="stat.icon" :class="['size-6 shrink-0', stat.color]"
                                                fill="currentColor" />

                                            <div class="leading-none">
                                                <div
                                                    :class="['text-xl font-bold tabular-nums tracking-tight', stat.color]">
                                                    {{ stat.value }}
                                                </div>
                                                <div
                                                    :class="['text-[11px] font-semibold uppercase mt-0.5 opacity-90', stat.color]">
                                                    {{ stat.label }}
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <!-- informações gerais -->
                <section>
                    <h2 class="text-lg font-semibold tracking-tight text-foreground mb-3">Informações Gerais</h2>
                    <div class="grid grid-cols-2 gap-3">

                        <Card v-for="info in generalInfos" :key="info.label" :class="[
                            'rounded-2xl border border-neutral-200 shadow-sm bg-card',
                            info.fullWidth ? 'col-span-2' : ''
                        ]">
                            <CardContent class="flex items-center gap-3 p-4">
                                <component :is="info.icon" :class="['size-6 shrink-0', info.color]" />
                                <div class="leading-tight">
                                    <p class="text-xs font-medium text-muted-foreground">{{ info.label }}</p>
                                    <p class="text-base font-semibold tabular-nums text-foreground">{{ info.value }}</p>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </section>
            </main>

        </div>
    </div>
</template>