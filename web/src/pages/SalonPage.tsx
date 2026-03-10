import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchSalon } from '../lib/api'
import type { SalonProfile } from '../lib/api'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export default function SalonPage() {
  const { slug } = useParams()
  const [profile, setProfile] = useState<SalonProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const safeSlug = useMemo(() => slug ?? '', [slug])

  useEffect(() => {
    if (!safeSlug) {
      setError('Slug nao informado')
      return
    }

    fetchSalon(safeSlug)
      .then(setProfile)
      .catch((err) => setError(err.message))
  }, [safeSlug])

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
        <p className="loading">Carregando salao...</p>
      </div>
    )
  }

  return (
    <div className="page salon">
      <Link className="back-link" to="/">
        Voltar para home
      </Link>

      <section className="salon-hero">
        <div className="salon-hero-text">
          <p className="eyebrow">{profile.city}</p>
          <h1>{profile.name}</h1>
          <p className="hero-subtitle">{profile.tagline}</p>
          <div className="hero-actions">
            <button className="btn primary">Agendar horario</button>
            <button className="btn ghost">Entrar no clube</button>
          </div>
        </div>
        <div className="salon-hero-media">
          <img
            src={profile.coverUrl || '/cover-placeholder.svg'}
            alt={`Foto do ${profile.name}`}
          />
        </div>
      </section>

      <section className="section grid">
        {profile.services.map((service) => (
          <article key={service.name} className="feature">
            <h3>{service.name}</h3>
            <p>
              {service.durationMinutes} min · {currency.format(service.priceCents / 100)}
            </p>
          </article>
        ))}
      </section>

      <section className="section split">
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
              : 'Ganhe 1 ponto por corte. A cada 10, um servico gratis.'}
          </p>
          <div className="pill">Clube Konnektx</div>
        </div>
      </section>
    </div>
  )
}
