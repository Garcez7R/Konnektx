import { Link, useParams } from 'react-router-dom'

export default function SalonConfirmedPage() {
  const { slug } = useParams()
  return (
    <div className="page">
      <h1>Agendamento confirmado!</h1>
      <p>Você receberá uma mensagem com os detalhes. Até breve.</p>
      <Link className="btn primary" to={`/s/${slug ?? ''}`}>
        Voltar para o salão
      </Link>
    </div>
  )
}
