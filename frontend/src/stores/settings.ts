import { ref } from 'vue'
import { defineStore } from 'pinia'

export type Range = [number, number]

export const useSettingsStore = defineStore('settings', () => {
  const manualMode = ref(false)

  // defaults típicos para hidroponia (ajustar de acordo com os dados ideais de verdade)
  const phIdealRange = ref<Range>([5.5, 6.5])
  const ecIdealRange = ref<Range>([1.4, 2.0])

  const setPhIdealRange = (range: Range) => {
    phIdealRange.value = range
  }

  const setEcIdealRange = (range: Range) => {
    ecIdealRange.value = range
  }

  return {
    manualMode,
    phIdealRange,
    ecIdealRange,
    setPhIdealRange,
    setEcIdealRange,
  }
})
