import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_BASE, fetchMe } from '../lib/api'

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
      <div className="page">
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
      </div>
    )
  }

  return (
    <div className="page">
      <Link className="back-link" to={`/s/${safeSlug}`}>
        Voltar
      </Link>
      <h1>Seu perfil</h1>
      <div className="glass-panel">
        <p><strong>Nome:</strong> {userName}</p>
        <p><strong>Email:</strong> {userEmail}</p>
      </div>
    </div>
  )
}
