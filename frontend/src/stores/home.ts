import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Carreira, GeneralInfoItem } from '@/components/home/types'
import { api, type LineTelemetry, type SensorSnapshot } from '@/services/api'
import { useSettingsStore } from './settings'
import { BadgeCheckIcon, DropletsIcon, ThermometerIcon, WavesIcon } from 'lucide-vue-next'

type HomeUser = {
  name: string
  initials: string
  avatarSrc?: string
}

export const useHomeStore = defineStore('home', () => {
  const settingsStore = useSettingsStore()
  const user = ref<HomeUser>({ name: 'Pedro', initials: 'PS' })
  const greeting = ref('Bom dia')
  const snapshot = ref<SensorSnapshot | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const selectedCarreiraId = ref<number | null>(null)
  let pollingTimer: ReturnType<typeof setInterval> | undefined

  const lineToCarreira = (line: LineTelemetry): Carreira => {
    const phOutOfRange = line.ph !== null && (line.ph < settingsStore.phIdealRange[0] || line.ph > settingsStore.phIdealRange[1])
    const ecOutOfRange = line.conductivity !== null &&
      (line.conductivity < settingsStore.ecIdealRange[0] || line.conductivity > settingsStore.ecIdealRange[1])

    return {
      id: line.line_number,
      nome: `Carreira ${String(line.line_number).padStart(2, '0')}`,
      status: phOutOfRange || ecOutOfRange ? 'alerta' : 'ok',
      ph: line.ph,
      ec: line.conductivity,
      umidade: line.soil_humidity,
      pumpState: line.pump_state ?? [],
      flowState: line.flow_state ?? [],
    }
  }

  const carreiras = computed(() => (snapshot.value?.lines ?? []).map(lineToCarreira))
  const hasAlert = computed(() => carreiras.value.some((item) => item.status === 'alerta'))
  const alert = computed(() => {
    const affected = carreiras.value.find((item) => item.status === 'alerta')
    return {
      show: Boolean(affected),
      title: affected ? `Alerta na ${affected.nome}` : '',
      description: affected ? 'pH ou condutividade fora da faixa configurada.' : '',
    }
  })

  const formatValue = (value: number | null | undefined, suffix = '') =>
    value === null || value === undefined ? '—' : `${value.toFixed(1)}${suffix}`

  const statusSistema = computed(() => {
    if (error.value && !snapshot.value) return 'Sem conexão'
    if (hasAlert.value) return 'Atenção'
    return 'Normal'
  })

  const generalInfos = computed<GeneralInfoItem[]>(() => [
    { label: 'Temperatura externa', value: formatValue(snapshot.value?.temperature, ' °C'), icon: ThermometerIcon, color: 'text-sky-500', fullWidth: false },
    { label: 'Status', value: statusSistema.value, icon: BadgeCheckIcon, color: hasAlert.value ? 'text-amber-500' : 'text-emerald-500', iconFill: 'none', fullWidth: false },
    { label: 'Nível da estufa', value: formatValue(snapshot.value?.water_level, '%'), icon: DropletsIcon, color: 'text-blue-800', iconFill: 'none', fullWidth: false },
    { label: 'Abastecimento central', value: formatValue(snapshot.value?.central_water_level, '%'), icon: WavesIcon, color: 'text-cyan-600', iconFill: 'none', fullWidth: false },
  ])

  const loadSnapshot = async () => {
    if (loading.value) return
    loading.value = true
    error.value = null
    try {
      snapshot.value = await api.getCurrent()
      lastUpdated.value = new Date()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Não foi possível carregar a telemetria.'
    } finally {
      loading.value = false
    }
  }

  const startPolling = () => {
    if (pollingTimer) return
    void loadSnapshot()
    pollingTimer = setInterval(() => void loadSnapshot(), 10_000)
  }

  const stopPolling = () => {
    if (pollingTimer) clearInterval(pollingTimer)
    pollingTimer = undefined
  }

  const controlPump = async (lineNumber: number, pumpNumber: number, enabled: boolean, flow: number) => {
    const result = await api.updatePump(lineNumber, pumpNumber, { enabled, flow })
    if (snapshot.value) {
      snapshot.value = {
        ...snapshot.value,
        lines: snapshot.value.lines.map((line) => line.line_number === lineNumber ? result.line : line),
      }
    }
  }

  const toggleCarreira = (id: number) => {
    selectedCarreiraId.value = selectedCarreiraId.value === id ? null : id
  }

  return {
    user,
    userName: computed(() => user.value.name),
    initials: computed(() => user.value.initials),
    avatarSrc: computed(() => user.value.avatarSrc),
    greeting,
    alert,
    carreiras,
    selectedCarreiraId,
    generalInfos,
    loading,
    error,
    lastUpdated,
    snapshot,
    loadSnapshot,
    startPolling,
    stopPolling,
    controlPump,
    toggleCarreira,
  }
})
