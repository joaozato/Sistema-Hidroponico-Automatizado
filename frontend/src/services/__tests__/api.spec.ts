import { afterEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError } from '../api'

afterEach(() => vi.restoreAllMocks())

describe('api', () => {
  it('carrega o snapshot atual com as três linhas', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ lines: [{ line_number: 1 }] }), { status: 200 })))

    const result = await api.getCurrent()

    expect(result.lines[0]?.line_number).toBe(1)
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/api/sensors/current', expect.objectContaining({ headers: { 'Content-Type': 'application/json' } }))
  })

  it('salva o modo manual e os limites de automação', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 1 }), { status: 200 })))

    await api.updateConfig({
      is_auto_mode: false,
      target_ph_min: 5.5,
      target_ph_max: 6.5,
      target_conductivity_min: 1,
      target_conductivity_max: 2,
      min_water_level: 20,
    })

    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/config',
      expect.objectContaining({ method: 'PUT' }),
    )
  })

  it('converte erro HTTP em ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'Modo automático ativo' }), { status: 400 })))

    await expect(api.getConfig()).rejects.toEqual(expect.objectContaining({
      name: 'ApiError',
      status: 400,
      message: 'Modo automático ativo',
    } satisfies Partial<ApiError>))
  })
})
