export type HistorySample = {
  timestamp: string
  ph: number | null
  ec: number | null
  humidity: number | null
  temperature: number | null
}

export type HistoryBarItem = {
  label: string
  value: number
}

export type HistoryExportData = {
  rangeLabel: string
  carreiraLabel: string
  samples: HistorySample[]
  chartSamples: HistorySample[]
  barItems: HistoryBarItem[]
  averages: {
    ph: string
    ec: string
    humidity: string
    temperature: string
  }
}

export const HISTORY_IMAGE_WIDTH = 1200
export const HISTORY_IMAGE_HEIGHT = 860

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

const finite = (value: number | null): value is number => value !== null && Number.isFinite(value)

const formatNumber = (value: number | null, digits = 2) => (finite(value) ? value.toFixed(digits) : '—')

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime())
    ? 'Data indisponível'
    : date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

const metricColor = {
  ph: '#f59e0b',
  ec: '#f43f5e',
  humidity: '#10b981',
  temperature: '#0ea5e9',
} as const

const metricLabel = {
  ph: 'pH',
  ec: 'EC',
  humidity: 'Umidade',
  temperature: 'Temperatura',
} as const

type LineMetric = 'ph' | 'ec' | 'humidity'

const chart = (samples: HistorySample[], metric: LineMetric, x: number, y: number, width: number, height: number) => {
  const values = samples.map((sample) => sample[metric]).filter(finite)
  const color = metricColor[metric]
  const title = metricLabel[metric]
  const background = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="24" fill="#f8fafc" stroke="#e2e8f0"/>`
  const heading = `<text x="${x + 24}" y="${y + 34}" fill="#0f172a" font-size="22" font-weight="700">${title}</text>`
  const subtitle = `<text x="${x + 24}" y="${y + 58}" fill="#64748b" font-size="14">Variação no período selecionado</text>`
  const plotX = x + 32
  const plotY = y + 82
  const plotWidth = width - 56
  const plotHeight = height - 112
  const grid = [0, 0.5, 1].map((ratio) => {
    const lineY = plotY + plotHeight * ratio
    return `<line x1="${plotX}" x2="${plotX + plotWidth}" y1="${lineY}" y2="${lineY}" stroke="#e2e8f0" stroke-width="1"/>`
  }).join('')

  if (!values.length) {
    return `${background}${heading}${subtitle}${grid}<text x="${plotX}" y="${plotY + plotHeight / 2}" fill="#64748b" font-size="16">Sem dados para exibir</text>`
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = Math.max((max - min) * 0.15, 0.5)
  const lower = min - padding
  const upper = max + padding
  const points = samples.flatMap((sample, index) => {
    const value = sample[metric]
    if (!finite(value)) return []
    const pointX = plotX + (samples.length === 1 ? plotWidth / 2 : (index / (samples.length - 1)) * plotWidth)
    const pointY = plotY + plotHeight - ((value - lower) / (upper - lower)) * plotHeight
    return [`${pointX.toFixed(1)},${pointY.toFixed(1)}`]
  })
  const path = points.length > 1 ? `<polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` : ''
  const dots = points.map((point) => {
    const [pointX, pointY] = point.split(',')
    return `<circle cx="${pointX}" cy="${pointY}" r="5" fill="#ffffff" stroke="${color}" stroke-width="3"/>`
  }).join('')
  return `${background}${heading}${subtitle}${grid}${path}${dots}`
}

const barChart = (items: HistoryBarItem[], x: number, y: number, width: number, height: number) => {
  const background = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="24" fill="#f8fafc" stroke="#e2e8f0"/>`
  const heading = `<text x="${x + 24}" y="${y + 34}" fill="#0f172a" font-size="22" font-weight="700">Temperatura média</text>`
  const subtitle = `<text x="${x + 24}" y="${y + 58}" fill="#64748b" font-size="14">Distribuição por blocos do período</text>`
  if (!items.length) {
    return `${background}${heading}${subtitle}<text x="${x + 32}" y="${y + 150}" fill="#64748b" font-size="16">Sem dados para exibir</text>`
  }

  const max = Math.max(...items.map((item) => item.value), 1)
  const plotX = x + 32
  const plotY = y + 82
  const plotWidth = width - 56
  const plotHeight = height - 116
  const gap = Math.min(18, plotWidth / items.length / 4)
  const barWidth = Math.max(8, (plotWidth - gap * (items.length + 1)) / items.length)
  const bars = items.map((item, index) => {
    const barHeight = (item.value / max) * plotHeight
    const barX = plotX + gap + index * (barWidth + gap)
    const barY = plotY + plotHeight - barHeight
    return `<rect x="${barX.toFixed(1)}" y="${barY.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barHeight.toFixed(1)}" rx="8" fill="${metricColor.temperature}"/><text x="${(barX + barWidth / 2).toFixed(1)}" y="${plotY + plotHeight + 24}" text-anchor="middle" fill="#64748b" font-size="13">${escapeXml(item.label)}</text>`
  }).join('')
  return `${background}${heading}${subtitle}<line x1="${plotX}" x2="${plotX + plotWidth}" y1="${plotY + plotHeight}" y2="${plotY + plotHeight}" stroke="#e2e8f0"/>${bars}`
}

export const createHistoryShareText = (data: HistoryExportData) => {
  const lines = [
    'Histórico do sistema hidropônico',
    `Período: ${data.rangeLabel}`,
    `Filtro: ${data.carreiraLabel}`,
    '',
    `pH médio: ${data.averages.ph}`,
    `EC médio: ${data.averages.ec}`,
    `Umidade média: ${data.averages.humidity}%`,
    `Temperatura média: ${data.averages.temperature}°C`,
    `Leituras: ${data.samples.length}`,
  ]
  return lines.join('\n')
}

