const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

type SalonProfile = {
  slug: string
  name: string
  city: string
  tagline: string | null
  logoUrl: string | null
  coverUrl: string | null
  services: Array<{ name: string; durationMinutes: number; priceCents: number }>
  staff: Array<{ name: string; role: string }>
  loyalty?: { rewardDescription: string; targetPoints: number; pointsPerService: number } | null
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

async function getSalonProfile(env: Env, slug: string): Promise<SalonProfile | null> {
  const salon = await env.DB.prepare(
    'SELECT id, slug, name, city, tagline, logo_url as logoUrl, cover_url as coverUrl FROM salons WHERE slug = ? LIMIT 1'
  )
    .bind(slug)
    .first<{
      id: string
      slug: string
      name: string
      city: string
      tagline: string | null
      logoUrl: string | null
      coverUrl: string | null
    }>()

  if (!salon) {
    return null
  }

  const services = await env.DB.prepare(
    'SELECT name, duration_minutes as durationMinutes, price_cents as priceCents FROM services WHERE salon_id = ? AND active = 1 ORDER BY sort_order ASC'
  )
    .bind(salon.id)
    .all<{ name: string; durationMinutes: number; priceCents: number }>()

  const staff = await env.DB.prepare(
    'SELECT name, role FROM staff WHERE salon_id = ? AND active = 1 ORDER BY name ASC'
  )
    .bind(salon.id)
    .all<{ name: string; role: string }>()

  const loyalty = await env.DB.prepare(
    'SELECT reward_description as rewardDescription, target_points as targetPoints, points_per_service as pointsPerService FROM loyalty_rules WHERE salon_id = ? LIMIT 1'
  )
    .bind(salon.id)
    .first<{ rewardDescription: string; targetPoints: number; pointsPerService: number }>()

  return {
    slug: salon.slug,
    name: salon.name,
    city: salon.city,
    tagline: salon.tagline,
    logoUrl: salon.logoUrl,
    coverUrl: salon.coverUrl,
    services: services.results ?? [],
    staff: staff.results ?? [],
    loyalty: loyalty ?? null,
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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
      const profile = await getSalonProfile(env, slug)
      if (!profile) {
        return jsonResponse({ error: 'Salao nao encontrado' }, { status: 404 })
      }
      return jsonResponse(profile)
    }

    return jsonResponse({ error: 'Rota nao encontrada' }, { status: 404 })
  },
} satisfies ExportedHandler<Env>
