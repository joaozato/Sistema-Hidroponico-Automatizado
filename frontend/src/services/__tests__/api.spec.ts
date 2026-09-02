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

  it('envia comando individual com caminho e payload corretos', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ line: { line_number: 2 } }), { status: 200 })))

    await api.updatePump(2, 4, { enabled: true, flow: 12 })

    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/control/lines/2/pumps/4',
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ enabled: true, flow: 12 }) }),
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
