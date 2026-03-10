import { useEffect, useMemo, useState } from 'react'
import { API_BASE, createService, createStaff, fetchAdminSalons, fetchAppointments, fetchCustomers, fetchMe, fetchMetrics, fetchServices, fetchStaff, updateSalon } from '../lib/api'

const tabs = ['dashboard', 'servicos', 'equipe', 'agenda', 'clientes', 'aparencia', 'config'] as const

type TabKey = (typeof tabs)[number]

type AdminPageProps = {
  initialTab?: TabKey
}

const templates = [
  { key: 'aurora', name: 'Aurora', primary: '#2a6b46', secondary: '#c1993a' },
  { key: 'noir', name: 'Noir', primary: '#1f3b3f', secondary: '#8b6b2f' },
  { key: 'clean', name: 'Clean', primary: '#2d6a6a', secondary: '#c9a33a' },
]

export default function AdminPage({ initialTab }: AdminPageProps) {
  const [userName, setUserName] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab ?? 'dashboard')
  const [salons, setSalons] = useState<Array<{ id: string; slug: string; name: string; city: string }>>([])
  const [selectedSlug, setSelectedSlug] = useState<string>('aurora')
  const [services, setServices] = useState<Array<{ id: string; name: string; durationMinutes: number; priceCents: number }>>([])
  const [staff, setStaff] = useState<Array<{ id: string; name: string; role: string }>>([])
  const [appointments, setAppointments] = useState<Array<{ id: string; startsAt: string; endsAt: string; status: string; serviceName: string; customerName: string }>>([])
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [metrics, setMetrics] = useState<{ appointments: number; customers: number } | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  useEffect(() => {
    const stored = localStorage.getItem('admin_slug')
    if (stored) setSelectedSlug(stored)

    fetchMe()
      .then((data) => {
        setUserName(data.user?.name ?? null)
        setUserRole((data.user as { role?: string })?.role ?? null)
      })
      .catch(() => {
        setUserName(null)
        setUserRole(null)
      })

    fetchAdminSalons().then((data) => setSalons(data.salons)).catch(() => null)
  }, [])

  useEffect(() => {
    localStorage.setItem('admin_slug', selectedSlug)
    if (!selectedSlug) return
    fetchServices(selectedSlug).then((data) => setServices(data.services)).catch(() => null)
    fetchStaff(selectedSlug).then((data) => setStaff(data.staff)).catch(() => null)
    fetchAppointments(selectedSlug).then((data) => setAppointments(data.appointments)).catch(() => null)
    fetchCustomers(selectedSlug).then((data) => setCustomers(data.customers)).catch(() => null)
    fetchMetrics(selectedSlug).then((data) => setMetrics(data)).catch(() => null)
  }, [selectedSlug])

  const needsLogin = !userName

  const displayTabs = useMemo(() => tabs, [])

  return (
    <div className="page admin">
      <header className="admin-header">
        <div>
          <h1>Painel Konnektx</h1>
          <p>Gestao central e auditoria de saloes.</p>
        </div>
        <div className="admin-actions">
          {userName ? (
            <span>Logado como {userName}</span>
          ) : (
            <button
              className="btn primary"
              onClick={() => {
                const redirect = encodeURIComponent(window.location.href)
                window.location.href = `${API_BASE}/api/auth/google?redirect=${redirect}`
              }}
            >
              Entrar com Google
            </button>
          )}
        </div>
      </header>

      <div className="admin-toolbar">
        <label>
          Salao ativo
          <select
            value={selectedSlug}
            onChange={(event) => setSelectedSlug(event.target.value)}
            disabled={needsLogin}
          >
            {salons.map((salon) => (
              <option key={salon.id} value={salon.slug}>
                {salon.name} · {salon.city}
              </option>
            ))}
          </select>
        </label>
        <div className="admin-tabs">
          {displayTabs.map((tab) => (
            <button
              key={tab}
              className={tab === activeTab ? 'tab active' : 'tab'}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
          <a className="tab" href="/app/novo">
            novo salao
          </a>
        </div>
      </div>

      {needsLogin && <p>Entre com Google para acessar o painel.</p>}
      {!needsLogin && userRole !== 'platform_admin' && <p>Seu usuario nao tem permissao master.</p>}

      {!needsLogin && userRole === 'platform_admin' && (
        <section className="admin-panel">
          {activeTab === 'dashboard' && (
            <div className="grid">
              <div className="feature">
                <h3>Agendamentos</h3>
                <p>{metrics?.appointments ?? 0}</p>
              </div>
              <div className="feature">
                <h3>Clientes</h3>
                <p>{metrics?.customers ?? 0}</p>
              </div>
            </div>
          )}

          {activeTab === 'servicos' && (
            <div className="admin-list">
              <div className="booking-card">
                <strong>Novo servico</strong>
                <label>Nome</label>
                <input id="svc-name" />
                <label>Duracao (min)</label>
                <input id="svc-duration" type="number" />
                <label>Preco (centavos)</label>
                <input id="svc-price" type="number" />
                <button
                  className="btn primary"
                  onClick={async () => {
                    const name = (document.getElementById('svc-name') as HTMLInputElement)?.value
                    const duration = Number((document.getElementById('svc-duration') as HTMLInputElement)?.value)
                    const price = Number((document.getElementById('svc-price') as HTMLInputElement)?.value)
                    if (!name || !duration || !price) return
                    await createService(selectedSlug, { name, durationMinutes: duration, priceCents: price })
                    const data = await fetchServices(selectedSlug)
                    setServices(data.services)
                    setStatus('Servico criado')
                  }}
                >
                  Salvar
                </button>
                {status && <span>{status}</span>}
              </div>
              <div className="grid">
                {services.map((service) => (
                  <div key={service.id} className="feature">
                    <h3>{service.name}</h3>
                    <p>{service.durationMinutes} min · R$ {(service.priceCents / 100).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'equipe' && (
            <div className="admin-list">
              <div className="booking-card">
                <strong>Novo profissional</strong>
                <label>Nome</label>
                <input id="staff-name" />
                <label>Funcao</label>
                <input id="staff-role" />
                <button
                  className="btn primary"
                  onClick={async () => {
                    const name = (document.getElementById('staff-name') as HTMLInputElement)?.value
                    const role = (document.getElementById('staff-role') as HTMLInputElement)?.value
                    if (!name || !role) return
                    await createStaff(selectedSlug, { name, role })
                    const data = await fetchStaff(selectedSlug)
                    setStaff(data.staff)
                    setStatus('Profissional criado')
                  }}
                >
                  Salvar
                </button>
                {status && <span>{status}</span>}
              </div>
              <div className="grid">
                {staff.map((person) => (
                  <div key={person.id} className="feature">
                    <h3>{person.name}</h3>
                    <p>{person.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'agenda' && (
            <div className="grid">
              {appointments.map((item) => (
                <div key={item.id} className="feature">
                  <h3>{item.serviceName}</h3>
                  <p>{item.customerName}</p>
                  <p>{new Date(item.startsAt).toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'clientes' && (
            <div className="grid">
              {customers.map((customer) => (
                <div key={customer.id} className="feature">
                  <h3>{customer.name}</h3>
                  <p>{customer.email}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'aparencia' && (
            <div className="admin-list">
              <div className="booking-card">
                <strong>Aparencia do salao</strong>
                <label>Logo (URL)</label>
                <input id="logo-url" placeholder="https://..." />
                <label>Capa (URL)</label>
                <input id="cover-url" placeholder="https://..." />
                <label>Cor principal</label>
                <input id="theme-primary" placeholder="#2a6b46" />
                <label>Cor secundaria</label>
                <input id="theme-secondary" placeholder="#c1993a" />
                <label>Template</label>
                <div className="template-grid">
                  {templates.map((template) => (
                    <button
                      key={template.key}
                      className="template-card"
                      onClick={() => {
                        const input = document.getElementById('template-key') as HTMLInputElement
                        if (input) input.value = template.key
                      }}
                    >
                      <div
                        className="template-swatch"
                        style={{ background: `linear-gradient(135deg, ${template.primary}, ${template.secondary})` }}
                      />
                      <span>{template.name}</span>
                    </button>
                  ))}
                </div>
                <input id="template-key" placeholder="aurora" />
                <button
                  className="btn primary"
                  onClick={async () => {
                    const logoUrl = (document.getElementById('logo-url') as HTMLInputElement)?.value
                    const coverUrl = (document.getElementById('cover-url') as HTMLInputElement)?.value
                    const themePrimary = (document.getElementById('theme-primary') as HTMLInputElement)?.value
                    const themeSecondary = (document.getElementById('theme-secondary') as HTMLInputElement)?.value
                    const templateKey = (document.getElementById('template-key') as HTMLInputElement)?.value
                    await updateSalon(selectedSlug, {
                      logoUrl: logoUrl || null,
                      coverUrl: coverUrl || null,
                      themePrimary: themePrimary || null,
                      themeSecondary: themeSecondary || null,
                      templateKey: templateKey || null,
                    })
                    setStatus('Aparencia atualizada')
                  }}
                >
                  Salvar
                </button>
                {status && <span>{status}</span>}
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="glass-panel">
              <p>Configuacoes gerais do salao (horarios, politicas, etc.)</p>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
