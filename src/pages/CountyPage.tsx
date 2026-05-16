import CountyDataTable from '@/components/CountyDataTable'

export default function CountyPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div
        className="px-10 py-7"
        style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}
      >
        <h1 className="text-3xl font-bold tracking-tight">County-Level Analysis</h1>
        <p className="text-base mt-1.5" style={{ color: 'var(--muted-foreground)' }}>
          Detailed metrics for ~3,000 US counties including metro/non-metro areas
        </p>
      </div>
      <div className="flex-1 overflow-auto p-8">
        <CountyDataTable />
      </div>
    </div>
  )
}
