import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_BASE, fetchMe } from '../lib/api'
import SalonBottomNav from '../components/SalonBottomNav'

export default function SalonProfilePage() {
  const { slug } = useParams()
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const safeSlug = useMemo(() => slug ?? '', [slug])

  useEffect(() => {
    fetchMe()
      .then((data) => {
        setUserName(data.user?.name ?? null)
        setUserEmail(data.user?.email ?? null)
      })
      .catch(() => {
        setUserName(null)
        setUserEmail(null)
      })
  }, [])

  if (!userName) {
    return (
      <div className="page salon">
        <p>Entre com Google para acessar seu perfil.</p>
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
          Ao continuar, você concorda com o tratamento de dados conforme a LGPD
          (Lei 13.709/2018) e o Marco Civil da Internet (Lei 12.965/2014).
        </p>
        <SalonBottomNav slug={safeSlug} active="perfil" />
      </div>
    )
  }

  return (
    <div className="page salon">
      <Link className="back-link" to={`/s/${safeSlug}`}>
        Voltar
      </Link>
      <h1>Seu perfil</h1>
      <div className="glass-panel">
        <p><strong>Nome:</strong> {userName}</p>
        <p><strong>E-mail:</strong> {userEmail}</p>
      </div>
      <SalonBottomNav slug={safeSlug} active="perfil" />
    </div>
  )
}
