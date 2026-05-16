import { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown, Pin } from 'lucide-react'
import type { CountyData, OewsJobTitle } from '@/types'
import { loadCountyData, loadOewsCountyJobs, calculateNetIncome, loadFoodCountyData, getFoodCostByHouseholdType, loadZoriHousingByState, loadHugFmrData, getHugFmrCost, calculateSalesTaxDeduction } from '@/lib/dataLoader'
import type { OewsCountyResult } from '@/lib/dataLoader'
import { useProfile } from '@/hooks/useProfile'
import JobSearchBar from '@/components/JobSearchBar'

type Percentile = 'median' | 'pct10' | 'pct25' | 'pct75' | 'pct90'

function getRowBackground(idx: number) {
  if (idx % 2 === 0) {
    return { backgroundColor: '#f5f3f800' }
  } else {
    return { backgroundColor: '#72648e64' }
  }
}

type SortColumn = 'state' | 'county' | 'gross_income' | 'net_income' | 'housing_cost' | 'food_cost' | 'total_expenses' | 'monthly_remaining' | null
type SortDirection = 'asc' | 'desc'

interface SortHeaderProps {
  column: SortColumn
  label: string
  sortColumn: SortColumn
  sortDirection: SortDirection
  onSort: (column: SortColumn) => void
}

function SortHeaderComponent({ column, label, sortColumn: currentSortColumn, sortDirection: currentSortDirection, onSort }: SortHeaderProps) {
  const active = currentSortColumn === column
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
          currentSortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        )}
      </div>
    </th>
  )
}

