import { CSSProperties, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_BASE, createAppointment, fetchMe, fetchSalon, logout } from '../lib/api'
import type { SalonProfile } from '../lib/api'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export default function SalonPage() {
  const { slug } = useParams()
  const [profile, setProfile] = useState<SalonProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [bookingStatus, setBookingStatus] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [startsAt, setStartsAt] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

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
        <p className="loading">Carregando salao...</p>
      </div>
    )
  }

  const themeStyle: CSSProperties = {
    '--accent': profile.themePrimary || undefined,
    '--accent-strong': profile.themeSecondary || undefined,
  }

  return (
    <div className="page salon" style={themeStyle}>
      <Link className="back-link" to="/">
        Voltar para home
      </Link>

      <section className="salon-hero">
        <div className="salon-hero-text">
          <p className="eyebrow">{profile.city}</p>
          <h1>{profile.name}</h1>
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
                const redirect = encodeURIComponent(window.location.href)
                window.location.href = `${API_BASE}/api/auth/google?redirect=${redirect}`
              }}
            >
              Agendar horario
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                window.open('https://wa.me/551996263385', '_blank', 'noopener,noreferrer')
              }}
            >
              Falar com a equipe
            </button>
          </div>
          {userName ? (
            <div className="booking-card">
              <strong>Agendar agora</strong>
              <label>Servico</label>
              <select value={selectedService} onChange={(event) => setSelectedService(event.target.value)}>
                <option value="">Selecione</option>
                {profile.services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <label>Profissional (opcional)</label>
              <select value={selectedStaff} onChange={(event) => setSelectedStaff(event.target.value)}>
                <option value="">Sem preferencia</option>
                {profile.staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
              <label>Data e hora</label>
              <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
              <label>Observacoes</label>
              <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
              <button
                className="btn primary"
                onClick={async () => {
                  if (!selectedService || !startsAt) {
                    setBookingStatus('Selecione o servico e horario.')
                    return
                  }
                  try {
                    setBookingStatus('Agendando...')
                    await createAppointment(profile.slug, {
                      serviceId: selectedService,
                      staffId: selectedStaff || undefined,
                      startsAt: new Date(startsAt).toISOString(),
                      notes: notes || undefined,
                    })
                    setBookingStatus('Agendamento criado!')
                  } catch (err) {
                    setBookingStatus('Falha ao agendar.')
                  }
                }}
              >
                Confirmar
              </button>
              {bookingStatus && <span>{bookingStatus}</span>}
            </div>
          ) : (
            <p className="hero-subtitle">Entre com Google para agendar.</p>
          )}
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
          <article key={service.id} className="feature">
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
