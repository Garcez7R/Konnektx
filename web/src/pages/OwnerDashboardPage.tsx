import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  API_BASE,
  createService,
  createStaff,
  fetchMe,
  fetchMetrics,
  fetchOwnerSalons,
  fetchSalon,
  fetchServices,
  fetchStaff,
  logout,
  updateSalon,
} from '../lib/api'
import type { SalonProfile } from '../lib/api'

export default function OwnerDashboardPage() {
  const [userName, setUserName] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [slugInput, setSlugInput] = useState('')
  const [activeSlug, setActiveSlug] = useState('')
  const [ownerSalons, setOwnerSalons] = useState<Array<{ id: string; slug: string; name: string; city: string; role: string }>>([])
  const [profile, setProfile] = useState<SalonProfile | null>(null)
  const [services, setServices] = useState<Array<{ id: string; name: string; durationMinutes: number; priceCents: number }>>([])
  const [staff, setStaff] = useState<Array<{ id: string; name: string; role: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<{ appointments: number; customers: number } | null>(null)

  const [logoUrl, setLogoUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [themePrimary, setThemePrimary] = useState('')
  const [themeSecondary, setThemeSecondary] = useState('')
  const [templateKey, setTemplateKey] = useState('')

  const [serviceName, setServiceName] = useState('')
  const [serviceDuration, setServiceDuration] = useState('')
  const [servicePrice, setServicePrice] = useState('')
  const [staffName, setStaffName] = useState('')
  const [staffRole, setStaffRole] = useState('')

  const templates = [
    { key: 'aurora', name: 'Aurora', primary: '#2a6b46', secondary: '#c1993a' },
    { key: 'noir', name: 'Noir', primary: '#1f3b3f', secondary: '#8b6b2f' },
    { key: 'clean', name: 'Clean', primary: '#2d6a6a', secondary: '#c9a33a' },
  ]

  useEffect(() => {
    const stored = localStorage.getItem('owner_slug') || 'aurora'
    setSlugInput(stored)
    setActiveSlug(stored)
  }, [])

  useEffect(() => {
    fetchMe()
      .then((data) => {
        setUserName(data.user?.name ?? null)
        setUserRole((data.user as { role?: string })?.role ?? null)
      })
      .catch(() => {
        setUserName(null)
        setUserRole(null)
      })
  }, [])

  useEffect(() => {
    if (!userName) return
    fetchOwnerSalons()
      .then((data) => {
        setOwnerSalons(data.salons)
        if (data.salons.length && !activeSlug) {
          setActiveSlug(data.salons[0].slug)
          setSlugInput(data.salons[0].slug)
        }
      })
      .catch(() => setOwnerSalons([]))
  }, [userName, activeSlug])

  useEffect(() => {
    if (!activeSlug) return
    setError(null)
    fetchSalon(activeSlug)
      .then((data) => {
        setProfile(data)
        setLogoUrl(data.logoUrl ?? '')
        setCoverUrl(data.coverUrl ?? '')
        setThemePrimary(data.themePrimary ?? '')
        setThemeSecondary(data.themeSecondary ?? '')
        setTemplateKey(data.templateKey ?? '')
      })
      .catch((err) => setError(err.message || 'Falha ao carregar o salão.'))
    fetchServices(activeSlug)
      .then((data) => setServices(data.services))
      .catch(() => setServices([]))
    fetchStaff(activeSlug)
      .then((data) => setStaff(data.staff))
      .catch(() => setStaff([]))
    fetchMetrics(activeSlug)
      .then((data) => setMetrics(data))
      .catch(() => setMetrics(null))
  }, [activeSlug])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(timer)
  }, [toast])

  const formattedSlug = useMemo(() => activeSlug.trim(), [activeSlug])

  const needsLogin = !userName

  return (
    <div className="page admin">
      <Link className="back-link" to="/">
        Voltar para a home
      </Link>
      {toast && <div className="toast">{toast}</div>}
      <header className="admin-header">
        <div>
          <h1>Painel do salão</h1>
          <p>Gestão simples para acompanhar seu negócio.</p>
        </div>
        <div className="admin-actions">
          {userName ? (
            <div className="admin-user">
              <span>Logado como {userName}</span>
              <button
                className="btn ghost"
                onClick={async () => {
                  await logout()
                  window.location.href = '/app'
                }}
              >
                Sair
              </button>
            </div>
          ) : (
            <div>
              <button
                className="btn primary"
                onClick={() => {
                  const redirect = encodeURIComponent(window.location.href)
                  window.location.href = `${API_BASE}/api/auth/google?redirect=${redirect}`
                }}
              >
                Entrar com Google
              </button>
              <p className="legal-note">
                Ao continuar, você concorda com o tratamento de dados conforme a
                LGPD (Lei 13.709/2018) e o Marco Civil da Internet (Lei 12.965/2014).
              </p>
            </div>
          )}
        </div>
      </header>

      {userRole === 'platform_admin' && (
        <div className="admin-toolbar">
          <Link className="btn ghost" to="/app/master">
            Acessar Admin Master
          </Link>
        </div>
      )}

      <div className="admin-toolbar">
        {ownerSalons.length > 0 ? (
          <label>
            Seu salão
            <select
              value={activeSlug}
              onChange={(event) => {
                const next = event.target.value
                setActiveSlug(next)
                setSlugInput(next)
                localStorage.setItem('owner_slug', next)
              }}
              disabled={needsLogin}
            >
              {ownerSalons.map((salon) => (
                <option key={salon.id} value={salon.slug}>
                  {salon.name} · {salon.city}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label>
            Seu slug
            <div className="field-row">
              <input
                value={slugInput}
                onChange={(event) => setSlugInput(event.target.value)}
                placeholder="ex: salao-aurora"
                disabled={needsLogin}
              />
              <button
                className="btn ghost"
                disabled={!slugInput || needsLogin}
                onClick={() => {
                  const next = slugInput.trim().toLowerCase()
                  setActiveSlug(next)
                  localStorage.setItem('owner_slug', next)
                }}
              >
                Carregar
              </button>
            </div>
          </label>
        )}
        {formattedSlug && (
          <a className="pill" href={`/s/${formattedSlug}`} target="_blank" rel="noreferrer">
            Abrir página pública
          </a>
        )}
      </div>

      {needsLogin && <p>Entre com Google para acessar seu painel.</p>}
      {error && (
        <div className="glass-panel">
          <h3>Ops, algo deu errado</h3>
          <p>{error}</p>
        </div>
      )}

      {!needsLogin && profile && (
        <section className="admin-panel">
          <div className="grid">
            <div className="feature">
              <h3>{profile.name}</h3>
              <p>{profile.city}</p>
              <p>{profile.tagline || 'Sua marca em destaque'}</p>
            </div>
            <div className="feature">
              <h3>Programa de fidelidade</h3>
              <p>{profile.loyalty?.rewardDescription || 'Ganhe 1 ponto por corte.'}</p>
            </div>
            <div className="feature">
              <h3>Agendamentos</h3>
              <p>{metrics?.appointments ?? 0}</p>
            </div>
            <div className="feature">
              <h3>Clientes</h3>
              <p>{metrics?.customers ?? 0}</p>
            </div>
          </div>

          <div className="section grid">
            <div className="section-title">
              <h2>Serviços ativos</h2>
              <p>Adicione e organize seus serviços principais.</p>
            </div>
            <div className="booking-card">
              <strong>Novo serviço</strong>
              <label>Nome</label>
              <input value={serviceName} onChange={(event) => setServiceName(event.target.value)} />
              <label>Duração (min)</label>
              <input
                type="number"
                value={serviceDuration}
                onChange={(event) => setServiceDuration(event.target.value)}
              />
              <label>Preço (centavos)</label>
              <input
                type="text"
                inputMode="numeric"
                value={servicePrice}
                onChange={(event) => {
                  const onlyDigits = event.target.value.replace(/\D/g, '')
                  if (onlyDigits.length > 6) return
                  const padded = onlyDigits.padStart(3, '0')
                  const cents = padded.slice(-2)
                  const reais = padded.slice(0, -2)
                  const formatted = Number(reais || '0').toLocaleString('pt-BR')
                  setServicePrice(`${formatted},${cents}`)
                }}
              />
              <button
                className="btn primary"
                onClick={async () => {
                  if (!serviceName || !serviceDuration || !servicePrice) return
                  setStatus('Salvando serviço...')
                  await createService(profile.slug, {
                    name: serviceName,
                    durationMinutes: Number(serviceDuration),
                    priceCents: Number(servicePrice.replace(/\D/g, '')),
                  })
                  const data = await fetchServices(profile.slug)
                  setServices(data.services)
                  setServiceName('')
                  setServiceDuration('')
                  setServicePrice('')
                  setToast('Serviço criado com sucesso')
                  setStatus(null)
                }}
              >
                Salvar
              </button>
              {status && <span>{status}</span>}
            </div>
            {services.map((service) => (
              <article key={service.id} className="feature">
                <h3>{service.name}</h3>
                <p>
                  {service.durationMinutes} min · R$ {(service.priceCents / 100).toFixed(2)}
                </p>
              </article>
            ))}
          </div>

          <div className="section grid">
            <div className="section-title">
              <h2>Equipe</h2>
              <p>Cadastre profissionais e deixe o salão organizado.</p>
            </div>
            <div className="booking-card">
              <strong>Novo profissional</strong>
              <label>Nome</label>
              <input value={staffName} onChange={(event) => setStaffName(event.target.value)} />
              <label>Função</label>
              <input value={staffRole} onChange={(event) => setStaffRole(event.target.value)} />
              <button
                className="btn primary"
                onClick={async () => {
                  if (!staffName || !staffRole) return
                  setStatus('Salvando profissional...')
                  await createStaff(profile.slug, { name: staffName, role: staffRole })
                  const data = await fetchStaff(profile.slug)
                  setStaff(data.staff)
                  setStaffName('')
                  setStaffRole('')
                  setToast('Equipe atualizada')
                  setStatus(null)
                }}
              >
                Salvar
              </button>
              {status && <span>{status}</span>}
            </div>
            {staff.map((person) => (
              <article key={person.id} className="feature">
                <h3>{person.name}</h3>
                <p>{person.role}</p>
              </article>
            ))}
          </div>

          <div className="section split">
            <div>
              <h2>Aparência</h2>
              <p>Atualize logo, capa, cores e template do seu salão.</p>
              <div className="pill">Template {templateKey || 'padrão'}</div>
            </div>
            <div className="glass-panel preview-surface">
              <label>Logo (URL)</label>
              <input value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} />
              <label>Capa (URL)</label>
              <input value={coverUrl} onChange={(event) => setCoverUrl(event.target.value)} />
              <div className="color-inputs">
                <label>
                  Primária
                  <input type="color" value={themePrimary || '#002d20'} onChange={(event) => setThemePrimary(event.target.value)} />
                </label>
                <label>
                  Secundária
                  <input type="color" value={themeSecondary || '#c5a059'} onChange={(event) => setThemeSecondary(event.target.value)} />
                </label>
              </div>
              <label>Template</label>
              <select value={templateKey} onChange={(event) => setTemplateKey(event.target.value)}>
                <option value="">Selecione</option>
                {templates.map((template) => (
                  <option key={template.key} value={template.key}>
                    {template.name}
                  </option>
                ))}
              </select>
              <button
                className="btn primary"
                onClick={async () => {
                  setStatus('Salvando aparência...')
                  await updateSalon(profile.slug, {
                    logoUrl: logoUrl || null,
                    coverUrl: coverUrl || null,
                    themePrimary: themePrimary || null,
                    themeSecondary: themeSecondary || null,
                    templateKey: templateKey || null,
                  })
                  setToast('Aparência atualizada')
                  setStatus(null)
                }}
              >
                Salvar aparência
              </button>
              <div className="preview-grid">
                <div className="preview-card">
                  <span className="pill">Logo</span>
                  <img src={logoUrl || '/pwa-192.png'} alt="Logo do salão" />
                </div>
                <div className="preview-card">
                  <span className="pill">Capa</span>
                  <img src={coverUrl || '/cover-placeholder.svg'} alt="Capa do salão" />
                </div>
              </div>
            </div>
          </div>

          <div className="contact-section">
            <div className="glass-panel">
              <h3>Precisa ajustar algo?</h3>
              <p>Fale com o time Konnektx para atualizar seu painel e vitrine.</p>
              <button
                className="btn primary btn-icon"
                onClick={() => {
                  window.open('https://wa.me/5551996263385', '_blank', 'noopener,noreferrer')
                }}
              >
                <span className="icon">
                  <svg viewBox="0 0 32 32" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M19.1 17.4c-.2-.1-1.2-.6-1.4-.7-.2-.1-.4-.1-.6.1-.2.2-.7.7-.8.9-.1.1-.3.2-.5.1-1.2-.6-2.1-1-3-2.2-.2-.3.2-.3.6-.9.1-.2.1-.3 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.8-.9 2 0 1.2.9 2.3 1 2.5.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.2-.5 1.4-1 .2-.5.2-.9.1-1-.1-.1-.2-.1-.4-.2ZM16 5.5c-5.8 0-10.5 4.7-10.5 10.5 0 2 .6 4 1.7 5.6L6 26.5l5.1-1.4c1.6.9 3.4 1.4 5.3 1.4 5.8 0 10.5-4.7 10.5-10.5S21.8 5.5 16 5.5Zm0 19.1c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-3 .8.8-2.9-.2-.4a9 9 0 1 1 7.9 4.1Z"
                    />
                  </svg>
                </span>
                Falar com a equipe
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
