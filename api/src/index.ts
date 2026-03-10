const demoSalons = new Map([
  [
    'aurora',
    {
      slug: 'aurora',
      name: 'Salao Aurora',
      city: 'Itajuba - MG',
      tagline: 'Cortes modernos, luz natural e experiencia premium.',
      coverUrl: '',
      services: [
        { name: 'Corte masculino', durationMinutes: 45, priceCents: 6500 },
        { name: 'Barba completa', durationMinutes: 30, priceCents: 4500 },
        { name: 'Combo corte + barba', durationMinutes: 70, priceCents: 9800 },
        { name: 'Tratamento capilar', durationMinutes: 50, priceCents: 7200 },
      ],
      staff: [
        { name: 'Livia Costa', role: 'Master barber' },
        { name: 'Rafael Nunes', role: 'Estilista' },
        { name: 'Maya Duarte', role: 'Manicure' },
      ],
    },
  ],
])

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function jsonResponse(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
      ...(init.headers || {}),
    },
  })
}

export default {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    if (pathname === '/api/health') {
      return jsonResponse({ ok: true, name: 'konnektx-api', time: new Date().toISOString() })
    }

    const salonMatch = pathname.match(/^\/api\/salons\/([a-z0-9-]+)$/i)
    if (salonMatch) {
      const slug = salonMatch[1].toLowerCase()
      const salon = demoSalons.get(slug)
      if (!salon) {
        return jsonResponse({ error: 'Salao nao encontrado' }, { status: 404 })
      }
      return jsonResponse(salon)
    }

    return jsonResponse({ error: 'Rota nao encontrada' }, { status: 404 })
  },
} satisfies ExportedHandler<Env>
