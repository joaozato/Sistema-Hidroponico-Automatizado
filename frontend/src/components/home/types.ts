import type { Component } from 'vue'

export type CarreiraStatus = 'ok' | 'alerta'

export type Carreira = {
  id: number
  nome: string
  status: CarreiraStatus
  ph: number
  ec: number
  umidade: number
}

export type StatItem = {
  label: string
  value: string
  icon: Component
  color: string
}

export type GeneralInfoItem = {
  label: string
  value: string
  icon: Component
  color: string
  fullWidth: boolean
}
