import type { LineTelemetry, SensorSnapshot } from './api'
import type { Range } from '@/stores/settings'

export const TELEMETRY_ALERT_LIMITS = {
  soilHumidityMin: 20,
  soilHumidityMax: 80,
  temperatureMin: 10,
  temperatureMax: 35,
  productLevelMin: 20,
  staleAfterMs: 30_000,
} as const

export type AlertSummary = {
  show: boolean
  title: string
  description: string
}

const lineName = (line: LineTelemetry) => `Carreira ${String(line.line_number).padStart(2, '0')}`

export function buildAlertSummary(
  snapshot: SensorSnapshot | null,
  phRange: Range,
  ecRange: Range,
  minWaterLevel: number,
  error: string | null,
  now = Date.now(),
): AlertSummary {
  if (!snapshot || snapshot.id === 0 || snapshot.lines.length === 0) {
    return {
      show: true,
      title: 'Sem dados da estufa',
      description: error ?? 'Aguardando a primeira leitura do backend.',
    }
  }

  const problems: string[] = []
  const add = (message: string) => problems.push(message)

  snapshot.lines.forEach((line) => {
    const name = lineName(line)
    if (line.ph !== null && line.ph < phRange[0]) add(`${name}: pH abaixo do mínimo`)
    if (line.ph !== null && line.ph > phRange[1]) add(`${name}: pH acima do máximo`)
    if (line.conductivity !== null && line.conductivity < ecRange[0]) add(`${name}: EC abaixo do mínimo`)
    if (line.conductivity !== null && line.conductivity > ecRange[1]) add(`${name}: EC acima do máximo`)
    if (line.soil_humidity !== null && line.soil_humidity < TELEMETRY_ALERT_LIMITS.soilHumidityMin) add(`${name}: umidade do solo baixa`)
    if (line.soil_humidity !== null && line.soil_humidity > TELEMETRY_ALERT_LIMITS.soilHumidityMax) add(`${name}: umidade do solo alta`)
  })

  if (snapshot.temperature !== null && snapshot.temperature < TELEMETRY_ALERT_LIMITS.temperatureMin) add('Temperatura externa baixa')
  if (snapshot.temperature !== null && snapshot.temperature > TELEMETRY_ALERT_LIMITS.temperatureMax) add('Temperatura externa alta')
  if (snapshot.water_level !== null && snapshot.water_level < minWaterLevel) add('Nível de água da estufa abaixo do mínimo')
  if (snapshot.product_level !== null && snapshot.product_level < TELEMETRY_ALERT_LIMITS.productLevelMin) add('Nível de produto da estufa baixo')
  if (snapshot.central_water_level !== null && snapshot.central_water_level < minWaterLevel) add('Nível de água central abaixo do mínimo')
  if (snapshot.central_product_level !== null && snapshot.central_product_level < TELEMETRY_ALERT_LIMITS.productLevelMin) add('Nível de produto central baixo')

  const timestamp = new Date(snapshot.timestamp).getTime()
  if (!Number.isFinite(timestamp) || now - timestamp > TELEMETRY_ALERT_LIMITS.staleAfterMs) add('Telemetria desatualizada')
  if (error) add(error)

  if (problems.length === 0) return { show: false, title: '', description: '' }

  return {
    show: true,
    title: problems.length === 1 ? 'Alerta do sistema' : `${problems.length} alertas do sistema`,
    description: problems.join(' • '),
  }
}