export default function CountyDataTable() {
  const { profile } = useProfile()
  const [data, setData] = useState<CountyData[]>([])
  const [loading, setLoading] = useState(true)
  const [oewsData, setOewsData] = useState<OewsCountyResult | null>(null)
  const [oewsLoading, setOewsLoading] = useState(true)
  const [foodData, setFoodData] = useState<Map<string, Record<string, number>> | null>(null)
  const [housingByState, setHousingByState] = useState<Map<string, number> | null>(null)
  const [fmrData, setFmrData] = useState<Map<string, import('@/lib/dataLoader').HugFmrRow> | null>(null)
  const [selectedJob, setSelectedJob] = useState<OewsJobTitle | null>(null)
  const [selectedPercentile, setSelectedPercentile] = useState<Percentile>('median')
  const [sortColumn, setSortColumn] = useState<SortColumn>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [excludedCounties, setExcludedCounties] = useState<Set<string>>(new Set())
  const [showFilter, setShowFilter] = useState(false)
  const [filterState, setFilterState] = useState<string>('')
  const [countySearch, setCountySearch] = useState('')
  const [pinnedCounties, setPinnedCounties] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadCountyData().then((countyData) => {
      setData(countyData)
      setLoading(false)
    })
    loadOewsCountyJobs().then((result) => {
      setOewsData(result)
      setOewsLoading(false)
    })
    loadFoodCountyData().then((fData) => {
      setFoodData(fData)
    })
    loadZoriHousingByState().then((hData) => {
      setHousingByState(hData)
    })
    loadHugFmrData().then((fmr) => {
      setFmrData(fmr)
    })
  }, [])

  const getGrossIncome = (row: CountyData): number => {
    if (!selectedJob || !oewsData || !row.msa_code) return row.gross_income
    const jobMap = oewsData.byMsaCode.get(row.msa_code)
    if (!jobMap) return row.gross_income
    const job = jobMap.get(selectedJob.occ_code)
    if (!job) return row.gross_income
    const hourly = job[`hourly_${selectedPercentile}` as keyof typeof job] as number | null
    if (hourly === null || hourly === undefined) return row.gross_income
    return Math.round(hourly * 160 * 100) / 100
  }

  const getNetIncome = (row: CountyData): number => {
    if (!profile.filing_status) return 0
    const grossIncome = getGrossIncome(row)
    const result = calculateNetIncome(grossIncome, row.state_fips, row.state_abbr, profile.filing_status, (profile.contribution_401k || 0) / 100)
    return result.netIncome
  }

  const getFoodCost = (row: CountyData): number => {
    if (!foodData) return 0
    const householdType = profile.household_type || '1 Adult, 0 Kids'
    return getFoodCostByHouseholdType(householdType, foodData, row.msa_code)
  }

  const getHousingCost = (row: CountyData): number | null => {
    if (!housingByState) return null
    return housingByState.get(row.state_fips) ?? null
  }

  const getTotalExpenses = (row: CountyData): number => {
    const housing = getHousingCost(row) ?? 0
    const electric = row.electric_cost ?? 0
    const internet = row.internet_cost ?? 0
    const phone = row.phone_cost ?? 0
    const carIns = row.car_insurance_cost ?? 0
    const food = getFoodCost(row)
    return Math.round((housing + electric + internet + phone + carIns + food) * 100) / 100
  }

  const getMonthlyRemaining = (row: CountyData): number => {
    const netIncome = getNetIncome(row)
    const totalExpenses = getTotalExpenses(row)
    return Math.round((netIncome - totalExpenses) * 100) / 100
  }

  const getFmrTooltip = (row: CountyData): string => {
    if (!fmrData) return ''
    const ht = profile.household_type || '1 Adult, 0 Kids'
    const fmr = getHugFmrCost(ht, fmrData, row.state_fips, row.county_code)
    const housing = getHousingCost(row)
    const avgPart = housing !== null ? `Average: $${housing.toFixed(2)}` : ''
    const fmrPart = fmr !== null ? `HUD FMR: $${fmr.toFixed(2)}` : 'HUD FMR: no data'
    return [avgPart, fmrPart].filter(Boolean).join(' | ')
  }

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const toggleExcludeCounty = (county_key: string) => {
    setExcludedCounties(prev => {
      const newSet = new Set(prev)
      if (newSet.has(county_key)) {
        newSet.delete(county_key)
      } else {
        newSet.add(county_key)
      }
      return newSet
    })
  }

  const togglePin = (key: string) => {
    setPinnedCounties(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const getSortedData = () => {
    let filtered = data.filter(row => !excludedCounties.has(`${row.state}-${row.county_name}`))

    if (filterState) {
      filtered = filtered.filter(row => row.state === filterState)
    }

    if (countySearch.trim()) {
      filtered = filtered.filter(row =>
        row.county_name.toLowerCase().includes(countySearch.toLowerCase().trim())
      )
    }
    
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aVal: string | number = `${a.state}-${a.county_name}`
        let bVal: string | number = `${b.state}-${b.county_name}`

        if (sortColumn === 'state') {
          aVal = a.state
          bVal = b.state
        } else if (sortColumn === 'county') {
          aVal = a.county_name
          bVal = b.county_name
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

  const states = Array.from(new Set(data.map(d => d.state))).sort()
  const allSorted = getSortedData()
  const pinnedRows = data.filter(row => pinnedCounties.has(`${row.state}-${row.county_name}`))
  const unpinnedRows = allSorted.filter(row => !pinnedCounties.has(`${row.state}-${row.county_name}`))

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

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={countySearch}
          onChange={e => setCountySearch(e.target.value)}
          placeholder="Search counties..."
          list="county-autocomplete"
          className="px-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', width: '220px' }}
        />
        <datalist id="county-autocomplete">
          {Array.from(new Set(data.map(d => d.county_name))).sort().map(name => (
            <option key={name} value={name} />
          ))}
        </datalist>
        {countySearch && (
          <button
            onClick={() => setCountySearch('')}
            className="px-2 py-1 text-xs rounded-lg border"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--background)' }}
          >
            ✕ Clear
          </button>
        )}
        {pinnedCounties.size > 0 && (
          <span className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: 'var(--muted)', color: 'var(--accent)' }}>
            {pinnedCounties.size} pinned
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          Filter Counties
        </button>
        {(excludedCounties.size > 0 || filterState) && (
          <button
            onClick={() => {
              setExcludedCounties(new Set())
              setFilterState('')
            }}
            className="px-4 py-2 text-sm rounded-lg border transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--background)' }}
          >
            Clear All Filters
          </button>
        )}
        {filterState && (
          <div
            className="px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
          >
            Filtering: {filterState}
            <button
              onClick={() => setFilterState('')}
              className="hover:opacity-100 transition-opacity"
              style={{ opacity: 0.6 }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {showFilter && (
        <div
          className="p-4 rounded-xl space-y-4"
          style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
        >
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--muted-foreground)' }}>Filter by State</label>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--muted)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {filterState && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {data
                .filter(d => d.state === filterState)
                .map(row => (
                  <label key={`${row.state}-${row.county_name}`} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={!excludedCounties.has(`${row.state}-${row.county_name}`)}
                      onChange={() => toggleExcludeCounty(`${row.state}-${row.county_name}`)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span>{row.county_name}</span>
                  </label>
                ))}
            </div>
          )}
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
                title="Click a row's rank to pin/unpin it"
              >#</th>
              <SortHeaderComponent column="state" label="State" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <SortHeaderComponent column="county" label="County" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <SortHeaderComponent column="gross_income" label="Gross Monthly Income" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <SortHeaderComponent column="net_income" label="Net Income" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <SortHeaderComponent column="housing_cost" label="Housing Cost" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <th className="px-4 py-3 text-center font-semibold">Electric Cost</th>
              <th className="px-4 py-3 text-center font-semibold">Internet Cost</th>
              <th className="px-4 py-3 text-center font-semibold">Phone Cost</th>
              <th className="px-4 py-3 text-center font-semibold">Car Insurance Cost</th>
              <SortHeaderComponent column="food_cost" label="Food Cost" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <SortHeaderComponent column="total_expenses" label="Total Monthly Expenses" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <SortHeaderComponent column="monthly_remaining" label="Monthly Remaining" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {pinnedRows.map(row => {
              const key = `${row.state}-${row.county_name}`
              return (
                <tr
                  key={`pinned-${key}`}
                  style={{ ...getRowBackground(0), borderLeft: '3px solid var(--accent)' }}
                  className="border-b border-border"
                >
                  <td
                    className="py-3 text-center cursor-pointer"
                    style={{ width: '36px', minWidth: '36px', color: 'var(--accent)' }}
                    onClick={() => togglePin(key)}
                    title="Click to unpin"
                  >
                    <Pin size={11} fill="currentColor" className="mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{row.state}</td>
                  <td className="px-4 py-3 text-center">{row.county_name}</td>
                  <td className="px-4 py-3 text-center">${getGrossIncome(row).toFixed(2)}</td>
                  <td
                    className="px-4 py-3 text-center cursor-help hover:bg-muted/50 transition"
                    title={profile.filing_status ? `Filing Status: ${profile.filing_status}` : 'Fill in profile to see net income'}
                  >
                    {profile.filing_status ? `$${getNetIncome(row).toFixed(2)}` : '-'}
                  </td>
                  <td
                    className="px-4 py-3 text-center cursor-help hover:bg-muted/50 transition"
                    title={getFmrTooltip(row)}
                  >
                    {getHousingCost(row) !== null ? `$${getHousingCost(row)!.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">{row.electric_cost ? `$${row.electric_cost.toFixed(2)}` : '-'}</td>
                  <td className="px-4 py-3 text-center">{row.internet_cost ? `$${row.internet_cost.toFixed(2)}` : '-'}</td>
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
              )
            })}
            {unpinnedRows.map((row, idx) => {
              const key = `${row.state}-${row.county_name}`
              return (
                <tr
                  key={`${key}-${idx}`}
                  style={getRowBackground(idx)}
                  className="border-b border-border"
                >
                  <td
                    className="py-3 text-center text-xs cursor-pointer select-none"
                    style={{ width: '36px', minWidth: '36px', color: 'var(--muted-foreground)' }}
                    onClick={() => togglePin(key)}
                    title="Click to pin"
                  >
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{row.state}</td>
                  <td className="px-4 py-3 text-center">{row.county_name}</td>
                <td className="px-4 py-3 text-center">${getGrossIncome(row).toFixed(2)}</td>
                <td 
                  className="px-4 py-3 text-center cursor-help hover:bg-muted/50 transition"
                  title={profile.filing_status ? `Filing Status: ${profile.filing_status}` : 'Fill in profile to see net income'}
                >
                  {profile.filing_status ? `$${getNetIncome(row).toFixed(2)}` : '-'}
                </td>
                <td
                  className="px-4 py-3 text-center cursor-help hover:bg-muted/50 transition"
                  title={getFmrTooltip(row)}
                >
                  {getHousingCost(row) !== null ? `$${getHousingCost(row)!.toFixed(2)}` : '-'}
                </td>
                <td className="px-4 py-3 text-center">{row.electric_cost ? `$${row.electric_cost.toFixed(2)}` : '-'}</td>
                <td className="px-4 py-3 text-center">{row.internet_cost ? `$${row.internet_cost.toFixed(2)}` : '-'}</td>
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
            )
          })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