export const createHistorySvg = (data: HistoryExportData) => {
  const summary = [
    ['pH médio', data.averages.ph, metricColor.ph],
    ['EC médio', data.averages.ec, metricColor.ec],
    ['Umidade média', `${data.averages.humidity}%`, metricColor.humidity],
    ['Temperatura média', `${data.averages.temperature}°C`, metricColor.temperature],
  ] as const
  const cards = summary.map(([label, value, color], index) => {
    const x = 48 + index * 276
    return `<rect x="${x}" y="176" width="252" height="86" rx="18" fill="#f8fafc"/><circle cx="${x + 26}" cy="${202}" r="8" fill="${color}"/><text x="${x + 46}" y="198" fill="#64748b" font-size="14">${escapeXml(label)}</text><text x="${x + 46}" y="230" fill="${color}" font-size="25" font-weight="700">${escapeXml(value)}</text>`
  }).join('')
  const charts = [
    chart(data.chartSamples, 'ph', 48, 290, 532, 250),
    chart(data.chartSamples, 'ec', 620, 290, 532, 250),
    chart(data.chartSamples, 'humidity', 48, 562, 532, 250),
    barChart(data.barItems, 620, 562, 532, 250),
  ].join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${HISTORY_IMAGE_WIDTH}" height="${HISTORY_IMAGE_HEIGHT}" viewBox="0 0 ${HISTORY_IMAGE_WIDTH} ${HISTORY_IMAGE_HEIGHT}"><rect width="100%" height="100%" fill="#ffffff"/><text x="48" y="68" fill="#0f172a" font-family="Arial, sans-serif" font-size="34" font-weight="700">Histórico do sistema</text><text x="48" y="102" fill="#64748b" font-family="Arial, sans-serif" font-size="18">${escapeXml(data.rangeLabel)} · ${escapeXml(data.carreiraLabel)}</text><text x="48" y="138" fill="#94a3b8" font-family="Arial, sans-serif" font-size="14">${data.samples.length} leitura(s) · Exportado em ${escapeXml(formatDate(new Date().toISOString()))}</text>${cards}${charts}</svg>`
}

const pdfSafe = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '?').replace(/[\\()]/g, '\\$&')

export const createHistoryPdf = (data: HistoryExportData) => {
  const lines = [
    'HISTORICO DO SISTEMA HIDROPONICO',
    `Periodo: ${data.rangeLabel}`,
    `Filtro: ${data.carreiraLabel}`,
    `Leituras: ${data.samples.length}`,
    '',
    'RESUMO DO PERIODO',
    `pH medio: ${data.averages.ph}`,
    `EC medio: ${data.averages.ec}`,
    `Umidade media: ${data.averages.humidity}%`,
    `Temperatura media: ${data.averages.temperature} C`,
    '',
    'LEITURAS (data/hora | pH | EC | umidade | temperatura)',
    ...data.samples.map((sample) => `${formatDate(sample.timestamp)} | ${formatNumber(sample.ph)} | ${formatNumber(sample.ec)} | ${formatNumber(sample.humidity, 1)}% | ${formatNumber(sample.temperature, 1)} C`),
  ]
  const pageLines: string[][] = []
  const linesPerPage = 43
  for (let index = 0; index < lines.length; index += linesPerPage) {
    pageLines.push(lines.slice(index, index + linesPerPage))
  }
  if (!pageLines.length) pageLines.push([])

  const objects: string[] = []
  const addObject = (value: string) => {
    objects.push(value)
    return objects.length
  }
  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  const pageIds: number[] = []
  const contentIds: number[] = []
  pageLines.forEach((page) => {
    const commands = ['BT', '/F1 16 Tf', '48 794 Td', `(${pdfSafe(page[0] ?? '')}) Tj`, '/F1 10 Tf']
    page.slice(1).forEach((line) => commands.push(`0 -16 Td (${pdfSafe(line)}) Tj`))
    commands.push('ET')
    contentIds.push(addObject(`<< /Length ${commands.join('\n').length} >>\nstream\n${commands.join('\n')}\nendstream`))
    pageIds.push(0)
  })
  const pagesObjectId = objects.length + pageLines.length + 1
  pageLines.forEach((_, index) => {
    pageIds[index] = addObject(`<< /Type /Page /Parent ${pagesObjectId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`)
  })
  addObject(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`)
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesObjectId} 0 R >>`)

  let pdf = '%PDF-1.4\n% generated by Sistema Hidroponico\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n` })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return new Blob([pdf], { type: 'application/pdf' })
}

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export const exportHistoryImage = async (data: HistoryExportData, filename: string) => {
  const svgBlob = new Blob([createHistorySvg(data)], { type: 'image/svg+xml;charset=utf-8' })
  const objectUrl = URL.createObjectURL(svgBlob)
  try {
    const image = new Image()
    image.decoding = 'async'
    image.src = objectUrl
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Não foi possível preparar a imagem.'))
    })
    const canvas = document.createElement('canvas')
    canvas.width = HISTORY_IMAGE_WIDTH
    canvas.height = HISTORY_IMAGE_HEIGHT
    const context = canvas.getContext('2d')
    if (!context) throw new Error('O navegador não disponibilizou o canvas.')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0)
    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Não foi possível gerar o PNG.')), 'image/png')
    })
    downloadBlob(png, filename)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
