import { Link } from 'react-router-dom'

const highlights = [
  'Agenda online com fidelidade integrada',
  'Pagina publica linda e personalizavel',
  'Painel para dono e funcionarios',
  'Promocoes por pontos ou regras',
]

export default function HomePage() {
  return (
    <div className="page">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">KONNEKTX</p>
          <h1>Brilho local, agenda cheia.</h1>
          <p className="hero-subtitle">
            Um PWA para barbearias, saloes, manicures e podologos com pagina
            propria, agendamento e fidelidade.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/s/aurora">
              Ver demo
            </Link>
            <a className="btn ghost" href="/app">
              Entrar no painel
            </a>
            <button
              className="btn ghost"
              onClick={() => {
                window.open('https://wa.me/551996263385', '_blank', 'noopener,noreferrer')
              }}
            >
              Fale conosco
            </button>
          </div>
        </div>
        <div className="hero-card">
          <div className="card-glow" />
          <div className="card-body">
            <p className="card-title">Salao Aurora</p>
            <p className="card-subtitle">Centro, Itajuba - MG</p>
            <div className="card-badges">
              <span>Agenda online</span>
              <span>Fidelidade ativa</span>
              <span>Equipe completa</span>
            </div>
          </div>
        </div>
      </header>

      <section className="section grid">
        {highlights.map((item) => (
          <article key={item} className="feature">
            <h3>{item}</h3>
            <p>
              Tudo pronto para o dono do salao publicar em minutos e manter a
              agenda organizada.
            </p>
          </article>
        ))}
      </section>

      <section className="section split">
        <div>
          <h2>Pronto para a sua cidade.</h2>
          <p>
            Konnektx nasce para negocios locais. Cada salao ganha um slug proprio
            no formato <strong>konnektx.app/s/salao</strong>.
          </p>
          <ul className="list">
            <li>Layouts por template com cores e logo.</li>
            <li>Pagina publica rapida para celular.</li>
            <li>Promocoes para segurar o cliente.</li>
          </ul>
        </div>
        <div className="glass-panel">
          <h3>O que vem no MVP</h3>
          <p>Agenda, equipe, servicos, fidelidade e painel do dono.</p>
          <div className="pill">Primeiro deploy funcional</div>
        </div>
      </section>
    </div>
  )
}
