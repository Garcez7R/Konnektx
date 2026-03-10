import { Link, useParams } from 'react-router-dom'

export default function SalonConfirmedPage() {
  const { slug } = useParams()
  return (
    <div className="page">
      <h1>Agendamento confirmado!</h1>
      <p>Voce recebera uma mensagem com os detalhes. Ate breve.</p>
      <Link className="btn primary" to={`/s/${slug ?? ''}`}>
        Voltar para o salao
      </Link>
    </div>
  )
}
