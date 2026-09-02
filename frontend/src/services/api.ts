export type LineTelemetry = {
  id?: number
  snapshot_id?: number
  timestamp?: string
  line_number: number
  soil_humidity: number | null
  ph: number | null
  conductivity: number | null
  pump_state: number[]
  flow_state: number[]
}

export type SensorSnapshot = {
  id: number
  timestamp: string
  temperature: number | null
  humidity: number | null
  water_level: number | null
  product_level: number | null
  central_water_level: number | null
  central_product_level: number | null
  lines: LineTelemetry[]
}

export type ControlConfig = {
  id: number
  is_auto_mode: boolean
  target_ph_min: number
  target_ph_max: number
  target_conductivity_min: number
  target_conductivity_max: number
  min_water_level: number
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    })
  } catch {
    throw new ApiError('Não foi possível conectar ao backend.', 0)
  }

  if (!response.ok) {
    let detail = `Erro ${response.status}`
    try {
      const body = await response.json()
      detail = body.detail ?? detail
    } catch {
      // Mantém a mensagem genérica quando a resposta não é JSON.
    }
    throw new ApiError(detail, response.status)
  }

  return response.json() as Promise<T>
}

export const api = {
  getCurrent: () => request<SensorSnapshot>('/api/sensors/current'),
  getHistory: (days: number, lineNumber: number | null) => {
    const params = new URLSearchParams({ days: String(days), limit: '1000' })
    if (lineNumber !== null) params.set('line_number', String(lineNumber))
    return request<SensorSnapshot[]>(`/api/sensors/history?${params.toString()}`)
  },
  getConfig: () => request<ControlConfig>('/api/config'),
  updateConfig: (config: Omit<ControlConfig, 'id'>) =>
    request<ControlConfig>('/api/config', { method: 'PUT', body: JSON.stringify(config) }),
}
