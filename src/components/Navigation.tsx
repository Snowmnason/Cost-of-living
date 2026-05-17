import { Link, useLocation } from 'react-router-dom'

export default function Navigation() {
  const location = useLocation()
  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <nav
      className="sticky top-0 z-50 overflow-x-auto"
      style={{
        backgroundColor: 'var(--nav-bg)',
        borderBottom: '1px solid var(--nav-border)',
        boxShadow: '0 2px 12px rgba(15, 9, 30, 0.3)',
      }}
    >
      <div className="px-4 md:px-14 flex items-center justify-between h-14 min-w-max md:min-w-0">
        <div className="flex items-center gap-2 md:gap-8 flex-nowrap">
          <div className="flex gap-1 md:gap-3 flex-nowrap">
            {[
              { to: '/', label: 'Home' },
              { to: '/state', label: 'State' },
              { to: '/county', label: 'County' },
              { to: '/sources', label: 'Sources' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="px-3 md:px-6 h-14 flex items-center text-xs md:text-sm font-medium transition-colors whitespace-nowrap"
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
          className="text-xs md:text-base font-medium transition-opacity hover:opacity-100 ml-4 md:ml-0 whitespace-nowrap"
          style={{ color: 'rgba(232, 222, 255, 0.3)' }}
        >
          By Snowmanson
        </a>
      </div>
    </nav>
  )
}
