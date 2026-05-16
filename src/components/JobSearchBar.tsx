import { useState, useRef, useEffect } from 'react'
import type { OewsJobTitle } from '@/types'

type Percentile = 'median' | 'pct10' | 'pct25' | 'pct75' | 'pct90'

interface JobSearchBarProps {
  jobs: OewsJobTitle[]
  selectedJob: OewsJobTitle | null
  onSelect: (job: OewsJobTitle | null) => void
  selectedPercentile: Percentile
  onPercentileChange: (p: Percentile) => void
  jobsLoading?: boolean
}

const PERCENTILE_OPTIONS: { value: Percentile; label: string }[] = [
  { value: 'median', label: 'Median' },
  { value: 'pct10', label: '10th %ile' },
  { value: 'pct25', label: '25th %ile' },
  { value: 'pct75', label: '75th %ile' },
  { value: 'pct90', label: '90th %ile' },
]

export default function JobSearchBar({
  jobs,
  selectedJob,
  onSelect,
  selectedPercentile,
  onPercentileChange,
  jobsLoading,
}: JobSearchBarProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered =
    query.length >= 2
      ? jobs.filter((j) => j.occ_title.toLowerCase().includes(query.toLowerCase())).slice(0, 15)
      : []

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (job: OewsJobTitle) => {
    onSelect(job)
    setQuery('')
    setOpen(false)
  }

  const handleClear = () => {
    onSelect(null)
    setQuery('')
  }

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-xl"
      style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>Gross Monthly Income:</span>

        <div ref={containerRef} className="relative min-w-64">
          {selectedJob ? (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
            >
              <span className="flex-1 font-medium" style={{ color: 'var(--accent)' }}>{selectedJob.occ_title}</span>
              <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>{selectedJob.occ_code}</span>
              <button
                onClick={handleClear}
                className="ml-1 text-xs hover:opacity-100 transition-opacity"
                style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}
                title="Clear — revert to minimum wage"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={query}
                placeholder={jobsLoading ? 'Loading jobs...' : 'Search job title (type 2+ chars)'}
                disabled={jobsLoading}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              />
              {open && filtered.length > 0 && (
                <div
                  className="absolute top-full mt-1 w-full max-h-60 overflow-y-auto rounded-lg shadow-lg z-50"
                  style={{ backgroundColor: '#1c1430', border: '1px solid rgba(124,58,237,0.4)' }}
                >
                  {filtered.map((job) => (
                    <button
                      key={job.occ_code}
                      className="w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 transition-colors"
                      style={{ color: '#e8deff' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.25)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSelect(job)
                      }}
                    >
                      <span>{job.occ_title}</span>
                      <span className="text-foreground/40 text-xs shrink-0">{job.occ_code}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {!selectedJob && (
          <span className="text-xs text-foreground/50 italic">Default: state minimum wage × 160 hrs/mo</span>
        )}
      </div>

      {selectedJob && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Show wage at:</span>
          {PERCENTILE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="percentile"
                value={opt.value}
                checked={selectedPercentile === opt.value}
                onChange={() => onPercentileChange(opt.value)}
                className="cursor-pointer"
                style={{ accentColor: 'var(--accent)' }}
              />
              <span className="text-xs">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
