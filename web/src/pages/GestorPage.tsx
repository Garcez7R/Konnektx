import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE, fetchMe, logout } from '../lib/api'

export default function GestorPage() {
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

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
        <Link className="back-link" to="/app">
          Voltar ao painel
        </Link>
        <h1>Área do gestor</h1>
        <p>Entre com Google para acessar sua área de gestão.</p>
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
      </div>
    )
  }

  return (
    <div className="page">
      <Link className="back-link" to="/app">
        Voltar ao painel
      </Link>
      <h1>Área do gestor</h1>
      <div className="admin-actions">
        <span>Logado como {userName}</span>
        <button
          className="btn ghost"
          onClick={async () => {
            await logout()
            window.location.href = '/app'
          }}
        >
          Sair
        </button>
      </div>
      <div className="grid">
        <div className="feature">
          <h3>Seus dados</h3>
          <p><strong>Nome:</strong> {userName}</p>
          <p><strong>E-mail:</strong> {userEmail}</p>
        </div>
        <div className="feature">
          <h3>Seu plano</h3>
          <p>Plano atual: Ouro (exemplo)</p>
          <p>Próxima cobrança: 10/04/2026</p>
        </div>
        <div className="feature">
          <h3>Preferências</h3>
          <p>Notificações, idioma e horários serão configuráveis aqui.</p>
        </div>
        <div className="feature">
          <h3>Suporte</h3>
          <p>Precisa de ajuda? Fale com nossa equipe.</p>
          <button
            className="btn ghost"
            onClick={() => {
              window.open('https://wa.me/5551996263385', '_blank', 'noopener,noreferrer')
            }}
          >
            Falar com suporte
          </button>
        </div>
      </div>
    </div>
  )
}
