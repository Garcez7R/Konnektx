type SalonProfile = {
  slug: string
  name: string
  city: string
  tagline: string | null
  logoUrl: string | null
  coverUrl: string | null
  themePrimary: string | null
  themeSecondary: string | null
  templateKey: string | null
  services: Array<{ id: string; name: string; durationMinutes: number; priceCents: number }>
  staff: Array<{ id: string; name: string; role: string }>
  loyalty?: { rewardDescription: string; targetPoints: number; pointsPerService: number } | null
}

type SessionUser = {
  id: string
  email: string
  name: string
  role: string
}

function getCorsHeaders(request: Request, env: Env) {
  const origin = request.headers.get('Origin') ?? ''
  const allowedOrigin = env.APP_ORIGIN || origin || '*'
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  if (allowedOrigin !== '*') {
    headers['Access-Control-Allow-Credentials'] = 'true'
  }
  return headers
}

function jsonResponse(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
    },
  })
}

function redirectResponse(url: string, init: ResponseInit = {}) {
  return new Response(null, {
    ...init,
    status: 302,
    headers: {
      Location: url,
      ...(init.headers || {}),
    },
  })
}

function base64UrlEncode(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64UrlEncodeText(text: string) {
  return base64UrlEncode(new TextEncoder().encode(text))
}

async function hmacSign(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return base64UrlEncode(sig)
}

function parseCookies(request: Request) {
  const header = request.headers.get('Cookie') || ''
  return Object.fromEntries(
    header
      .split(';')
      .map((cookie) => {
        const [name, ...rest] = cookie.trim().split('=')
        if (!name) return ['', '']
        return [name, decodeURIComponent(rest.join('='))]
      })
      .filter(([name]) => name)
  )
}

function buildSetCookie(name: string, value: string, options: string[] = []) {
  return [`${name}=${encodeURIComponent(value)}`, 'Path=/', ...options].join('; ')
}

async function createSessionToken(secret: string, payload: Record<string, unknown>, ttlSeconds: number) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  const body = JSON.stringify({ ...payload, exp })
  const bodyB64 = base64UrlEncodeText(body)
  const sig = await hmacSign(secret, bodyB64)
  return `${bodyB64}.${sig}`
}

async function verifySessionToken(secret: string, token: string): Promise<SessionUser | null> {
  const [bodyB64, sig] = token.split('.')
  if (!bodyB64 || !sig) return null
  const expected = await hmacSign(secret, bodyB64)
  if (expected !== sig) return null
  const json = atob(bodyB64.replace(/-/g, '+').replace(/_/g, '/'))
  const data = JSON.parse(json)
  if (!data?.exp || data.exp < Math.floor(Date.now() / 1000)) return null
  return { id: data.id, email: data.email, name: data.name, role: data.role }
}

async function getSessionUser(request: Request, env: Env) {
  const cookies = parseCookies(request)
  const token = cookies.konnektx_session
  if (!token || !env.SESSION_SECRET) return null
  return verifySessionToken(env.SESSION_SECRET, token)
}

function requireAuth(user: SessionUser | null) {
  if (!user) {
    return jsonResponse({ error: 'Nao autenticado' }, { status: 401 })
  }
  return null
}

function requirePlatformAdmin(user: SessionUser | null) {
  if (!user || user.role !== 'platform_admin') {
    return jsonResponse({ error: 'Sem permissao' }, { status: 403 })
  }
  return null
}

function requireSalonAccess(user: SessionUser | null, memberRole?: string | null) {
  if (!user) {
    return jsonResponse({ error: 'Nao autenticado' }, { status: 401 })
  }
  if (user.role === 'platform_admin') {
    return null
  }
  if (!memberRole) {
    return jsonResponse({ error: 'Sem permissao' }, { status: 403 })
  }
  return null
}

async function getSalonMemberRole(env: Env, salonId: string, userId: string) {
  return env.DB.prepare(
    'SELECT role FROM salon_members WHERE salon_id = ? AND user_id = ? AND active = 1 LIMIT 1'
  )
    .bind(salonId, userId)
    .first<{ role: string }>()
}

