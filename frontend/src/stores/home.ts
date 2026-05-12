import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Carreira, GeneralInfoItem } from '@/components/home/types'
import {
  BadgeCheckIcon,
  DropletsIcon,
  ThermometerIcon,
} from 'lucide-vue-next'

type HomeUser = {
  name: string
  initials: string
  avatarSrc?: string
}

type HomeAlert = {
  show: boolean
  title: string
  description: string
}

export const useHomeStore = defineStore('home', () => {
  // estado centralizado da home para evitar prop drilling
  const user = ref<HomeUser>({
    name: 'Pedro',
    initials: 'PS',
  })

  const greeting = ref('Bom dia')

  const alert = ref<HomeAlert>({
    show: true,
    title: 'Alerta na Carreira 02',
    description: 'Nível de pH abaixo do ideal. Verifique a solução nutritiva.',
  })

  // mock de dados das carreiras
  const carreiras = ref<Carreira[]>([
    { id: 1, nome: 'Carreira 01', status: 'ok', ph: 6.5, ec: 1.6, umidade: 14 },
    { id: 2, nome: 'Carreira 02', status: 'alerta', ph: 5.4, ec: 1.6, umidade: 14 },
    { id: 3, nome: 'Carreira 03', status: 'ok', ph: 6.5, ec: 1.6, umidade: 14 },
  ])

  const selectedCarreiraId = ref<number | null>(null)

  // valores simples que geram o grid de infos gerais
  const temperatura = ref('24 °C')
  const statusSistema = ref('Normal')
  const nivelTanque = ref('84%')

  const generalInfos = computed<GeneralInfoItem[]>(() => [
    {
      label: 'Temperatura',
      value: temperatura.value,
      icon: ThermometerIcon,
      color: 'text-sky-500',
      fullWidth: false,
    },
    {
      label: 'Status',
      value: statusSistema.value,
      icon: BadgeCheckIcon,
      color: 'text-emerald-500',
      iconFill: 'none',
      fullWidth: false,
    },
    {
      label: 'Nível do tanque',
      value: nivelTanque.value,
      icon: DropletsIcon,
      color: 'text-blue-800',
      iconFill: 'none',
      fullWidth: true,
    },
  ])

  const userName = computed(() => user.value.name)
  const initials = computed(() => user.value.initials)
  const avatarSrc = computed(() => user.value.avatarSrc)

  const toggleCarreira = (id: number) => {
    selectedCarreiraId.value = selectedCarreiraId.value === id ? null : id
  }

  const closeAlert = () => {
    alert.value.show = false
  }

  return {
    user,
    userName,
    initials,
    avatarSrc,
    greeting,
    alert,
    carreiras,
    selectedCarreiraId,
    generalInfos,
    toggleCarreira,
    closeAlert,
  }
})
