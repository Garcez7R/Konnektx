import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_BASE, createAppointment, fetchMe, fetchSalon } from '../lib/api'
import type { SalonProfile } from '../lib/api'

export default function SalonBookingPage() {
  const { slug } = useParams()
  const [profile, setProfile] = useState<SalonProfile | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState('')
  const [selectedStaff, setSelectedStaff] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [notes, setNotes] = useState('')

  const safeSlug = useMemo(() => slug ?? '', [slug])

  useEffect(() => {
    if (!safeSlug) return
    fetchSalon(safeSlug)
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [safeSlug])

  useEffect(() => {
    fetchMe()
      .then((data) => setUserName(data.user?.name ?? null))
      .catch(() => setUserName(null))
  }, [])

  if (!profile) {
    return (
      <div className="page">
        <p className="loading">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="page">
      <Link className="back-link" to={`/s/${profile.slug}`}>
        Voltar
      </Link>
      <h1>Agendar em {profile.name}</h1>
      {!userName && (
        <div className="glass-panel">
          <p>Entre com Google para continuar o agendamento.</p>
          <button
            className="btn primary"
            onClick={() => {
              const redirect = encodeURIComponent(window.location.href)
              window.location.href = `${API_BASE}/api/auth/google?redirect=${redirect}`
            }}
          >
            Entrar com Google
          </button>
        </div>
      )}
      {userName && (
        <div className="booking-card">
          <label>Serviço</label>
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
            <option value="">Sem preferência</option>
            {profile.staff.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
          <label>Data e hora</label>
          <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
          <label>Observações</label>
          <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
          <button
            className="btn primary"
            onClick={async () => {
              if (!selectedService || !startsAt) {
                setStatus('Selecione o serviço e o horário.')
                return
              }
              try {
                setStatus('Agendando...')
                await createAppointment(profile.slug, {
                  serviceId: selectedService,
                  staffId: selectedStaff || undefined,
                  startsAt: new Date(startsAt).toISOString(),
                  notes: notes || undefined,
                })
                window.location.href = `/s/${profile.slug}/confirmado`
              } catch (err) {
                setStatus('Falha ao agendar.')
              }
            }}
          >
            Confirmar
          </button>
          {status && <span>{status}</span>}
        </div>
      )}
    </div>
  )
}