async function getSalonBySlug(env: Env, slug: string) {
  return env.DB.prepare(
    'SELECT id, slug, name, city, tagline, logo_url as logoUrl, cover_url as coverUrl, theme_primary as themePrimary, theme_secondary as themeSecondary, template_key as templateKey FROM salons WHERE slug = ? LIMIT 1'
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
      themePrimary: string | null
      themeSecondary: string | null
      templateKey: string | null
    }>()
}

async function getSalonProfile(env: Env, slug: string): Promise<SalonProfile | null> {
  const salon = await getSalonBySlug(env, slug)
  if (!salon) return null

  const services = await env.DB.prepare(
    'SELECT id, name, duration_minutes as durationMinutes, price_cents as priceCents FROM services WHERE salon_id = ? AND active = 1 ORDER BY sort_order ASC'
  )
    .bind(salon.id)
    .all<{ id: string; name: string; durationMinutes: number; priceCents: number }>()

  const staff = await env.DB.prepare(
    'SELECT id, name, role FROM staff WHERE salon_id = ? AND active = 1 ORDER BY name ASC'
  )
    .bind(salon.id)
    .all<{ id: string; name: string; role: string }>()

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
    themePrimary: salon.themePrimary,
    themeSecondary: salon.themeSecondary,
    templateKey: salon.templateKey,
    services: services.results ?? [],
    staff: staff.results ?? [],
    loyalty: loyalty ?? null,
  }
}

async function exchangeGoogleCode(code: string, env: Env, redirectUri: string) {
  const params = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao trocar codigo do Google')
  }
  return response.json() as Promise<{ access_token: string }>
}

async function fetchGoogleProfile(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao buscar usuario Google')
  }
  return response.json() as Promise<{ sub: string; email: string; name: string }>
}

function isMasterEmail(env: Env, email: string) {
  return env.MASTER_EMAIL && email.toLowerCase() === env.MASTER_EMAIL.toLowerCase()
}

async function upsertUser(env: Env, profile: { sub: string; email: string; name: string }) {
  const existing = await env.DB.prepare('SELECT id, role FROM users WHERE email = ? LIMIT 1')
    .bind(profile.email)
    .first<{ id: string; role: string }>()
  if (existing) {
    const nextRole = isMasterEmail(env, profile.email) ? 'platform_admin' : existing.role
    await env.DB.prepare('UPDATE users SET name = ?, google_sub = ?, role = ? WHERE id = ?')
      .bind(profile.name, profile.sub, nextRole, existing.id)
      .run()
    return { id: existing.id, role: nextRole }
  }

  const id = `user_${crypto.randomUUID()}`
  const role = isMasterEmail(env, profile.email) ? 'platform_admin' : 'customer'
  await env.DB.prepare('INSERT INTO users (id, email, name, role, google_sub, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))')
    .bind(id, profile.email, profile.name, role, profile.sub)
    .run()
  return { id, role }
}

