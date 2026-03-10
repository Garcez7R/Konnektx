import type { SalonProfile } from './api'

export const DEMO_SALON: SalonProfile = {
  slug: 'aurora',
  name: 'Salão Aurora',
  city: 'Pelotas - RS',
  tagline: 'Cortes modernos e experiência premium.',
  logoUrl: '',
  coverUrl: '/cover-placeholder.svg',
  themePrimary: '#002D20',
  themeSecondary: '#C5A059',
  templateKey: 'aurora',
  services: [
    { id: 'svc-demo-1', name: 'Corte masculino', durationMinutes: 45, priceCents: 6500 },
    { id: 'svc-demo-2', name: 'Barba completa', durationMinutes: 30, priceCents: 4500 },
    { id: 'svc-demo-3', name: 'Combo corte + barba', durationMinutes: 70, priceCents: 9800 },
  ],
  staff: [
    { id: 'staff-demo-1', name: 'Lívia Costa', role: 'Master barber' },
    { id: 'staff-demo-2', name: 'Rafael Nunes', role: 'Estilista' },
  ],
  loyalty: {
    rewardDescription: 'Ganhe 1 ponto por corte. A cada 10, um serviço grátis.',
    targetPoints: 10,
    pointsPerService: 1,
  },
}

export function getDemoSalon(slug: string) {
  if (slug === 'aurora') {
    return DEMO_SALON
  }
  return null
}
