import { describe, expect, it } from 'vitest'
import {
  createHistoryPdf,
  createHistoryShareText,
  createHistorySvg,
  type HistoryExportData,
} from './historyExport'

const exportData: HistoryExportData = {
  rangeLabel: '7d',
  carreiraLabel: 'Linha 1',
  samples: [{ timestamp: '2026-09-01T12:00:00.000Z', ph: 6.2, ec: 1.4, humidity: 72, temperature: 23.5 }],
  chartSamples: [{ timestamp: '2026-09-01T12:00:00.000Z', ph: 6.2, ec: 1.4, humidity: 72, temperature: 23.5 }],
  barItems: [{ label: 'P1', value: 23.5 }],
  averages: { ph: '6.20', ec: '1.40', humidity: '72', temperature: '23.5' },
}

describe('history export', () => {
  it('builds a share summary with the active filters and averages', () => {
    const text = createHistoryShareText(exportData)

    expect(text).toContain('Período: 7d')
    expect(text).toContain('Filtro: Linha 1')
    expect(text).toContain('Temperatura média: 23.5°C')
  })

  it('builds an image report with the history charts', () => {
    const svg = createHistorySvg(exportData)

    expect(svg).toContain('<svg')
    expect(svg).toContain('Histórico do sistema')
    expect(svg).toContain('Temperatura média')
    expect(svg).toContain('6.20')
  })

  it('builds a downloadable PDF blob', async () => {
    const pdf = createHistoryPdf(exportData)
    const content = new TextDecoder().decode(await pdf.arrayBuffer())

    expect(pdf.type).toBe('application/pdf')
    expect(content).toContain('%PDF-1.4')
    expect(content).toContain('HISTORICO DO SISTEMA HIDROPONICO')
    expect(content).toContain('xref')
  })
})