async function readBody<T>(request: Request): Promise<T> {
  const text = await request.text()
  if (!text) return {} as T
  return JSON.parse(text) as T
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname, searchParams } = new URL(request.url)
    const corsHeaders = getCorsHeaders(request, env)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    if (pathname === '/api/health') {
      return jsonResponse(
        { ok: true, name: 'konnektx-api', time: new Date().toISOString() },
        { headers: corsHeaders }
      )
    }

    if (pathname === '/api/auth/google') {
      if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.SESSION_SECRET) {
        return jsonResponse({ error: 'OAuth nao configurado' }, { status: 500, headers: corsHeaders })
      }
      const redirect = searchParams.get('redirect') || env.APP_ORIGIN || '/'
      const state = crypto.randomUUID()
      const stateCookie = buildSetCookie('oauth_state', `${state}|${redirect}`, [
        'HttpOnly',
        'Secure',
        'SameSite=None',
        'Max-Age=600',
      ])
      const callbackUrl = new URL('/api/auth/google/callback', request.url).toString()
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID)
      authUrl.searchParams.set('redirect_uri', callbackUrl)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', 'openid email profile')
      authUrl.searchParams.set('state', state)
      authUrl.searchParams.set('access_type', 'online')
      return redirectResponse(authUrl.toString(), {
        headers: {
          'Set-Cookie': stateCookie,
        },
      })
    }

    if (pathname === '/api/auth/google/callback') {
      if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.SESSION_SECRET) {
        return jsonResponse({ error: 'OAuth nao configurado' }, { status: 500, headers: corsHeaders })
      }
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      if (!code || !state) {
        return jsonResponse({ error: 'Codigo OAuth ausente' }, { status: 400, headers: corsHeaders })
      }
      const cookies = parseCookies(request)
      const savedState = cookies.oauth_state || ''
      const [savedStateValue, redirect] = savedState.split('|')
      if (!savedStateValue || savedStateValue !== state) {
        return jsonResponse({ error: 'Estado OAuth invalido' }, { status: 400, headers: corsHeaders })
      }

      const callbackUrl = new URL('/api/auth/google/callback', request.url).toString()
      const token = await exchangeGoogleCode(code, env, callbackUrl)
      const profile = await fetchGoogleProfile(token.access_token)
      const user = await upsertUser(env, profile)

      const sessionToken = await createSessionToken(
        env.SESSION_SECRET,
        { id: user.id, email: profile.email, name: profile.name, role: user.role },
        60 * 60 * 24 * 7
      )
      const sessionCookie = buildSetCookie('konnektx_session', sessionToken, [
        'HttpOnly',
        'Secure',
        'SameSite=None',
        'Max-Age=604800',
      ])
      const clearStateCookie = buildSetCookie('oauth_state', '', ['Max-Age=0'])
      return redirectResponse(redirect || env.APP_ORIGIN || '/', {
        headers: {
          'Set-Cookie': [sessionCookie, clearStateCookie].join(', '),
        },
      })
    }

    if (pathname === '/api/auth/me') {
      const user = await getSessionUser(request, env)
      return jsonResponse({ user }, { headers: corsHeaders })
    }

    if (pathname === '/api/auth/logout') {
      const clear = buildSetCookie('konnektx_session', '', ['Max-Age=0'])
      return jsonResponse(
        { ok: true },
        {
          headers: {
            ...corsHeaders,
            'Set-Cookie': clear,
          },
        }
      )
    }

    const salonMatch = pathname.match(/^\/api\/salons\/([a-z0-9-]+)$/i)
    if (salonMatch && request.method === 'GET') {
      const slug = salonMatch[1].toLowerCase()
      const profile = await getSalonProfile(env, slug)
      if (!profile) {
        return jsonResponse({ error: 'Salao nao encontrado' }, { status: 404, headers: corsHeaders })
      }
      return jsonResponse(profile, { headers: corsHeaders })
    }

    if (salonMatch && request.method === 'PATCH') {
      const slug = salonMatch[1].toLowerCase()
      const user = await getSessionUser(request, env)
      const salon = await getSalonBySlug(env, slug)
      if (!salon) {
        return jsonResponse({ error: 'Salao nao encontrado' }, { status: 404, headers: corsHeaders })
      }
      const memberRole = user ? await getSalonMemberRole(env, salon.id, user.id) : null
      const authError = requireSalonAccess(user, memberRole?.role)
      if (authError) return jsonResponse(await authError.json(), { status: authError.status, headers: corsHeaders })
      const body = await readBody<{
        name?: string
        city?: string
        tagline?: string
        logoUrl?: string
        coverUrl?: string
        themePrimary?: string
        themeSecondary?: string
        templateKey?: string
      }>(request)
      await env.DB.prepare(
        'UPDATE salons SET name = ?, city = ?, tagline = ?, logo_url = ?, cover_url = ?, theme_primary = ?, theme_secondary = ?, template_key = ? WHERE id = ?'
      )
        .bind(
          body.name ?? salon.name,
          body.city ?? salon.city,
          body.tagline ?? salon.tagline,
          body.logoUrl ?? salon.logoUrl,
          body.coverUrl ?? salon.coverUrl,
          body.themePrimary ?? salon.themePrimary,
          body.themeSecondary ?? salon.themeSecondary,
          body.templateKey ?? salon.templateKey,
          salon.id
        )
        .run()
      return jsonResponse({ ok: true }, { headers: corsHeaders })
    }

    const serviceMatch = pathname.match(/^\/api\/salons\/([a-z0-9-]+)\/services(?:\/([a-z0-9_-]+))?$/i)
    if (serviceMatch) {
      const slug = serviceMatch[1].toLowerCase()
      const serviceId = serviceMatch[2]
      const salon = await getSalonBySlug(env, slug)
      if (!salon) return jsonResponse({ error: 'Salao nao encontrado' }, { status: 404, headers: corsHeaders })
      const user = await getSessionUser(request, env)
      const memberRole = user ? await getSalonMemberRole(env, salon.id, user.id) : null
      const authError = requireSalonAccess(user, memberRole?.role)
      if (authError) return jsonResponse(await authError.json(), { status: authError.status, headers: corsHeaders })
      if (request.method === 'GET') {
        const services = await env.DB.prepare(
          'SELECT id, name, duration_minutes as durationMinutes, price_cents as priceCents, active, sort_order as sortOrder FROM services WHERE salon_id = ? ORDER BY sort_order ASC'
        )
          .bind(salon.id)
          .all()
        return jsonResponse({ services: services.results ?? [] }, { headers: corsHeaders })
      }
      if (request.method === 'POST') {
        const body = await readBody<{ name: string; durationMinutes: number; priceCents: number }>(request)
        const id = `svc_${crypto.randomUUID()}`
        await env.DB.prepare(
          'INSERT INTO services (id, salon_id, name, duration_minutes, price_cents, active, sort_order) VALUES (?, ?, ?, ?, ?, 1, 0)'
        )
          .bind(id, salon.id, body.name, body.durationMinutes, body.priceCents)
          .run()
        return jsonResponse({ id }, { status: 201, headers: corsHeaders })
      }
      if (request.method === 'PUT' && serviceId) {
        const body = await readBody<{ name?: string; durationMinutes?: number; priceCents?: number; active?: number }>(request)
        await env.DB.prepare(
          'UPDATE services SET name = COALESCE(?, name), duration_minutes = COALESCE(?, duration_minutes), price_cents = COALESCE(?, price_cents), active = COALESCE(?, active) WHERE id = ? AND salon_id = ?'
        )
          .bind(body.name ?? null, body.durationMinutes ?? null, body.priceCents ?? null, body.active ?? null, serviceId, salon.id)
          .run()
        return jsonResponse({ ok: true }, { headers: corsHeaders })
      }
      if (request.method === 'DELETE' && serviceId) {
        await env.DB.prepare('DELETE FROM services WHERE id = ? AND salon_id = ?').bind(serviceId, salon.id).run()
        return jsonResponse({ ok: true }, { headers: corsHeaders })
      }
    }

    const staffMatch = pathname.match(/^\/api\/salons\/([a-z0-9-]+)\/staff(?:\/([a-z0-9_-]+))?$/i)
    if (staffMatch) {
      const slug = staffMatch[1].toLowerCase()
      const staffId = staffMatch[2]
      const salon = await getSalonBySlug(env, slug)
      if (!salon) return jsonResponse({ error: 'Salao nao encontrado' }, { status: 404, headers: corsHeaders })
      const user = await getSessionUser(request, env)
      const memberRole = user ? await getSalonMemberRole(env, salon.id, user.id) : null
      const authError = requireSalonAccess(user, memberRole?.role)
      if (authError) return jsonResponse(await authError.json(), { status: authError.status, headers: corsHeaders })
      if (request.method === 'GET') {
        const staff = await env.DB.prepare(
          'SELECT id, name, role, active FROM staff WHERE salon_id = ? ORDER BY name ASC'
        )
          .bind(salon.id)
          .all()
        return jsonResponse({ staff: staff.results ?? [] }, { headers: corsHeaders })
      }
      if (request.method === 'POST') {
        const body = await readBody<{ name: string; role: string }>(request)
        const id = `staff_${crypto.randomUUID()}`
        await env.DB.prepare('INSERT INTO staff (id, salon_id, name, role, active) VALUES (?, ?, ?, ?, 1)')
          .bind(id, salon.id, body.name, body.role)
          .run()
        return jsonResponse({ id }, { status: 201, headers: corsHeaders })
      }
      if (request.method === 'PUT' && staffId) {
        const body = await readBody<{ name?: string; role?: string; active?: number }>(request)
        await env.DB.prepare(
          'UPDATE staff SET name = COALESCE(?, name), role = COALESCE(?, role), active = COALESCE(?, active) WHERE id = ? AND salon_id = ?'
        )
          .bind(body.name ?? null, body.role ?? null, body.active ?? null, staffId, salon.id)
          .run()
        return jsonResponse({ ok: true }, { headers: corsHeaders })
      }
      if (request.method === 'DELETE' && staffId) {
        await env.DB.prepare('DELETE FROM staff WHERE id = ? AND salon_id = ?').bind(staffId, salon.id).run()
        return jsonResponse({ ok: true }, { headers: corsHeaders })
      }
    }

    const apptMatch = pathname.match(/^\/api\/salons\/([a-z0-9-]+)\/appointments$/i)
    if (apptMatch) {
      const slug = apptMatch[1].toLowerCase()
      const salon = await getSalonBySlug(env, slug)
      if (!salon) return jsonResponse({ error: 'Salao nao encontrado' }, { status: 404, headers: corsHeaders })
      const user = await getSessionUser(request, env)
      if (request.method === 'POST') {
        const authError = requireAuth(user)
        if (authError) return jsonResponse(await authError.json(), { status: authError.status, headers: corsHeaders })
        const body = await readBody<{ serviceId: string; staffId?: string; startsAt: string; notes?: string }>(request)
        const service = await env.DB.prepare('SELECT duration_minutes as durationMinutes FROM services WHERE id = ? AND salon_id = ?')
          .bind(body.serviceId, salon.id)
          .first<{ durationMinutes: number }>()
        if (!service) {
          return jsonResponse({ error: 'Servico nao encontrado' }, { status: 404, headers: corsHeaders })
        }
        const starts = new Date(body.startsAt)
        const ends = new Date(starts.getTime() + service.durationMinutes * 60000)
        const id = `appt_${crypto.randomUUID()}`
        await env.DB.prepare(
          'INSERT INTO appointments (id, salon_id, customer_id, staff_id, service_id, starts_at, ends_at, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))'
        )
          .bind(
            id,
            salon.id,
            user?.id,
            body.staffId ?? null,
            body.serviceId,
            starts.toISOString(),
            ends.toISOString(),
            'scheduled',
            body.notes ?? null
          )
          .run()
        return jsonResponse({ id }, { status: 201, headers: corsHeaders })
      }
      if (request.method === 'GET') {
        const memberRole = user ? await getSalonMemberRole(env, salon.id, user.id) : null
        const authError = requireSalonAccess(user, memberRole?.role)
        if (authError) return jsonResponse(await authError.json(), { status: authError.status, headers: corsHeaders })
        const appts = await env.DB.prepare(
          'SELECT a.id, a.starts_at as startsAt, a.ends_at as endsAt, a.status, s.name as serviceName, u.name as customerName FROM appointments a LEFT JOIN services s ON a.service_id = s.id LEFT JOIN users u ON a.customer_id = u.id WHERE a.salon_id = ? ORDER BY a.starts_at DESC LIMIT 200'
        )
          .bind(salon.id)
          .all()
        return jsonResponse({ appointments: appts.results ?? [] }, { headers: corsHeaders })
      }
    }

    const customerMatch = pathname.match(/^\/api\/salons\/([a-z0-9-]+)\/customers$/i)
    if (customerMatch) {
      const slug = customerMatch[1].toLowerCase()
      const salon = await getSalonBySlug(env, slug)
      if (!salon) return jsonResponse({ error: 'Salao nao encontrado' }, { status: 404, headers: corsHeaders })
      const user = await getSessionUser(request, env)
      const memberRole = user ? await getSalonMemberRole(env, salon.id, user.id) : null
      const authError = requireSalonAccess(user, memberRole?.role)
      if (authError) return jsonResponse(await authError.json(), { status: authError.status, headers: corsHeaders })
      const customers = await env.DB.prepare(
        'SELECT DISTINCT u.id, u.name, u.email FROM users u INNER JOIN appointments a ON a.customer_id = u.id WHERE a.salon_id = ? ORDER BY u.name'
      )
        .bind(salon.id)
        .all()
      return jsonResponse({ customers: customers.results ?? [] }, { headers: corsHeaders })
    }

    if (pathname === '/api/owner/salons') {
      const user = await getSessionUser(request, env)
      const authError = requireAuth(user)
      if (authError) return jsonResponse(await authError.json(), { status: authError.status, headers: corsHeaders })
      const rows = await env.DB.prepare(
        'SELECT s.id, s.slug, s.name, s.city, m.role FROM salons s INNER JOIN salon_members m ON m.salon_id = s.id WHERE m.user_id = ? AND m.active = 1 ORDER BY s.name ASC'
      )
        .bind(user?.id)
        .all<{ id: string; slug: string; name: string; city: string; role: string }>()
      return jsonResponse({ salons: rows.results ?? [] }, { headers: corsHeaders })
    }

    const memberMatch = pathname.match(/^\/api\/admin\/salons\/([a-z0-9-]+)\/members$/i)
    if (memberMatch) {
      const slug = memberMatch[1].toLowerCase()
      const user = await getSessionUser(request, env)
      const authError = requirePlatformAdmin(user)
      if (authError) return jsonResponse(await authError.json(), { status: authError.status, headers: corsHeaders })
      const salon = await getSalonBySlug(env, slug)
      if (!salon) return jsonResponse({ error: 'Salao nao encontrado' }, { status: 404, headers: corsHeaders })
      if (request.method === 'GET') {
        const members = await env.DB.prepare(
          'SELECT u.email, u.name, m.role, m.active FROM salon_members m INNER JOIN users u ON u.id = m.user_id WHERE m.salon_id = ? ORDER BY u.email'
        )
          .bind(salon.id)
          .all()
        return jsonResponse({ members: members.results ?? [] }, { headers: corsHeaders })
      }
      if (request.method === 'POST') {
        const body = await readBody<{ email: string; role?: string }>(request)
        const email = body.email?.toLowerCase().trim()
        if (!email) return jsonResponse({ error: 'Email obrigatorio' }, { status: 400, headers: corsHeaders })
        const role = body.role?.trim() || 'owner'
        let existingUser = await env.DB.prepare('SELECT id FROM users WHERE email = ? LIMIT 1')
          .bind(email)
          .first<{ id: string }>()
        if (!existingUser) {
          const id = `user_${crypto.randomUUID()}`
          const name = email.split('@')[0]
          await env.DB.prepare(
            'INSERT INTO users (id, email, name, role, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
          )
            .bind(id, email, name, 'customer')
            .run()
          existingUser = { id }
        }
        const memberId = `member_${crypto.randomUUID()}`
        await env.DB.prepare(
          'INSERT INTO salon_members (id, salon_id, user_id, role, active, created_at) VALUES (?, ?, ?, ?, 1, datetime("now")) ON CONFLICT(salon_id, user_id) DO UPDATE SET role = excluded.role, active = 1'
        )
          .bind(memberId, salon.id, existingUser.id, role)
          .run()
        return jsonResponse({ ok: true }, { headers: corsHeaders })
      }
    }

    if (pathname === '/api/admin/salons') {
      const user = await getSessionUser(request, env)
      const authError = requirePlatformAdmin(user)
      if (authError) return jsonResponse(await authError.json(), { status: authError.status, headers: corsHeaders })
      if (request.method === 'POST') {
        const body = await readBody<{ slug: string; name: string; city: string; tagline?: string }>(request)
        const slug = body.slug?.toLowerCase().trim()
        if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
          return jsonResponse({ error: 'Slug invalido' }, { status: 400, headers: corsHeaders })
        }
        if (!body.name || !body.city) {
          return jsonResponse({ error: 'Nome e cidade obrigatorios' }, { status: 400, headers: corsHeaders })
        }
        const existing = await env.DB.prepare('SELECT id FROM salons WHERE slug = ? LIMIT 1')
          .bind(slug)
          .first<{ id: string }>()
        if (existing) {
          return jsonResponse({ error: 'Slug ja existe' }, { status: 409, headers: corsHeaders })
        }
        const id = `salon_${crypto.randomUUID()}`
        await env.DB.prepare(
          'INSERT INTO salons (id, slug, name, city, tagline, created_at) VALUES (?, ?, ?, ?, ?, datetime(\"now\"))'
        )
          .bind(id, slug, body.name, body.city, body.tagline ?? null)
          .run()
        const loyaltyId = `loyalty_${crypto.randomUUID()}`
        await env.DB.prepare(
          'INSERT INTO loyalty_rules (id, salon_id, mode, points_per_service, target_points, reward_description, config_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime(\"now\"))'
        )
          .bind(loyaltyId, id, 'simple', 1, 10, 'Ganhe 1 ponto por corte. A cada 10, um servico gratis.', null)
          .run()
        return jsonResponse({ id }, { status: 201, headers: corsHeaders })
      }
      const salons = await env.DB.prepare('SELECT id, slug, name, city FROM salons ORDER BY name ASC').all()
      return jsonResponse({ salons: salons.results ?? [] }, { headers: corsHeaders })
    }

    if (pathname === '/api/admin/slug-check') {
      const user = await getSessionUser(request, env)
      const authError = requirePlatformAdmin(user)
      if (authError) return jsonResponse(await authError.json(), { status: authError.status, headers: corsHeaders })
      const slug = (searchParams.get('slug') || '').toLowerCase()
      if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        return jsonResponse({ available: false }, { headers: corsHeaders })
      }
      const existing = await env.DB.prepare('SELECT id FROM salons WHERE slug = ? LIMIT 1')
        .bind(slug)
        .first<{ id: string }>()
      return jsonResponse({ available: !existing }, { headers: corsHeaders })
    }

    if (pathname === '/api/admin/metrics') {
      const user = await getSessionUser(request, env)
      const slug = searchParams.get('salon') || ''
      const salon = await getSalonBySlug(env, slug)
      if (!salon) return jsonResponse({ error: 'Salao nao encontrado' }, { status: 404, headers: corsHeaders })
      const memberRole = user ? await getSalonMemberRole(env, salon.id, user.id) : null
      const authError = requireSalonAccess(user, memberRole?.role)
      if (authError) return jsonResponse(await authError.json(), { status: authError.status, headers: corsHeaders })
      const apptCount = await env.DB.prepare('SELECT COUNT(*) as total FROM appointments WHERE salon_id = ?')
        .bind(salon.id)
        .first<{ total: number }>()
      const customerCount = await env.DB.prepare('SELECT COUNT(DISTINCT customer_id) as total FROM appointments WHERE salon_id = ?')
        .bind(salon.id)
        .first<{ total: number }>()
      return jsonResponse(
        {
          salon: salon.slug,
          appointments: apptCount?.total ?? 0,
          customers: customerCount?.total ?? 0,
        },
        { headers: corsHeaders }
      )
    }

    return jsonResponse({ error: 'Rota nao encontrada' }, { status: 404, headers: corsHeaders })
  },
} satisfies ExportedHandler<Env>
