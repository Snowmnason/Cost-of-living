import { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import type { StateData, OewsJobTitle } from '@/types'
import { loadStateData, loadOewsStateJobs, calculateNetIncome, loadFoodStateData, getFoodCostByHouseholdType, loadZoriHousingByState, calculateSalesTaxDeduction } from '@/lib/dataLoader'
import type { OewsStateResult } from '@/lib/dataLoader'
import { useProfile } from '@/hooks/useProfile'
import JobSearchBar from '@/components/JobSearchBar'

type Percentile = 'median' | 'pct10' | 'pct25' | 'pct75' | 'pct90'

function getPoliticalColor(political: string) {
  const lower = political.toLowerCase()
  if (lower === 'democrat' || lower === 'dem') return { color: '#2563eb' }
  if (lower === 'republican' || lower === 'rep') return { color: '#dc2626' }
  return {}
}

function getRowBackground(idx: number) {
  if (idx % 2 === 0) {
    return { backgroundColor: '#f5f3f800' }
  } else {
    return { backgroundColor: '#72648e64' }
  }
}

type SortColumn = 'state' | 'gross_income' | 'net_income' | 'housing_cost' | 'food_cost' | 'total_expenses' | 'monthly_remaining' | null
type SortDirection = 'asc' | 'desc'

interface SortHeaderProps {
  column: SortColumn
  label: string
  sortColumn: SortColumn
  sortDirection: SortDirection
  onSort: (column: SortColumn) => void
}

function SortHeader({ column, label, sortColumn, sortDirection, onSort }: SortHeaderProps) {
  const active = sortColumn === column
  return (
    <th
      className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide cursor-pointer whitespace-nowrap transition-colors"
      style={{
        color: active ? '#c084fc' : 'rgba(232, 222, 255, 0.75)',
        backgroundColor: active ? 'rgba(124, 58, 237, 0.25)' : undefined,
      }}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center justify-center gap-1">
        {label}
        {active && (
          sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        )}
      </div>
    </th>
  )
}

export default function StateDataTable() {
  const { profile } = useProfile()
  const [data, setData] = useState<StateData[]>([])
  const [loading, setLoading] = useState(true)
  const [oewsData, setOewsData] = useState<OewsStateResult | null>(null)
  const [oewsLoading, setOewsLoading] = useState(true)
  const [foodData, setFoodData] = useState<Map<string, Record<string, number>> | null>(null)
  const [housingByState, setHousingByState] = useState<Map<string, number> | null>(null)
  const [selectedJob, setSelectedJob] = useState<OewsJobTitle | null>(null)
  const [selectedPercentile, setSelectedPercentile] = useState<Percentile>('median')
  const [sortColumn, setSortColumn] = useState<SortColumn>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [excludedStates, setExcludedStates] = useState<Set<string>>(new Set())
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    loadStateData().then((stateData) => {
      setData(stateData)
      setLoading(false)
    })
    loadOewsStateJobs().then((result) => {
      setOewsData(result)
      setOewsLoading(false)
    })
    loadFoodStateData().then((fData) => {
      setFoodData(fData)
    })
    loadZoriHousingByState().then((hData) => {
      setHousingByState(hData)
    })
  }, [])

  const getGrossIncome = (row: StateData): number => {
    if (!selectedJob || !oewsData) return row.gross_income
    const jobMap = oewsData.byStateFips.get(row.state_fips)
    if (!jobMap) return row.gross_income
    const job = jobMap.get(selectedJob.occ_code)
    if (!job) return row.gross_income
    const hourly = job[`hourly_${selectedPercentile}` as keyof typeof job] as number | null
    if (hourly === null || hourly === undefined) return row.gross_income
    return Math.round(hourly * 160 * 100) / 100
  }

  const getNetIncome = (row: StateData): number => {
    if (!profile.filing_status) return 0
    const grossIncome = getGrossIncome(row)
    const result = calculateNetIncome(grossIncome, row.state_fips, row.state_abbr, profile.filing_status, (profile.contribution_401k || 0) / 100)
    return result.netIncome
  }

  const getFoodCost = (row: StateData): number => {
    if (!foodData) return 0
    const householdType = profile.household_type || '1 Adult, 0 Kids'
    return getFoodCostByHouseholdType(householdType, foodData, row.state_fips)
  }

  const getHousingCost = (row: StateData): number | null => {
    if (!housingByState) return null
    return housingByState.get(row.state_fips) ?? null
  }

  const getTotalExpenses = (row: StateData): number => {
    const housing = getHousingCost(row) ?? 0
    const electric = row.electric_cost ?? 0
    const internet = row.internet_cost ?? 0
    const phone = row.phone_cost ?? 0
    const carIns = row.car_insurance_cost ?? 0
    const food = getFoodCost(row)
    return Math.round((housing + electric + internet + phone + carIns + food) * 100) / 100
  }

  const getMonthlyRemaining = (row: StateData): number => {
    const netIncome = getNetIncome(row)
    const totalExpenses = getTotalExpenses(row)
    return Math.round((netIncome - totalExpenses) * 100) / 100
  }

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const toggleExcludeState = (state: string) => {
    setExcludedStates(prev => {
      const newSet = new Set(prev)
      if (newSet.has(state)) {
        newSet.delete(state)
      } else {
        newSet.add(state)
      }
      return newSet
    })
  }

  const getSortedData = () => {
    const filtered = data.filter(row => !excludedStates.has(row.state) && row.state !== 'United States')
    
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aVal: string | number = a.state
        let bVal: string | number = b.state

        if (sortColumn === 'state') {
          aVal = a.state
          bVal = b.state
        } else if (sortColumn === 'gross_income') {
          aVal = getGrossIncome(a)
          bVal = getGrossIncome(b)
        } else if (sortColumn === 'net_income') {
          aVal = getNetIncome(a)
          bVal = getNetIncome(b)
        } else if (sortColumn === 'housing_cost') {
          aVal = getHousingCost(a) ?? 0
          bVal = getHousingCost(b) ?? 0
        } else if (sortColumn === 'food_cost') {
          aVal = getFoodCost(a)
          bVal = getFoodCost(b)
        } else if (sortColumn === 'total_expenses') {
          aVal = getTotalExpenses(a)
          bVal = getTotalExpenses(b)
        } else if (sortColumn === 'monthly_remaining') {
          aVal = getMonthlyRemaining(a)
          bVal = getMonthlyRemaining(b)
        }

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const compareResult = aVal.localeCompare(bVal)
          return sortDirection === 'asc' ? compareResult : -compareResult
        } else {
          const aNum = typeof aVal === 'string' ? 0 : (aVal || 0)
          const bNum = typeof bVal === 'string' ? 0 : (bVal || 0)
          const compareResult = aNum - bNum
          return sortDirection === 'asc' ? compareResult : -compareResult
        }
      })
    }

    return filtered
  }

  if (loading) {
    return <div className="text-center py-16 text-foreground/60">Loading data...</div>
  }

  if (!data.length) {
    return <div className="text-center py-16 text-foreground/60">No data available</div>
  }

  const displayData = getSortedData()

  return (
    <div className="w-full space-y-4">
      <JobSearchBar
        jobs={oewsData?.titles ?? []}
        selectedJob={selectedJob}
        onSelect={(job) => {
          setSelectedJob(job)
          if (!job) setSelectedPercentile('median')
        }}
        selectedPercentile={selectedPercentile}
        onPercentileChange={setSelectedPercentile}
        jobsLoading={oewsLoading}
      />

      <div className="flex gap-2">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          Filter States ({data.length - 1 - excludedStates.size}/{data.length - 1})
        </button>
        {excludedStates.size > 0 && (
          <button
            onClick={() => setExcludedStates(new Set())}
            className="px-4 py-2 text-sm rounded-lg border transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--background)' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {showFilter && (
        <div
          className="p-4 rounded-xl space-y-3"
          style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
        >
          <label className="flex items-center gap-2 cursor-pointer font-medium text-sm border-b pb-2" style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}>
            <input
              type="checkbox"
              checked={excludedStates.size === 0}
              onChange={() => {
                if (excludedStates.size === 0) {
                  setExcludedStates(new Set(data.filter(row => row.state !== 'United States').map(row => row.state)))
                } else {
                  setExcludedStates(new Set())
                }
              }}
              className="w-4 h-4 cursor-pointer"
            />
            <span>{excludedStates.size === 0 ? 'Deselect All' : 'Select All'}</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
            {data.filter(row => row.state !== 'United States').map(row => (
            <label key={row.state} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={!excludedStates.has(row.state)}
                onChange={() => toggleExcludeState(row.state)}
                className="w-4 h-4 cursor-pointer"
              />
              <span>{row.state}</span>
            </label>
          ))}
          </div>
        </div>
      )}

      <div
        className="w-full overflow-x-auto rounded-xl"
        style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
      >
        <table className="w-full text-sm">
          <thead
            className="sticky top-0"
            style={{ backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)' }}
          >
            <tr>
              <th
                className="py-3 text-center text-xs font-semibold uppercase tracking-wide"
                style={{ width: '36px', minWidth: '36px', color: 'rgba(232, 222, 255, 0.45)' }}
              >#</th>
              <SortHeader column="state" label="State" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <SortHeader column="gross_income" label="Gross Monthly Income" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <SortHeader column="net_income" label="Net Income" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <SortHeader column="housing_cost" label="Housing Cost" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <th className="px-4 py-3 text-center font-semibold">Electric Cost</th>
              <th className="px-4 py-3 text-center font-semibold">Internet Cost</th>
              <th className="px-4 py-3 text-center font-semibold">Phone Cost</th>
              <th className="px-4 py-3 text-center font-semibold">Car Insurance Cost</th>
              <th className="px-4 py-3 text-center font-semibold">Food Cost</th>
              <SortHeader column="total_expenses" label="Total Monthly Expenses" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <SortHeader column="monthly_remaining" label="Monthly Remaining" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, idx) => (
              <tr
                key={row.state}
                style={getRowBackground(idx)}
                className="border-b border-border"
              >
                <td
                  className="py-3 text-center text-xs select-none"
                  style={{ width: '36px', minWidth: '36px', color: 'var(--muted-foreground)' }}
                >
                  {idx + 1}
                </td>
                <td style={getPoliticalColor(row.political)} className="px-4 py-3 font-semibold text-center">{row.state}</td>
                <td className="px-4 py-3 text-center">${getGrossIncome(row).toFixed(2)}</td>
                <td 
                  className="px-4 py-3 text-center cursor-help hover:bg-muted/50 transition"
                  title={profile.filing_status ? `Filing Status: ${profile.filing_status}` : 'Fill in profile to see net income'}
                >
                  {profile.filing_status ? `$${getNetIncome(row).toFixed(2)}` : '-'}
                </td>
                <td
                  className="px-4 py-3 text-center"
                >
                  {getHousingCost(row) !== null ? `$${getHousingCost(row)!.toFixed(2)}` : '-'}
                </td>
                <td className="px-4 py-3 text-center">{row.electric_cost ? `$${row.electric_cost.toFixed(2)}` : '-'}</td>
                <td 
                  className="px-4 py-3 text-center cursor-help hover:bg-muted/50 transition"
                  title={row.internet_min && row.internet_max ? `Lowest: $${row.internet_min.toFixed(2)} | Highest: $${row.internet_max.toFixed(2)}` : ''}
                >
                  {row.internet_cost ? `$${row.internet_cost.toFixed(2)}` : '-'}
                </td>
                <td 
                  className="px-4 py-3 text-center cursor-help hover:bg-muted/50 transition"
                  title={row.phone_provider && row.phone_alt_provider ? `${row.phone_provider} (selected) | Alt: ${row.phone_alt_provider} ($${row.phone_alt_cost?.toFixed(2)}/mo)` : ''}
                >
                  {row.phone_cost ? `$${row.phone_cost.toFixed(2)}` : '-'}
                </td>
                <td 
                  className="px-4 py-3 text-center cursor-help hover:bg-muted/50 transition"
                  title={row.car_insurance_base_cost ? `State average (age 25): $${row.car_insurance_base_cost.toFixed(2)}` : ''}
                >
                  {row.car_insurance_cost ? `$${row.car_insurance_cost.toFixed(2)}` : '-'}
                </td>
                <td 
                  className="px-4 py-3 text-center cursor-help hover:bg-muted/50 transition"
                  title={profile.household_type ? `Household: ${profile.household_type}` : 'Default: 1 Adult, 0 Kids'}
                >
                  ${getFoodCost(row).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center font-semibold">${getTotalExpenses(row).toFixed(2)}</td>
                <td 
                  className="px-4 py-3 text-center cursor-help hover:bg-muted/50 transition"
                  title={`After sales tax: $${(getMonthlyRemaining(row) - calculateSalesTaxDeduction(getMonthlyRemaining(row), row.state_abbr)).toFixed(2)}`}
                >
                  ${getMonthlyRemaining(row).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
