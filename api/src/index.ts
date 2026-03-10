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
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
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

async function upsertUser(env: Env, profile: { sub: string; email: string; name: string }) {
  const existing = await env.DB.prepare('SELECT id, role FROM users WHERE email = ? LIMIT 1')
    .bind(profile.email)
    .first<{ id: string; role: string }>()
  if (existing) {
    await env.DB.prepare('UPDATE users SET name = ?, google_sub = ? WHERE id = ?')
      .bind(profile.name, profile.sub, existing.id)
      .run()
    return { id: existing.id, role: existing.role }
  }

  const id = `user_${crypto.randomUUID()}`
  const role = 'customer'
  await env.DB.prepare('INSERT INTO users (id, email, name, role, google_sub, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))')
    .bind(id, profile.email, profile.name, role, profile.sub)
    .run()
  return { id, role }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url)
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

    const salonMatch = pathname.match(/^\/api\/salons\/([a-z0-9-]+)$/i)
    if (salonMatch) {
      const slug = salonMatch[1].toLowerCase()
      const profile = await getSalonProfile(env, slug)
      if (!profile) {
        return jsonResponse({ error: 'Salao nao encontrado' }, { status: 404, headers: corsHeaders })
      }
      return jsonResponse(profile, { headers: corsHeaders })
    }

    if (pathname === '/api/auth/google') {
      if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.SESSION_SECRET) {
        return jsonResponse(
          { error: 'OAuth nao configurado' },
          { status: 500, headers: corsHeaders }
        )
      }
      const url = new URL(request.url)
      const redirect = url.searchParams.get('redirect') || env.APP_ORIGIN || '/'
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
        return jsonResponse(
          { error: 'OAuth nao configurado' },
          { status: 500, headers: corsHeaders }
        )
      }
      const url = new URL(request.url)
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')
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
      const cookies = parseCookies(request)
      const token = cookies.konnektx_session
      if (!token || !env.SESSION_SECRET) {
        return jsonResponse({ user: null }, { headers: corsHeaders })
      }
      const user = await verifySessionToken(env.SESSION_SECRET, token)
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

    return jsonResponse({ error: 'Rota nao encontrada' }, { status: 404, headers: corsHeaders })
  },
} satisfies ExportedHandler<Env>
