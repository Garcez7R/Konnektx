import { NavLink } from 'react-router-dom'

type TabKey = 'home' | 'agenda' | 'fidelidade' | 'perfil'

type SalonBottomNavProps = {
  slug: string
  active?: TabKey
}

export default function SalonBottomNav({ slug, active }: SalonBottomNavProps) {
  const classFor = (key: TabKey) =>
    ({ isActive }: { isActive: boolean }) =>
      `nav-link${(active ? active === key : isActive) ? ' active' : ''}`

  return (
    <nav className="bottom-nav">
      <NavLink to={`/s/${slug}`} end className={classFor('home')}>
        <span className="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z"
            />
          </svg>
        </span>
        Início
      </NavLink>
      <NavLink to={`/s/${slug}/agendar`} className={classFor('agenda')}>
        <span className="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2zm13 6H6v12h14V8zM8 10h4v4H8v-4z"
            />
          </svg>
        </span>
        Agenda
      </NavLink>
      <NavLink to={`/s/${slug}/fidelidade`} className={classFor('fidelidade')}>
        <span className="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2l2.6 5.3L20 8l-4 3.9.9 5.6L12 15.7 7.1 17.5 8 11.9 4 8l5.4-.7L12 2z"
            />
          </svg>
        </span>
        Fidelidade
      </NavLink>
      <NavLink to={`/s/${slug}/perfil`} className={classFor('perfil')}>
        <span className="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4.4 0-8 2.2-8 5v3h16v-3c0-2.8-3.6-5-8-5z"
            />
          </svg>
        </span>
        Perfil
      </NavLink>
    </nav>
  )
}
