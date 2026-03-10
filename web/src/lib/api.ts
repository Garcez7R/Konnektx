import { clearAccessToken, getAccessToken } from './auth'

export type SalonService = {
  id?: string
  name: string
  durationMinutes: number
  priceCents: number
}

export type SalonStaff = {
  id?: string
  name: string
  role: string
}

export type SalonProfile = {
  slug: string
  name: string
  city: string
  tagline: string
  logoUrl?: string | null
  coverUrl?: string | null
  themePrimary?: string | null
  themeSecondary?: string | null
  templateKey?: string | null
  loyalty?: {
    rewardDescription: string
    targetPoints: number
    pointsPerService: number
  } | null
  services: SalonService[]
  staff: SalonStaff[]
}

const DEFAULT_API_BASE = import.meta.env.DEV
  ? 'http://localhost:8787'
  : 'https://konnektx-api.rgs-dba7.workers.dev'

export const API_BASE = import.meta.env.VITE_API_BASE || DEFAULT_API_BASE

function withAuth(init: RequestInit = {}) {
  const token = getAccessToken()
  const headers = new Headers(init.headers || {})
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return { ...init, headers }
}

async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, withAuth(init))
}

export async function fetchSalon(slug: string): Promise<SalonProfile> {
  const response = await authFetch(`${API_BASE}/api/salons/${slug}`)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao carregar o salao')
  }
  return response.json() as Promise<SalonProfile>
}

export async function fetchMe(): Promise<{ user: { name: string; email: string; role?: string } | null }> {
  const response = await authFetch(`${API_BASE}/api/auth/me`)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao carregar usuario')
  }
  return response.json() as Promise<{ user: { name: string; email: string; role?: string } | null }>
}

export async function logout(): Promise<void> {
  await authFetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
  })
  clearAccessToken()
}

export async function fetchAdminSalons() {
  const response = await authFetch(`${API_BASE}/api/admin/salons`)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao carregar saloes')
  }
  return response.json() as Promise<{ salons: Array<{ id: string; slug: string; name: string; city: string }> }>
}

export async function fetchOwnerSalons() {
  const response = await authFetch(`${API_BASE}/api/owner/salons`)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao carregar saloes')
  }
  return response.json() as Promise<{ salons: Array<{ id: string; slug: string; name: string; city: string; role: string }> }>
}

export async function addSalonMember(slug: string, payload: { email: string; role?: string }) {
  const response = await authFetch(`${API_BASE}/api/admin/salons/${slug}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao vincular usuario')
  }
}

export async function fetchSalonMembers(slug: string) {
  const response = await authFetch(`${API_BASE}/api/admin/salons/${slug}/members`)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao carregar membros')
  }
  return response.json() as Promise<{ members: Array<{ email: string; name: string; role: string; active: number }> }>
}

export async function updateSalonMember(slug: string, payload: { email: string; active?: number; role?: string }) {
  const response = await authFetch(`${API_BASE}/api/admin/salons/${slug}/members`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao atualizar membro')
  }
}

export async function validateSlug(slug: string) {
  const response = await authFetch(`${API_BASE}/api/admin/slug-check?slug=${slug}`)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao validar slug')
  }
  return response.json() as Promise<{ available: boolean }>
}

export async function createSalon(payload: { slug: string; name: string; city: string; tagline?: string }) {
  const response = await fetch(`${API_BASE}/api/admin/salons`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao criar salao')
  }
  return response.json() as Promise<{ id: string }>
}

export async function fetchMetrics(slug: string) {
  const response = await authFetch(`${API_BASE}/api/admin/metrics?salon=${slug}`)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao carregar metricas')
  }
  return response.json() as Promise<{ appointments: number; customers: number }>
}

export async function updateSalon(slug: string, payload: Partial<SalonProfile>) {
  const response = await authFetch(`${API_BASE}/api/salons/${slug}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao atualizar salao')
  }
}

export async function fetchServices(slug: string) {
  const response = await authFetch(`${API_BASE}/api/salons/${slug}/services`)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao carregar servicos')
  }
  return response.json() as Promise<{ services: Array<{ id: string; name: string; durationMinutes: number; priceCents: number; active: number }> }>
}

export async function createService(slug: string, payload: { name: string; durationMinutes: number; priceCents: number }) {
  const response = await authFetch(`${API_BASE}/api/salons/${slug}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao criar servico')
  }
  return response.json() as Promise<{ id: string }>
}

export async function fetchStaff(slug: string) {
  const response = await authFetch(`${API_BASE}/api/salons/${slug}/staff`)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao carregar equipe')
  }
  return response.json() as Promise<{ staff: Array<{ id: string; name: string; role: string; active: number }> }>
}

export async function createStaff(slug: string, payload: { name: string; role: string }) {
  const response = await authFetch(`${API_BASE}/api/salons/${slug}/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao criar membro')
  }
  return response.json() as Promise<{ id: string }>
}

export async function fetchAppointments(slug: string) {
  const response = await authFetch(`${API_BASE}/api/salons/${slug}/appointments`)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao carregar agenda')
  }
  return response.json() as Promise<{ appointments: Array<{ id: string; startsAt: string; endsAt: string; status: string; serviceName: string; customerName: string }> }>
}

export async function createAppointment(slug: string, payload: { serviceId: string; staffId?: string; startsAt: string; notes?: string }) {
  const response = await authFetch(`${API_BASE}/api/salons/${slug}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao agendar')
  }
  return response.json() as Promise<{ id: string }>
}

export async function fetchCustomers(slug: string) {
  const response = await authFetch(`${API_BASE}/api/salons/${slug}/customers`)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao carregar clientes')
  }
  return response.json() as Promise<{ customers: Array<{ id: string; name: string; email: string }> }>
}
