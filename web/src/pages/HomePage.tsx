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
              className="btn ghost btn-icon"
              onClick={() => {
                window.open('https://wa.me/551996263385', '_blank', 'noopener,noreferrer')
              }}
            >
              <span className="icon">
                <svg viewBox="0 0 32 32" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M19.1 17.4c-.2-.1-1.2-.6-1.4-.7-.2-.1-.4-.1-.6.1-.2.2-.7.7-.8.9-.1.1-.3.2-.5.1-1.2-.6-2.1-1-3-2.2-.2-.3.2-.3.6-.9.1-.2.1-.3 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.8-.9 2 0 1.2.9 2.3 1 2.5.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.2-.5 1.4-1 .2-.5.2-.9.1-1-.1-.1-.2-.1-.4-.2ZM16 5.5c-5.8 0-10.5 4.7-10.5 10.5 0 2 .6 4 1.7 5.6L6 26.5l5.1-1.4c1.6.9 3.4 1.4 5.3 1.4 5.8 0 10.5-4.7 10.5-10.5S21.8 5.5 16 5.5Zm0 19.1c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-3 .8.8-2.9-.2-.4a9 9 0 1 1 7.9 4.1Z"
                  />
                </svg>
              </span>
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

      <section className="section contact-section">
        <div className="glass-panel">
          <h2>Konnektx · Fale conosco</h2>
          <p>
            Quer levar o Konnektx para sua barbearia ou salao? Fale direto com a
            equipe e a gente te ajuda a publicar hoje mesmo.
          </p>
          <button
            className="btn primary btn-icon"
            onClick={() => {
              window.open('https://wa.me/551996263385', '_blank', 'noopener,noreferrer')
            }}
          >
            <span className="icon">
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M19.1 17.4c-.2-.1-1.2-.6-1.4-.7-.2-.1-.4-.1-.6.1-.2.2-.7.7-.8.9-.1.1-.3.2-.5.1-1.2-.6-2.1-1-3-2.2-.2-.3.2-.3.6-.9.1-.2.1-.3 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.8-.9 2 0 1.2.9 2.3 1 2.5.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.2-.5 1.4-1 .2-.5.2-.9.1-1-.1-.1-.2-.1-.4-.2ZM16 5.5c-5.8 0-10.5 4.7-10.5 10.5 0 2 .6 4 1.7 5.6L6 26.5l5.1-1.4c1.6.9 3.4 1.4 5.3 1.4 5.8 0 10.5-4.7 10.5-10.5S21.8 5.5 16 5.5Zm0 19.1c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-3 .8.8-2.9-.2-.4a9 9 0 1 1 7.9 4.1Z"
                />
              </svg>
            </span>
            Chamar no WhatsApp
          </button>
        </div>
      </section>
    </div>
  )
}
