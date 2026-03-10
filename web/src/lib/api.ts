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
  services: SalonService[]
  staff: SalonStaff[]
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787'

export async function fetchSalon(slug: string): Promise<SalonProfile> {
  const response = await fetch(`${API_BASE}/api/salons/${slug}`)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao carregar o salao')
  }
  return response.json() as Promise<SalonProfile>
}
