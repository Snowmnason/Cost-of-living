import StateDataTable from '@/components/StateDataTable'

export default function StatePage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div
        className="px-4 md:px-10 py-4 md:py-7"
        style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}
      >
        <h1 className="text-3xl font-bold tracking-tight">State-Level Analysis</h1>
        <p className="text-base mt-1.5" style={{ color: 'var(--muted-foreground)' }}>
          Gross monthly income, expenses, and remaining income by state
        </p>
      </div>
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <StateDataTable />
      </div>
    </div>
  )
}
