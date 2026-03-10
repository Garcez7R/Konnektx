import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
}

const highlights = [
  {
    title: 'Sua Agenda Digital',
    description:
      'Um link exclusivo com a sua cara para o cliente marcar horário sozinho, acabando com a confusão no WhatsApp.',
  },
  {
    title: 'Sua Vitrine na Internet',
    description:
      'Uma página profissional que destaca seu trabalho, suas fotos e seus preços de forma elegante.',
  },
  {
    title: 'Controle Simples e Direto',
    description:
      'Um painel que você domina em minutos para organizar sua equipe e ver o movimento do dia.',
  },
  {
    title: 'Fidelidade que Traz o Cliente de Volta',
    description:
      'Crie cartões fidelidade digitais e promoções que garantem que o cliente escolha sempre o seu salão.',
  },
]

export default function HomePage() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    setIsIos(/iphone|ipad|ipod/.test(userAgent))
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone
    setIsInstalled(Boolean(standalone))
    const handleInstalled = () => setIsInstalled(true)
    window.addEventListener('appinstalled', handleInstalled)
    return () => window.removeEventListener('appinstalled', handleInstalled)
  }, [])

  const showInstall = !isInstalled && (Boolean(installPrompt) || isIos)

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-content">
          <div className="brand-row">
            <button
              className="brand-menu"
              aria-label="Abrir menu"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <img className="brand-icon" src="/novoicon.png" alt="" />
            </button>
            <p className="eyebrow brand">KONNEKTX</p>
            {menuOpen && (
              <div className="brand-dropdown">
                <Link to="/">Início</Link>
                <Link to="/s/aurora">Ver demonstração</Link>
                <a href="/app">Entrar no painel</a>
                <a href="/app/gestor">Área do gestor</a>
              </div>
            )}
          </div>
          <h1>Sua marca em destaque, sua agenda lotada.</h1>
          <p className="hero-subtitle">
            A tecnologia que você entende, o resultado que você quer.
          </p>
          <p className="hero-subtitle">
            Transforme sua barbearia ou salão com uma ferramenta feita para quem
            não tem tempo a perder. Tenha seu próprio link de agendamento que
            funciona direto no celular do cliente — sem que ele precise baixar
            nada ou ocupar memória. É a evolução do seu negócio, simples de usar
            e focada no seu crescimento.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/s/aurora">
              Ver demonstração
            </Link>
            <a className="btn ghost" href="/app">
              Entrar no painel
            </a>
            <button
              className="btn ghost btn-icon"
              onClick={() => {
                window.open('https://wa.me/5551996263385', '_blank', 'noopener,noreferrer')
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
          <p className="legal-note">
            Ao continuar, você concorda com o tratamento de dados conforme a LGPD
            (Lei 13.709/2018) e o Marco Civil da Internet (Lei 12.965/2014).
          </p>
        </div>
        <div className="hero-card">
          <div className="card-glow" />
          <div className="card-body">
            <p className="card-title">Salão Aurora</p>
            <p className="card-subtitle">Centro, Pelotas - RS</p>
            <div className="card-badges">
              <span>Agenda online 24h</span>
              <span>Fidelidade ativa</span>
              <span>Equipe completa</span>
            </div>
          </div>
        </div>
        <div className="hero-mock">
          <img src="/mock.jpg" alt="Preview do PWA Konnektx" />
        </div>
      </header>

      <section className="section grid">
        <div className="section-title">
          <h2>Como o Konnektx trabalha com você:</h2>
        </div>
        {highlights.map((item) => (
          <article key={item.title} className="feature">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </section>

      <section className="section split">
        <div>
          <h2>Pronto para a sua cidade</h2>
          <p>
            O Konnektx nasceu para fortalecer quem faz a economia local girar.
            Seu salão ganha um endereço próprio (ex: konnektx.app/s/seusalao).
          </p>
          <ul className="list">
            <li>Sem instalações complicadas: funciona direto no navegador do celular.</li>
            <li>Rapidez Total: abre instantaneamente, mesmo em conexões mais lentas.</li>
            <li>Feito para Parceria: a gente te ajuda a configurar e colocar no ar hoje mesmo.</li>
          </ul>
        </div>
        <div className="glass-panel">
          <h3>O que você recebe ao começar:</h3>
          <p>Agenda inteligente, gestão de equipe, vitrine de serviços, sistema de pontos e painel do dono.</p>
          <div className="hero-actions">
            <a className="btn primary" href="/app">
              Tudo pronto para o seu primeiro uso
            </a>
          </div>
          <p className="hero-subtitle">
            A tecnologia que você entende para o resultado que você sempre quis.
          </p>
        </div>
      </section>

      <section className="section split">
        <div>
          <h2>Beauty as a Service</h2>
          <p>
            Você não assina apenas um software. Você recebe um negócio digital
            em uma caixa: hospedagem, design premium e agendamento online.
          </p>
          <p>Em poucos minutos, sua presença digital está pronta para vender mais.</p>
        </div>
        <div className="plans">
          <div className="plan-card">
            <h3>Plano Bronze</h3>
            <p>Para o profissional individual.</p>
            <ul className="list">
              <li>Agenda + link próprio</li>
              <li>Página personalizada</li>
              <li>Suporte inicial</li>
            </ul>
            <div className="pill">Recorrência mensal</div>
          </div>
          <div className="plan-card highlight">
            <h3>Plano Ouro</h3>
            <p>Para barbearias com equipe.</p>
            <ul className="list">
              <li>Painel de funcionários</li>
              <li>Fidelidade integrada</li>
              <li>Relatórios do salão</li>
            </ul>
            <div className="pill">Escala e performance</div>
          </div>
        </div>
      </section>

      

      <section className="section contact-section">
        <div className="glass-panel">
          <h2>Quer levar o Konnektx para sua barbearia ou salão?</h2>
          <p>
            Fale direto com a nossa equipe e a gente te ajuda a colocar tudo no ar
            agora.
          </p>
          <button
            className="btn primary btn-icon"
            onClick={() => {
              window.open('https://wa.me/5551996263385', '_blank', 'noopener,noreferrer')
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
          {showInstall && (
            <div className="install-block">
              {installPrompt && (
                <button
                  className="btn ghost install-btn"
                  onClick={async () => {
                    await installPrompt.prompt()
                    setInstallPrompt(null)
                  }}
                >
                  Instalar app
                </button>
              )}
              {isIos && !installPrompt && (
                <button className="btn ghost install-btn" type="button">
                  Instalar no iPhone
                </button>
              )}
              {isIos && (
                <p className="legal-note ios-note">
                  No iPhone, toque em Compartilhar e selecione “Adicionar à Tela de Início”.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
