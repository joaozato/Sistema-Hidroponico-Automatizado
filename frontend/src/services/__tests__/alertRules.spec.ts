import { describe, expect, it } from 'vitest'
import { buildAlertSummary } from '../alertRules'
import type { SensorSnapshot } from '../api'

const snapshot = (overrides: Partial<SensorSnapshot> = {}): SensorSnapshot => ({
  id: 1,
  timestamp: new Date().toISOString(),
  temperature: 24,
  humidity: 60,
  water_level: 80,
  product_level: 80,
  central_water_level: 80,
  central_product_level: 80,
  lines: [{
    line_number: 1,
    soil_humidity: 50,
    ph: 6,
    conductivity: 1.7,
    pump_state: [],
    flow_state: [],
  }],
  ...overrides,
})

describe('buildAlertSummary', () => {
  it('alerta níveis baixos e umidade do solo sem alterar a UI', () => {
    const result = buildAlertSummary(snapshot({
      water_level: 10,
      product_level: 10,
      lines: [{
        line_number: 1,
        soil_humidity: 10,
        ph: 6,
        conductivity: 1.7,
        pump_state: [],
        flow_state: [],
      }],
    }), [5.5, 6.5], [1, 2], 20, null)

    expect(result.show).toBe(true)
    expect(result.description).toContain('Nível de água da estufa')
    expect(result.description).toContain('Nível de produto da estufa')
    expect(result.description).toContain('umidade do solo baixa')
  })

  it('alerta ausência de telemetria', () => {
    const result = buildAlertSummary(null, [5.5, 6.5], [1, 2], 20, null)
    expect(result).toEqual({
      show: true,
      title: 'Sem dados da estufa',
      description: 'Aguardando a primeira leitura do backend.',
    })
  })

  it('não alerta quando a leitura está válida e dentro dos limites', () => {
    const result = buildAlertSummary(snapshot(), [5.5, 6.5], [1, 2], 20, null)
    expect(result.show).toBe(false)
  })
})
