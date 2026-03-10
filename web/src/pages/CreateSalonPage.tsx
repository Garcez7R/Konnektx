import { useEffect, useMemo, useState } from 'react'
import { API_BASE, createSalon, fetchMe, validateSlug } from '../lib/api'

export default function CreateSalonPage() {
  const [userName, setUserName] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [slug, setSlug] = useState('')
  const [slugStatus, setSlugStatus] = useState<string | null>(null)

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
    if (!slug) {
      setSlugStatus(null)
      return
    }
    const timer = setTimeout(async () => {
      if (!/^[a-z0-9-]+$/.test(slug)) {
        setSlugStatus('Slug invalido (use a-z, 0-9 e -)')
        return
      }
      try {
        const data = await validateSlug(slug)
        setSlugStatus(data.available ? 'Slug disponivel' : 'Slug ja existe')
      } catch (err) {
        setSlugStatus('Erro ao validar slug')
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [slug])

  const canCreate = useMemo(() => slugStatus === 'Slug disponivel', [slugStatus])

  return (
    <div className="page">
      <header className="admin-header">
        <div>
          <h1>Novo salão</h1>
          <p>Crie o primeiro salão e já ajuste o layout.</p>
        </div>
        <div className="admin-actions">
          {userName ? (
            <span>Logado como {userName}</span>
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

      {!userName && <p>Entre com Google para criar um salão.</p>}
      {userName && userRole !== 'platform_admin' && <p>Seu usuário não tem permissão master.</p>}

      {userName && userRole === 'platform_admin' && (
        <div className="booking-card">
          <label>Nome do salão</label>
          <input id="salon-name" placeholder="Salao Aurora" />
          <label>Slug</label>
          <input
            id="salon-slug"
            placeholder="aurora"
            value={slug}
            onChange={(event) => setSlug(event.target.value.toLowerCase())}
          />
          {slugStatus && <span>{slugStatus}</span>}
          <label>Cidade</label>
          <input id="salon-city" placeholder="Itajuba - MG" />
          <label>Tagline</label>
          <input id="salon-tagline" placeholder="Cortes modernos e experiencia premium" />
          <button
            className="btn primary"
            disabled={!canCreate}
            onClick={async () => {
              const name = (document.getElementById('salon-name') as HTMLInputElement)?.value.trim()
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
                setStatus('Falha ao criar salão.')
              }
            }}
          >
            Criar salão
          </button>
          {status && <span>{status}</span>}
        </div>
      )}
    </div>
  )
}
