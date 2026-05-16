import { Link, useLocation } from 'react-router-dom'

export default function Navigation() {
  const location = useLocation()
  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        backgroundColor: 'var(--nav-bg)',
        borderBottom: '1px solid var(--nav-border)',
        boxShadow: '0 2px 12px rgba(15, 9, 30, 0.3)',
      }}
    >
      <div className="px-14 flex items-center justify-between h-14">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-base font-bold tracking-tight"
            style={{ color: '#c084fc' }}
          >
            COL
          </Link>
          <div className="flex gap-3">
            {[
              { to: '/', label: 'Home' },
              { to: '/state', label: 'State' },
              { to: '/county', label: 'County' },
              { to: '/sources', label: 'Sources' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="px-6 h-14 flex items-center text-sm font-medium transition-colors"
                style={{
                  color: isActive(to) ? '#c084fc' : 'rgba(232, 222, 255, 0.6)',
                  borderBottom: isActive(to) ? '2px solid #c084fc' : '2px solid transparent',
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <a
          href="https://www.twitch.tv/mrsnowmanman"
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-medium transition-opacity hover:opacity-100"
          style={{ color: 'rgba(232, 222, 255, 0.3)' }}
        >
          By Snowmanson
        </a>
      </div>
    </nav>
  )
}
