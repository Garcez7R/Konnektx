import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE, addSalonMember, createService, createStaff, fetchAdminSalons, fetchAppointments, fetchCustomers, fetchMe, fetchMetrics, fetchSalon, fetchSalonMembers, fetchServices, fetchStaff, logout, updateSalon, updateSalonMember } from '../lib/api'

const tabs = ['dashboard', 'servicos', 'equipe', 'agenda', 'clientes', 'aparencia', 'config'] as const

type TabKey = (typeof tabs)[number]

const tabLabels: Record<TabKey, string> = {
  dashboard: 'dashboard',
  servicos: 'serviços',
  equipe: 'equipe',
  agenda: 'agenda',
  clientes: 'clientes',
  aparencia: 'aparência',
  config: 'config',
}

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
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab ?? 'dashboard')
  const [salons, setSalons] = useState<Array<{ id: string; slug: string; name: string; city: string }>>([])
  const [selectedSlug, setSelectedSlug] = useState<string>('aurora')
  const [services, setServices] = useState<Array<{ id: string; name: string; durationMinutes: number; priceCents: number }>>([])
  const [staff, setStaff] = useState<Array<{ id: string; name: string; role: string }>>([])
  const [appointments, setAppointments] = useState<Array<{ id: string; startsAt: string; endsAt: string; status: string; serviceName: string; customerName: string }>>([])
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [metrics, setMetrics] = useState<{ appointments: number; customers: number } | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [logoUrl, setLogoUrl] = useState<string>('')
  const [coverUrl, setCoverUrl] = useState<string>('')
  const [themePrimary, setThemePrimary] = useState<string>('')
  const [themeSecondary, setThemeSecondary] = useState<string>('')
  const [templateKey, setTemplateKey] = useState<string>('')
  const [memberEmail, setMemberEmail] = useState<string>('')
  const [memberRole, setMemberRole] = useState<string>('owner')
  const [members, setMembers] = useState<Array<{ email: string; name: string; role: string; active: number }>>([])

  const [initialAppearance, setInitialAppearance] = useState({
    logoUrl: '',
    coverUrl: '',
    themePrimary: '',
    themeSecondary: '',
  })

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
        setUserEmail(data.user?.email ?? null)
      })
      .catch(() => {
        setUserName(null)
        setUserRole(null)
        setUserEmail(null)
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
    fetchSalonMembers(selectedSlug).then((data) => setMembers(data.members)).catch(() => null)
    fetchSalon(selectedSlug)
      .then((data) => {
        const logo = data.logoUrl ?? ''
        const cover = data.coverUrl ?? ''
        const primary = data.themePrimary ?? ''
        const secondary = data.themeSecondary ?? ''
        setLogoUrl(logo)
        setCoverUrl(cover)
        setThemePrimary(primary)
        setThemeSecondary(secondary)
        setTemplateKey(data.templateKey ?? '')
        setInitialAppearance({ logoUrl: logo, coverUrl: cover, themePrimary: primary, themeSecondary: secondary })
      })
      .catch(() => null)
  }, [selectedSlug])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(timer)
  }, [toast])

  const needsLogin = !userName

  const displayTabs = useMemo(() => tabs, [])

  const checklist = [
    { label: 'Logo', done: Boolean(logoUrl) },
    { label: 'Capa', done: Boolean(coverUrl) },
    { label: 'Cores', done: Boolean(themePrimary && themeSecondary) },
    { label: 'Servicos', done: services.length > 0 },
  ]

  return (
    <div className="page admin">
      <Link className="back-link" to="/app">
        Voltar ao painel do salão
      </Link>
      {toast && <div className="toast">{toast}</div>}
      <header className="admin-header">
        <div>
          <h1>Painel Konnektx</h1>
          <p>Gestão central e auditoria de salões.</p>
        </div>
        <div className="admin-actions">
          {userName ? (
            <div className="admin-user">
              <div>
                <span>Logado como {userName}</span>
                {userEmail && (
                  <p className="muted">
                    {userEmail}{userRole ? ` · ${userRole}` : ''}
                  </p>
                )}
              </div>
              <button
                className="btn ghost"
                onClick={async () => {
                  const ok = window.confirm('Deseja sair do painel master?')
                  if (!ok) return
                  await logout()
                  window.location.href = '/app/master'
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
              {tabLabels[tab]}
            </button>
          ))}
          <a className="tab" href="/app/novo">
            novo salão
          </a>
        </div>
      </div>

      {needsLogin && <p>Entre com Google para acessar o painel.</p>}
      {!needsLogin && userRole !== 'platform_admin' && <p>Seu usuário não tem permissão master.</p>}

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
                <strong>Novo serviço</strong>
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
                    setToast('Servico criado com sucesso')
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
                    setToast('Equipe atualizada')
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
              <div className="progress-card">
                <h3>Seu salão está ficando pronto</h3>
                <ul className="checklist">
                  {checklist.map((item) => (
                    <li key={item.label} className={item.done ? 'done' : ''}>
                      <span>{item.done ? '✓' : '•'}</span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="booking-card">
                <strong>Aparência do salão</strong>
                <label>Logo (URL)</label>
                <input value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} />
                <label>Capa (URL)</label>
                <input value={coverUrl} onChange={(event) => setCoverUrl(event.target.value)} />
                <div className="preview-grid">
                  <div className="preview-card">
                    <span>Antes</span>
                    <div className="preview-surface">
                      {initialAppearance.logoUrl && <img src={initialAppearance.logoUrl} alt="Logo" />}
                      {initialAppearance.coverUrl && <img src={initialAppearance.coverUrl} alt="Capa" />}
                    </div>
                  </div>
                  <div className="preview-card">
                    <span>Depois</span>
                    <div className="preview-surface">
                      {logoUrl && <img src={logoUrl} alt="Preview logo" />}
                      {coverUrl && <img src={coverUrl} alt="Preview capa" />}
                    </div>
                  </div>
                </div>
                <label>Cor principal</label>
                <input value={themePrimary} onChange={(event) => setThemePrimary(event.target.value)} placeholder="#2a6b46" />
                <label>Cor secundaria</label>
                <input value={themeSecondary} onChange={(event) => setThemeSecondary(event.target.value)} placeholder="#c1993a" />
                <label>Template</label>
                <div className="template-grid">
                  {templates.map((template) => (
                    <button
                      key={template.key}
                      className="template-card"
                      onClick={() => {
                        setTemplateKey(template.key)
                        setThemePrimary(template.primary)
                        setThemeSecondary(template.secondary)
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
                <input value={templateKey} onChange={(event) => setTemplateKey(event.target.value)} placeholder="aurora" />
                <button
                  className="btn primary"
                  onClick={async () => {
                    await updateSalon(selectedSlug, {
                      logoUrl: logoUrl || null,
                      coverUrl: coverUrl || null,
                      themePrimary: themePrimary || null,
                      themeSecondary: themeSecondary || null,
                      templateKey: templateKey || null,
                    })
                    setToast('Seu salão ganhou vida')
                    setStatus('Aparência atualizada')
                    setInitialAppearance({
                      logoUrl,
                      coverUrl,
                      themePrimary,
                      themeSecondary,
                    })
                  }}
                >
                  Salvar
                </button>
                {status && <span>{status}</span>}
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="admin-list">
              <div className="glass-panel">
                <p>Configurações gerais do salão (horários, políticas, etc.)</p>
                <a className="btn primary" href={`/s/${selectedSlug}`} target="_blank" rel="noreferrer">
                  Abrir página do salão
                </a>
                <a className="btn ghost" href="/app/gestor">
                  Área do gestor
                </a>
              </div>
              <div className="booking-card">
                <strong>Acessos do salão</strong>
                <label>E-mail do dono</label>
                <input
                  value={memberEmail}
                  onChange={(event) => setMemberEmail(event.target.value)}
                  placeholder="dono@salao.com"
                />
                <label>Perfil</label>
                <select value={memberRole} onChange={(event) => setMemberRole(event.target.value)}>
                  <option value="owner">Dono</option>
                  <option value="manager">Gerente</option>
                  <option value="staff">Equipe</option>
                </select>
                <button
                  className="btn primary"
                  onClick={async () => {
                    if (!memberEmail) return
                    await addSalonMember(selectedSlug, { email: memberEmail, role: memberRole })
                    setToast('Acesso concedido ao salão')
                    setMemberEmail('')
                    fetchSalonMembers(selectedSlug).then((data) => setMembers(data.members)).catch(() => null)
                  }}
                >
                  Conceder acesso
                </button>
                {members.length > 0 && (
                  <div className="member-list">
                    {members.map((member) => (
                      <div key={member.email} className="member-row">
                        <div>
                          <strong>{member.name || member.email}</strong>
                          <p>{member.email}</p>
                        </div>
                        <span className="pill">{member.role}</span>
                        <span className={`pill ${member.active ? 'active' : ''}`}>
                          {member.active ? 'Ativo' : 'Pausado'}
                        </span>
                        <button
                          className="btn ghost"
                          onClick={async () => {
                            await updateSalonMember(selectedSlug, { email: member.email, active: member.active ? 0 : 1 })
                            fetchSalonMembers(selectedSlug).then((data) => setMembers(data.members)).catch(() => null)
                          }}
                        >
                          {member.active ? 'Pausar' : 'Reativar'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
