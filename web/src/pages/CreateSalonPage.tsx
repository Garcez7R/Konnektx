import { useEffect, useState } from 'react'
import { API_BASE, createSalon, fetchMe } from '../lib/api'

export default function CreateSalonPage() {
  const [userName, setUserName] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

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

  return (
    <div className="page">
      <header className="admin-header">
        <div>
          <h1>Novo salao</h1>
          <p>Crie o primeiro salao e ja ajuste o layout.</p>
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

      {!userName && <p>Entre com Google para criar um salao.</p>}
      {userName && userRole !== 'platform_admin' && <p>Seu usuario nao tem permissao master.</p>}

      {userName && userRole === 'platform_admin' && (
        <div className="booking-card">
          <label>Nome do salao</label>
          <input id="salon-name" placeholder="Salao Aurora" />
          <label>Slug</label>
          <input id="salon-slug" placeholder="aurora" />
          <label>Cidade</label>
          <input id="salon-city" placeholder="Itajuba - MG" />
          <label>Tagline</label>
          <input id="salon-tagline" placeholder="Cortes modernos e experiencia premium" />
          <button
            className="btn primary"
            onClick={async () => {
              const name = (document.getElementById('salon-name') as HTMLInputElement)?.value.trim()
              const slug = (document.getElementById('salon-slug') as HTMLInputElement)?.value.trim().toLowerCase()
              const city = (document.getElementById('salon-city') as HTMLInputElement)?.value.trim()
              const tagline = (document.getElementById('salon-tagline') as HTMLInputElement)?.value.trim()
              if (!name || !slug || !city) {
                setStatus('Preencha nome, slug e cidade.')
                return
              }
              try {
                await createSalon({ slug, name, city, tagline })
                localStorage.setItem('admin_slug', slug)
                setStatus('Salao criado! Redirecionando...')
                setTimeout(() => {
                  window.location.href = '/app'
                }, 800)
              } catch (err) {
                setStatus('Falha ao criar salao.')
              }
            }}
          >
            Criar salao
          </button>
          {status && <span>{status}</span>}
        </div>
      )}
    </div>
  )
}
