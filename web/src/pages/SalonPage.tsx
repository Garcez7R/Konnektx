import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_BASE, fetchMe, fetchSalon, logout } from '../lib/api'
import type { SalonProfile } from '../lib/api'
import SalonBottomNav from '../components/SalonBottomNav'
import { getDemoSalon } from '../lib/demo'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export default function SalonPage() {
  const { slug } = useParams()
  const [profile, setProfile] = useState<SalonProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  const safeSlug = useMemo(() => slug ?? '', [slug])

  useEffect(() => {
    if (!safeSlug) {
      setError('Slug não informado')
      return
    }

    fetchSalon(safeSlug)
      .then(setProfile)
      .catch((err) => {
        const demo = getDemoSalon(safeSlug)
        if (demo) {
          setProfile(demo)
          setError(null)
          return
        }
        setError(err.message)
      })
  }, [safeSlug])

  useEffect(() => {
    fetchMe()
      .then((data) => setUserName(data.user?.name ?? null))
      .catch(() => setUserName(null))
  }, [])

  if (error) {
    return (
      <div className="page">
        <Link className="back-link" to="/">
          Voltar
        </Link>
        <div className="glass-panel">
          <h2>Ops, algo deu errado</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="page">
        <p className="loading">Carregando salão...</p>
      </div>
    )
  }

  const templateTheme = {
    aurora: { primary: '#2a6b46', secondary: '#c1993a' },
    noir: { primary: '#1f3b3f', secondary: '#8b6b2f' },
    clean: { primary: '#2d6a6a', secondary: '#c9a33a' },
  } as const

  const selectedTemplate = profile.templateKey ? templateTheme[profile.templateKey as keyof typeof templateTheme] : undefined

  type ThemeStyle = CSSProperties & {
    '--accent'?: string
    '--accent-strong'?: string
  }

  const themeStyle: ThemeStyle = {
    '--accent': profile.themePrimary || selectedTemplate?.primary || undefined,
    '--accent-strong': profile.themeSecondary || selectedTemplate?.secondary || undefined,
  }

  return (
    <div className="page salon" style={themeStyle}>
      {profile.slug === 'aurora' && (
        <div className="demo-banner">Modo demonstração</div>
      )}
      <Link className="back-link" to="/">
        Voltar para home
      </Link>

      <section className="salon-hero" id="inicio">
        <div className="salon-hero-text">
          <p className="eyebrow">{profile.city}</p>
          <div className="salon-title">
            {profile.logoUrl && (
              <img className="salon-logo" src={profile.logoUrl} alt={`Logo ${profile.name}`} />
            )}
            <h1>{profile.name}</h1>
          </div>
          <p className="hero-subtitle">{profile.tagline}</p>
          {userName && (
            <div className="user-badge">
              <span>Logado como {userName}</span>
              <button
                className="btn ghost"
                onClick={async () => {
                  await logout()
                  window.location.href = '/'
                }}
              >
                Sair
              </button>
            </div>
          )}
          <div className="hero-actions">
            <button
              className="btn primary"
              onClick={() => {
                const redirect = encodeURIComponent(`${window.location.origin}/s/${profile.slug}/agendar`)
                window.location.href = `${API_BASE}/api/auth/google?redirect=${redirect}`
              }}
            >
              Agendar horário
            </button>
          </div>
        </div>
        <div className="salon-hero-media">
          <img
            src={profile.coverUrl || '/cover-placeholder.svg'}
            alt={`Foto do ${profile.name}`}
          />
        </div>
      </section>

      <section className="section grid" id="serviços">
        {profile.services.map((service) => (
          <article key={service.id} className="feature">
            <h3>{service.name}</h3>
            <p>
              {service.durationMinutes} min · {currency.format(service.priceCents / 100)}
            </p>
          </article>
        ))}
      </section>

      <section className="section split" id="fidelidade">
        <div>
          <h2>Equipe</h2>
          <div className="staff-list">
            {profile.staff.map((person) => (
              <div key={person.name} className="staff-card">
                <div className="avatar" />
                <div>
                  <p className="staff-name">{person.name}</p>
                  <p className="staff-role">{person.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel">
          <h3>Fidelidade ativa</h3>
          <p>
            {profile.loyalty
              ? `${profile.loyalty.rewardDescription} (meta de ${profile.loyalty.targetPoints} pontos)`
              : 'Ganhe 1 ponto por corte. A cada 10, um serviço grátis.'}
          </p>
          <div className="pill">Clube Konnektx</div>
        </div>
      </section>
      <SalonBottomNav slug={profile.slug} />
    </div>
  )
}
