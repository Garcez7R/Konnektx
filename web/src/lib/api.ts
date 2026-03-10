export type SalonService = {
  name: string
  durationMinutes: number
  priceCents: number
}

export type SalonStaff = {
  name: string
  role: string
}

export type SalonProfile = {
  slug: string
  name: string
  city: string
  tagline: string
  logoUrl?: string
  coverUrl?: string
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

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787'

export async function fetchSalon(slug: string): Promise<SalonProfile> {
  const response = await fetch(`${API_BASE}/api/salons/${slug}`)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao carregar o salao')
  }
  return response.json() as Promise<SalonProfile>
}

export async function fetchMe(): Promise<{ user: { name: string; email: string; role?: string } | null }> {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    credentials: 'include',
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao carregar usuario')
  }
  return response.json() as Promise<{ user: { name: string; email: string } | null }>
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}

export async function fetchAdminSalons() {\n  const response = await fetch(`${API_BASE}/api/admin/salons`, { credentials: 'include' })\n  if (!response.ok) {\n    const message = await response.text()\n    throw new Error(message || 'Falha ao carregar saloes')\n  }\n  return response.json() as Promise<{ salons: Array<{ id: string; slug: string; name: string; city: string }> }>\n}\n+\n+export async function fetchMetrics(slug: string) {\n  const response = await fetch(`${API_BASE}/api/admin/metrics?salon=${slug}`, { credentials: 'include' })\n  if (!response.ok) {\n    const message = await response.text()\n    throw new Error(message || 'Falha ao carregar metricas')\n  }\n  return response.json() as Promise<{ appointments: number; customers: number }>\n}\n+\n+export async function updateSalon(slug: string, payload: Partial<SalonProfile>) {\n  const response = await fetch(`${API_BASE}/api/salons/${slug}`, {\n    method: 'PATCH',\n    credentials: 'include',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(payload),\n  })\n  if (!response.ok) {\n    const message = await response.text()\n    throw new Error(message || 'Falha ao atualizar salao')\n  }\n}\n+\n+export async function fetchServices(slug: string) {\n  const response = await fetch(`${API_BASE}/api/salons/${slug}/services`, { credentials: 'include' })\n  if (!response.ok) {\n    const message = await response.text()\n    throw new Error(message || 'Falha ao carregar servicos')\n  }\n  return response.json() as Promise<{ services: Array<{ id: string; name: string; durationMinutes: number; priceCents: number; active: number }> }>\n}\n+\n+export async function createService(slug: string, payload: { name: string; durationMinutes: number; priceCents: number }) {\n  const response = await fetch(`${API_BASE}/api/salons/${slug}/services`, {\n    method: 'POST',\n    credentials: 'include',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(payload),\n  })\n  if (!response.ok) {\n    const message = await response.text()\n    throw new Error(message || 'Falha ao criar servico')\n  }\n  return response.json() as Promise<{ id: string }>\n}\n+\n+export async function fetchStaff(slug: string) {\n  const response = await fetch(`${API_BASE}/api/salons/${slug}/staff`, { credentials: 'include' })\n  if (!response.ok) {\n    const message = await response.text()\n    throw new Error(message || 'Falha ao carregar equipe')\n  }\n  return response.json() as Promise<{ staff: Array<{ id: string; name: string; role: string; active: number }> }>\n}\n+\n+export async function createStaff(slug: string, payload: { name: string; role: string }) {\n  const response = await fetch(`${API_BASE}/api/salons/${slug}/staff`, {\n    method: 'POST',\n    credentials: 'include',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(payload),\n  })\n  if (!response.ok) {\n    const message = await response.text()\n    throw new Error(message || 'Falha ao criar membro')\n  }\n  return response.json() as Promise<{ id: string }>\n}\n+\n+export async function fetchAppointments(slug: string) {\n  const response = await fetch(`${API_BASE}/api/salons/${slug}/appointments`, { credentials: 'include' })\n  if (!response.ok) {\n    const message = await response.text()\n    throw new Error(message || 'Falha ao carregar agenda')\n  }\n  return response.json() as Promise<{ appointments: Array<{ id: string; startsAt: string; endsAt: string; status: string; serviceName: string; customerName: string }> }>\n}\n+\n+export async function createAppointment(slug: string, payload: { serviceId: string; staffId?: string; startsAt: string; notes?: string }) {\n  const response = await fetch(`${API_BASE}/api/salons/${slug}/appointments`, {\n    method: 'POST',\n    credentials: 'include',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(payload),\n  })\n  if (!response.ok) {\n    const message = await response.text()\n    throw new Error(message || 'Falha ao agendar')\n  }\n  return response.json() as Promise<{ id: string }>\n}\n+\n+export async function fetchCustomers(slug: string) {\n  const response = await fetch(`${API_BASE}/api/salons/${slug}/customers`, { credentials: 'include' })\n  if (!response.ok) {\n    const message = await response.text()\n    throw new Error(message || 'Falha ao carregar clientes')\n  }\n  return response.json() as Promise<{ customers: Array<{ id: string; name: string; email: string }> }>\n}\n*** End Patch"}]}
