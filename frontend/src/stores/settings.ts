import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

export type Range = [number, number]

export const useSettingsStore = defineStore('settings', () => {
  const manualMode = ref(false)
  const minWaterLevel = ref(20)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  // defaults típicos para hidroponia (ajustar de acordo com os dados ideais de verdade)
  const phIdealRange = ref<Range>([5.5, 6.5])
  const ecIdealRange = ref<Range>([1.4, 2.0])

  const setPhIdealRange = (range: Range) => {
    phIdealRange.value = range
  }

  const setEcIdealRange = (range: Range) => {
    ecIdealRange.value = range
  }

  const loadConfig = async () => {
    if (loaded.value || loading.value) return
    loading.value = true
    error.value = null
    try {
      const config = await api.getConfig()
      manualMode.value = !config.is_auto_mode
      phIdealRange.value = [config.target_ph_min, config.target_ph_max]
      ecIdealRange.value = [config.target_conductivity_min, config.target_conductivity_max]
      minWaterLevel.value = config.min_water_level
      loaded.value = true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Não foi possível carregar os ajustes.'
    } finally {
      loading.value = false
    }
  }

  const saveConfig = async () => {
    saving.value = true
    error.value = null
    try {
      await api.updateConfig({
        is_auto_mode: !manualMode.value,
        target_ph_min: phIdealRange.value[0],
        target_ph_max: phIdealRange.value[1],
        target_conductivity_min: ecIdealRange.value[0],
        target_conductivity_max: ecIdealRange.value[1],
        min_water_level: minWaterLevel.value,
      })
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Não foi possível salvar os ajustes.'
      throw cause
    } finally {
      saving.value = false
    }
  }

  const setManualMode = async (value: boolean) => {
    const previous = manualMode.value
    manualMode.value = value
    try {
      await saveConfig()
    } catch {
      manualMode.value = previous
    }
  }

  const setRanges = async (ph: Range, ec: Range) => {
    const previousPh = phIdealRange.value
    const previousEc = ecIdealRange.value
    phIdealRange.value = ph
    ecIdealRange.value = ec
    try {
      await saveConfig()
    } catch {
      phIdealRange.value = previousPh
      ecIdealRange.value = previousEc
    }
  }

  const setMinWaterLevel = async (value: number) => {
    const previous = minWaterLevel.value
    minWaterLevel.value = Math.min(100, Math.max(0, value))
    try {
      await saveConfig()
    } catch {
      minWaterLevel.value = previous
    }
  }

  return {
    manualMode,
    phIdealRange,
    ecIdealRange,
    minWaterLevel,
    loading,
    saving,
    error,
    loaded,
    setPhIdealRange,
    setEcIdealRange,
    loadConfig,
    setManualMode,
    setRanges,
    setMinWaterLevel,
  }
})
