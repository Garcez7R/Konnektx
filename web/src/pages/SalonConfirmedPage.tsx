import { Link, useParams } from 'react-router-dom'
import SalonBottomNav from '../components/SalonBottomNav'

export default function SalonConfirmedPage() {
  const { slug } = useParams()
  return (
    <div className="page salon">
      <h1>Agendamento confirmado!</h1>
      <p>Você receberá uma mensagem com os detalhes. Até breve.</p>
      <Link className="btn primary" to={`/s/${slug ?? ''}`}>
        Voltar para o salão
      </Link>
      <SalonBottomNav slug={slug ?? ''} active="agenda" />
    </div>
  )
}
