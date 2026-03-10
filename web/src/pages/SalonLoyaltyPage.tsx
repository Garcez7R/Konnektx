import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchSalon } from '../lib/api'
import type { SalonProfile } from '../lib/api'
import SalonBottomNav from '../components/SalonBottomNav'
import { getDemoSalon } from '../lib/demo'

export default function SalonLoyaltyPage() {
  const { slug } = useParams()
  const [profile, setProfile] = useState<SalonProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const safeSlug = useMemo(() => slug ?? '', [slug])

  useEffect(() => {
    if (!safeSlug) return
    fetchSalon(safeSlug)
      .then(setProfile)
      .catch((err) => {
        const demo = getDemoSalon(safeSlug)
        if (demo) {
          setProfile(demo)
          return
        }
        setError(err.message)
      })
  }, [safeSlug])

  if (error) {
    return (
      <div className="page salon">
        <Link className="back-link" to={`/s/${safeSlug}`}>
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
      <div className="page salon">
        <p className="loading">Carregando...</p>
      </div>
    )
  }

  const loyalty = profile.loyalty
  const reward = loyalty?.rewardDescription || 'Ganhe 1 ponto por corte. A cada 10, um serviço grátis.'
  const target = loyalty?.targetPoints ?? 10
  const points = loyalty?.pointsPerService ?? 1

  return (
    <div className="page salon">
      <Link className="back-link" to={`/s/${profile.slug}`}>
        Voltar
      </Link>
      <h1>Fidelidade</h1>
      <div className="glass-panel">
        <h3>Clube {profile.name}</h3>
        <p>{reward}</p>
        <div className="pill">Meta: {target} pontos</div>
        <div className="pill">+{points} ponto(s) por serviço</div>
      </div>
      <div className="section">
        <h2>Como funciona</h2>
        <div className="grid">
          <article className="feature">
            <h3>Acumule pontos</h3>
            <p>Ao realizar serviços, seus pontos são somados automaticamente no seu perfil.</p>
          </article>
          <article className="feature">
            <h3>Troque por prêmios</h3>
            <p>Quando alcançar a meta, você ganha o benefício definido pelo salão.</p>
          </article>
          <article className="feature">
            <h3>Volte sempre</h3>
            <p>O sistema lembra sua fidelidade e facilita para você agendar novamente.</p>
          </article>
        </div>
      </div>
      <SalonBottomNav slug={profile.slug} active="fidelidade" />
    </div>
  )
}
