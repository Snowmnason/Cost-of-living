import { Link } from 'react-router-dom'
import ProfileComponent from '@/components/ProfileComponent'

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 py-8">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        {/* Hero */}
        <div className="text-center space-y-2">
          <h1 className="text-7xl font-bold tracking-tight">Cost of Living Calculator</h1>
          <p className="text-2xl" style={{ color: 'var(--muted-foreground)' }}>
            Explore state and county-level expense data across the United States
          </p>
        </div>

        {/* Profile Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <ProfileComponent />
        </div>

        {/* Nav Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/state"
            className="rounded-xl p-6 block transition-all hover:shadow-lg"
            style={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="text-lg mb-2" style={{ color: 'var(--accent)' }}>&#128506;</div>
            <h2 className="text-2xl font-semibold mb-1">State Analysis</h2>
            <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
              View aggregated expense and income data by state
            </p>
          </Link>
          <Link
            to="/county"
            className="rounded-xl p-6 block transition-all hover:shadow-lg"
            style={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="text-lg mb-2" style={{ color: 'var(--accent)' }}>&#128202;</div>
            <h2 className="text-2xl font-semibold mb-1">County Analysis</h2>
            <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
              Explore detailed metrics for ~3,000 US counties
            </p>
          </Link>
        </div>

        <div className="text-center">
          <Link to="/sources" className="text-lg hover:underline" style={{ color: 'var(--accent)' }}>
            View data sources and methodology →
          </Link>
        </div>
      </div>
    </div>
  )
}
