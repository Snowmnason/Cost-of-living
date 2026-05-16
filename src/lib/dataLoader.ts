import Papa from 'papaparse'
import type { StateData, CountyData, OewsJobData, OewsJobTitle } from '@/types'

export type { OewsJobTitle }

export interface OewsStateResult {
  titles: OewsJobTitle[]
  byStateFips: Map<string, Map<string, OewsJobData>>
}

export interface OewsCountyResult {
  titles: OewsJobTitle[]
  byMsaCode: Map<string, Map<string, OewsJobData>>
}

interface TaxBracket {
  min: number
  rate: number
}

// 2024 Standard Deductions
const STANDARD_DEDUCTIONS: Record<string, number> = {
  'Single': 14600,
  'Married Joint': 29200,
  'Married Separate': 14600,
  'Head of Household': 21900,
  'Qualifying Widow': 29200,
}

// 2024 Federal Tax Brackets (Single)
const FED_TAX_BRACKETS_SINGLE: TaxBracket[] = [
  { min: 0, rate: 0.10 },
  { min: 11600, rate: 0.12 },
  { min: 47150, rate: 0.22 },
  { min: 100525, rate: 0.24 },
  { min: 191950, rate: 0.32 },
  { min: 243725, rate: 0.35 },
  { min: 609350, rate: 0.37 },
]

// 2024 Federal Tax Brackets (Married Filing Jointly)
const FED_TAX_BRACKETS_MFJ: TaxBracket[] = [
  { min: 0, rate: 0.10 },
  { min: 23200, rate: 0.12 },
  { min: 94300, rate: 0.22 },
  { min: 201050, rate: 0.24 },
  { min: 383900, rate: 0.32 },
  { min: 487450, rate: 0.35 },
  { min: 731200, rate: 0.37 },
]

// 2024 Federal Tax Brackets (Head of Household)
const FED_TAX_BRACKETS_HOH: TaxBracket[] = [
  { min: 0, rate: 0.10 },
  { min: 16550, rate: 0.12 },
  { min: 63100, rate: 0.22 },
  { min: 100500, rate: 0.24 },
  { min: 191950, rate: 0.32 },
  { min: 243700, rate: 0.35 },
  { min: 609350, rate: 0.37 },
]

function getTaxBrackets(filingStatus: string): TaxBracket[] {
  if (filingStatus.includes('Married Joint')) return FED_TAX_BRACKETS_MFJ
  if (filingStatus.includes('Head')) return FED_TAX_BRACKETS_HOH
  return FED_TAX_BRACKETS_SINGLE
}

// State income tax rates (% of gross income, simplified)
const STATE_TAX_RATES: Record<string, number> = {
  'AL': 0.05, 'AK': 0.0, 'AZ': 0.0555, 'AR': 0.0599, 'CA': 0.093, 'CO': 0.044, 'CT': 0.0699,
  'DE': 0.066, 'FL': 0.0, 'GA': 0.0575, 'HI': 0.108, 'ID': 0.058, 'IL': 0.0495, 'IN': 0.0323,
  'IA': 0.0843, 'KS': 0.0657, 'KY': 0.0575, 'LA': 0.0425, 'ME': 0.085, 'MD': 0.0875, 'MA': 0.05,
  'MI': 0.04, 'MN': 0.0985, 'MS': 0.0500, 'MO': 0.0575, 'MT': 0.06, 'NE': 0.0684, 'NV': 0.0,
  'NH': 0.0, 'NJ': 0.0885, 'NM': 0.059, 'NY': 0.0882, 'NC': 0.0475, 'ND': 0.0, 'OH': 0.0575,
  'OK': 0.0575, 'OR': 0.099, 'PA': 0.0307, 'RI': 0.0675, 'SC': 0.0575, 'SD': 0.0, 'TN': 0.0,
  'TX': 0.0, 'UT': 0.0495, 'VT': 0.0875, 'VA': 0.0575, 'WA': 0.0, 'WV': 0.065, 'WI': 0.0764,
  'WY': 0.0,
}

// State sales tax rates (combined state + local average, %)
const SALES_TAX_RATES: Record<string, number> = {
  'AL': 0.0915, 'AK': 0.0, 'AZ': 0.0805, 'AR': 0.0975, 'CA': 0.0725, 'CO': 0.07, 'CT': 0.0635,
  'DE': 0.0, 'FL': 0.07, 'GA': 0.0735, 'HI': 0.04, 'ID': 0.06, 'IL': 0.0825, 'IN': 0.07,
  'IA': 0.07, 'KS': 0.092, 'KY': 0.06, 'LA': 0.0945, 'ME': 0.055, 'MD': 0.06, 'MA': 0.0625,
  'MI': 0.06, 'MN': 0.0725, 'MS': 0.07, 'MO': 0.0815, 'MT': 0.0, 'NE': 0.07, 'NV': 0.0815,
  'NH': 0.0, 'NJ': 0.0625, 'NM': 0.08475, 'NY': 0.0815, 'NC': 0.07, 'ND': 0.055, 'OH': 0.0755,
  'OK': 0.0915, 'OR': 0.0, 'PA': 0.06, 'RI': 0.07, 'SC': 0.07625, 'SD': 0.07, 'TN': 0.0955,
  'TX': 0.0825, 'UT': 0.071, 'VT': 0.06, 'VA': 0.0575, 'WA': 0.0915, 'WV': 0.06, 'WI': 0.05,
  'WY': 0.04,
}

export function calculateSalesTaxDeduction(monthlyRemaining: number, stateAbbr: string): number {
  if (monthlyRemaining <= 0) return 0
  const salesTaxRate = SALES_TAX_RATES[stateAbbr] || 0
  return Math.round(monthlyRemaining * salesTaxRate * 100) / 100
}

export function calculateFederalTax(taxableIncome: number, filingStatus: string): number {
  if (taxableIncome <= 0) return 0
  const brackets = getTaxBrackets(filingStatus)
  let tax = 0

  for (let i = 0; i < brackets.length; i++) {
    const currentBracketMin = brackets[i].min
    const nextBracketMin = i < brackets.length - 1 ? brackets[i + 1].min : Infinity
    const currentBracketRate = brackets[i].rate

    if (taxableIncome > currentBracketMin) {
      const amountInBracket = Math.min(taxableIncome, nextBracketMin) - currentBracketMin
      tax += amountInBracket * currentBracketRate
    } else {
      break
    }
  }

  return Math.round(tax * 100) / 100
}

export function calculateNetIncome(
  grossIncome: number,
  stateFips: string,
  stateAbbr: string,
  filingStatus: string,
  contributionRate401k: number = 0
): { netIncome: number; federalTax: number; stateTax: number; fica: number; contribution401k: number } {
  if (!grossIncome || !filingStatus) {
    return { netIncome: 0, federalTax: 0, stateTax: 0, fica: 0, contribution401k: 0 }
  }

  // FICA: Social Security 6.2% (capped at $168,600 wage base) + Medicare 1.45%
  const ssTax = Math.round(Math.min(grossIncome, 168600) * 0.062 * 100) / 100
  const medicareTax = Math.round(grossIncome * 0.0145 * 100) / 100
  const fica = Math.round((ssTax + medicareTax) * 100) / 100

  // 401k pre-tax contribution (reduces taxable income)
  const contribution401k = Math.round(grossIncome * contributionRate401k * 100) / 100

  // Taxable income after standard deduction and 401k pre-tax contribution
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus] || STANDARD_DEDUCTIONS['Single']
  const taxableIncome = Math.max(0, grossIncome - standardDeduction - contribution401k)

  // Federal income tax
  const federalTax = calculateFederalTax(taxableIncome, filingStatus)

  // State income tax (most states follow federal AGI, subtract 401k)
  const stateRate = STATE_TAX_RATES[stateAbbr] || 0
  const stateTax = Math.round((grossIncome - contribution401k) * stateRate * 100) / 100

  // Net take-home after all deductions
  const netIncome = Math.round((grossIncome - federalTax - stateTax - fica - contribution401k) * 100) / 100

  return { netIncome, federalTax, stateTax, fica, contribution401k }
}

function parseHourly(val: string | undefined): number | null {
  if (!val) return null
  const trimmed = val.trim()
  if (trimmed === '#' || trimmed === '*' || trimmed === '') return null
  const num = parseFloat(trimmed.replace(/[^0-9.]/g, ''))
  return isNaN(num) ? null : num
}

async function loadMinWageData(): Promise<Map<string, number>> {
  return new Promise((resolve) => {
    Papa.parse('/data/jobs/FED_MIN_WAGE.csv', {
      header: true,
      download: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        const minWageMap = new Map<string, number>()
        results.data
          .filter((row) => row.state && row.state_fips)
          .forEach((row) => {
            const fips = row.state_fips?.trim() || ''
            const wage = parseFloat((row.min_wage || '').replace(/[^0-9.]/g, '')) || 0
            minWageMap.set(fips, wage)
          })
        resolve(minWageMap)
      },
      error: () => resolve(new Map()),
    })
  })
}

export async function loadOewsStateJobs(): Promise<OewsStateResult> {
  return new Promise((resolve) => {
    Papa.parse('/data/jobs/OEWS_STATE_RAW.csv', {
      header: true,
      download: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        const byStateFips = new Map<string, Map<string, OewsJobData>>()
        const titleMap = new Map<string, string>()
        results.data
          .filter((row) => row.state_fips && row.occ_code && row.occ_title && row.occ_code !== '00-0000')
          .forEach((row) => {
            const fips = row.state_fips?.trim() || ''
            const occ_code = row.occ_code?.trim() || ''
            const occ_title = row.occ_title?.trim() || ''
            titleMap.set(occ_code, occ_title)
            if (!byStateFips.has(fips)) byStateFips.set(fips, new Map())
            byStateFips.get(fips)!.set(occ_code, {
              occ_code,
              occ_title,
              hourly_pct10: parseHourly(row.hourly_pct10),
              hourly_pct25: parseHourly(row.hourly_pct25),
              hourly_median: parseHourly(row.hourly_median),
              hourly_pct75: parseHourly(row.hourly_pct75),
              hourly_pct90: parseHourly(row.hourly_pct90),
            })
          })
        const titles: OewsJobTitle[] = Array.from(titleMap.entries())
          .map(([occ_code, occ_title]) => ({ occ_code, occ_title }))
          .sort((a, b) => a.occ_title.localeCompare(b.occ_title))
        resolve({ titles, byStateFips })
      },
      error: () => resolve({ titles: [], byStateFips: new Map() }),
    })
  })
}

export async function loadOewsCountyJobs(): Promise<OewsCountyResult> {
  const [metroResults, nonMetroResults] = await Promise.all([
    new Promise<Papa.ParseResult<Record<string, string>>>((resolve) => {
      Papa.parse('/data/jobs/OEWS_METRO_RAW.csv', {
        header: true,
        download: true,
        complete: resolve,
        error: () => resolve({ data: [], errors: [], meta: {} } as unknown as Papa.ParseResult<Record<string, string>>),
      })
    }),
    new Promise<Papa.ParseResult<Record<string, string>>>((resolve) => {
      Papa.parse('/data/jobs/OEWS_NONMETRO_RAW.csv', {
        header: true,
        download: true,
        complete: resolve,
        error: () => resolve({ data: [], errors: [], meta: {} } as unknown as Papa.ParseResult<Record<string, string>>),
      })
    }),
  ])

  const byMsaCode = new Map<string, Map<string, OewsJobData>>()
  const titleMap = new Map<string, string>()

  const processRows = (rows: Record<string, string>[]) => {
    rows
      .filter((row) => row.msa_code && row.occ_code && row.occ_title && row.occ_code !== '00-0000')
      .forEach((row) => {
        const msa = row.msa_code?.trim() || ''
        const occ_code = row.occ_code?.trim() || ''
        const occ_title = row.occ_title?.trim() || ''
        titleMap.set(occ_code, occ_title)
        if (!byMsaCode.has(msa)) byMsaCode.set(msa, new Map())
        byMsaCode.get(msa)!.set(occ_code, {
          occ_code,
          occ_title,
          hourly_pct10: parseHourly(row.hourly_pct10),
          hourly_pct25: parseHourly(row.hourly_pct25),
          hourly_median: parseHourly(row.hourly_median),
          hourly_pct75: parseHourly(row.hourly_pct75),
          hourly_pct90: parseHourly(row.hourly_pct90),
        })
      })
  }

  processRows(metroResults.data)
  processRows(nonMetroResults.data)

  const titles: OewsJobTitle[] = Array.from(titleMap.entries())
    .map(([occ_code, occ_title]) => ({ occ_code, occ_title }))
    .sort((a, b) => a.occ_title.localeCompare(b.occ_title))
  return { titles, byMsaCode }
}

interface InternetRawData {
  state: string
  state_abbr: string
  county_name: string
  state_fips: string
  county_code: string
  county_lowest_cost: string
  state_average_cost: string
}

interface ElectricRawData {
  state: string
  state_abbr: string
  state_fips: string
  average_monthly_consumption_kwh: string
  average_residential_rate_per_kwh: string
  average_monthly_bill: string
}

interface CarInsuranceRawData {
  state: string
  state_abbr: string
  state_fips: string
  age_group: string
  minimum_coverage: string
  full_coverage: string
}

interface PhoneRawData {
  state: string
  state_abbr: string
  state_fips: string
  provider_name: string
  alternative_provider_name: string
  line_count: string
  monthly_cost: string
  cost_per_line: string
  alternative_monthly_cost: string
  alternative_cost_per_line: string
}

interface AgePricingEntry {
  age: number
  averagePrice: number
  genderRateDiff: number
}

// Age/Gender pricing table - base pricing model
const agePricingTable: AgePricingEntry[] = [
  { age: 16, averagePrice: 457, genderRateDiff: 41 },
  { age: 17, averagePrice: 381, genderRateDiff: 39 },
  { age: 18, averagePrice: 330, genderRateDiff: 31 },
  { age: 19, averagePrice: 230, genderRateDiff: 22 },
  { age: 20, averagePrice: 207, genderRateDiff: 18 },
  { age: 21, averagePrice: 163, genderRateDiff: 13 },
  { age: 22, averagePrice: 151, genderRateDiff: 9 },
  { age: 23, averagePrice: 139, genderRateDiff: 8 },
  { age: 24, averagePrice: 132, genderRateDiff: 6 },
  { age: 25, averagePrice: 119, genderRateDiff: 3 },
  { age: 26, averagePrice: 114, genderRateDiff: 2 },
  { age: 27, averagePrice: 112, genderRateDiff: 2 },
  { age: 28, averagePrice: 110, genderRateDiff: 1 },
  { age: 29, averagePrice: 109, genderRateDiff: 1 },
  { age: 30, averagePrice: 106, genderRateDiff: -1 },
  { age: 35, averagePrice: 103, genderRateDiff: -2 },
  { age: 40, averagePrice: 102, genderRateDiff: -2 },
  { age: 45, averagePrice: 100, genderRateDiff: -2 },
  { age: 50, averagePrice: 97, genderRateDiff: -1 },
  { age: 55, averagePrice: 94, genderRateDiff: 0 },
  { age: 60, averagePrice: 94, genderRateDiff: 0 },
  { age: 65, averagePrice: 98, genderRateDiff: 1 },
  { age: 70, averagePrice: 104, genderRateDiff: 2 },
  { age: 75, averagePrice: 115, genderRateDiff: 5 },
  { age: 80, averagePrice: 127, genderRateDiff: 9 },
  { age: 85, averagePrice: 136, genderRateDiff: 11 },
  { age: 90, averagePrice: 143, genderRateDiff: 12 },
]

async function loadInternetData(): Promise<InternetRawData[]> {
  return new Promise((resolve) => {
    Papa.parse('/data/utilz/TELECOM_INTERNET_RAW.csv', {
      header: true,
      download: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        const data: InternetRawData[] = results.data
          .filter((row) => row.state && row.county_code && row.state_fips)
          .map((row) => ({
            state: row.state.trim(),
            state_abbr: row.state_abbr?.trim() || '',
            county_name: row.county_name?.trim() || '',
            state_fips: row.state_fips?.trim() || '',
            county_code: row.county_code?.trim() || '',
            county_lowest_cost: row.county_lowest_cost?.trim() || '',
            state_average_cost: row.state_average_cost?.trim() || '',
          }))
        resolve(data)
      },
      error: (error: unknown) => {
        console.error('Error loading Internet CSV:', error)
        resolve([])
      },
    })
  })
}

function aggregateInternetByState(internetData: InternetRawData[]): Map<string, { avg: number; min: number; max: number }> {
  const stateMap = new Map<string, { total: number; count: number; min: number; max: number }>()

  internetData.forEach((row) => {
    const cost = parseFloat(row.county_lowest_cost) || 0
    const stateFips = row.state_fips

    if (!stateMap.has(stateFips)) {
      stateMap.set(stateFips, { total: 0, count: 0, min: Infinity, max: -Infinity })
    }

    const current = stateMap.get(stateFips)!
    current.total += cost
    current.count += 1
    current.min = Math.min(current.min, cost)
    current.max = Math.max(current.max, cost)
  })

  // Convert to result map with average, min, max
  const resultMap = new Map<string, { avg: number; min: number; max: number }>()
  stateMap.forEach((value, key) => {
    resultMap.set(key, {
      avg: Math.round((value.total / value.count) * 100) / 100,
      min: Math.round(value.min * 100) / 100,
      max: Math.round(value.max * 100) / 100,
    })
  })

  return resultMap
}

function createCountyInternetMap(internetData: InternetRawData[]): Map<string, number> {
  const countyMap = new Map<string, number>()

  internetData.forEach((row) => {
    const key = `${row.state_fips}-${row.county_code}`
    const cost = parseFloat(row.county_lowest_cost) || 0
    countyMap.set(key, cost)
  })

  return countyMap
}

async function loadElectricData(): Promise<ElectricRawData[]> {
  return new Promise((resolve) => {
    Papa.parse('/data/utilz/ELECTRIC_RAW.csv', {
      header: true,
      download: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        const data: ElectricRawData[] = results.data
          .filter((row) => row.state && row.state_fips)
          .map((row) => ({
            state: row.state.trim(),
            state_abbr: row.state_abbr?.trim() || '',
            state_fips: row.state_fips?.trim() || '',
            average_monthly_consumption_kwh: row.average_monthly_consumption_kwh?.trim() || '',
            average_residential_rate_per_kwh: row.average_residential_rate_per_kwh?.trim() || '',
            average_monthly_bill: row.average_monthly_bill?.trim() || '',
          }))
        resolve(data)
      },
      error: (error: unknown) => {
        console.error('Error loading Electric CSV:', error)
        resolve([])
      },
    })
  })
}

function createElectricMap(electricData: ElectricRawData[]): Map<string, number> {
  const electricMap = new Map<string, number>()

  electricData.forEach((row) => {
    const stateFips = row.state_fips
    const cost = parseFloat(row.average_monthly_bill) || 0
    electricMap.set(stateFips, cost)
  })

  return electricMap
}

async function loadCarInsuranceData(): Promise<CarInsuranceRawData[]> {
  return new Promise((resolve) => {
    Papa.parse('/data/utilz/CAR_INSURANCE_RAW.csv', {
      header: true,
      download: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        const data: CarInsuranceRawData[] = results.data
          .filter((row) => row.state && row.state_fips)
          .map((row) => ({
            state: row.state.trim(),
            state_abbr: row.state_abbr?.trim() || '',
            state_fips: row.state_fips?.trim() || '',
            age_group: row.age_group?.trim() || '',
            minimum_coverage: row.minimum_coverage?.trim() || '',
            full_coverage: row.full_coverage?.trim() || '',
          }))
        resolve(data)
      },
      error: (error: unknown) => {
        console.error('Error loading Car Insurance CSV:', error)
        resolve([])
      },
    })
  })
}

function createCarInsuranceMap(carInsuranceData: CarInsuranceRawData[]): Map<string, number> {
  const carInsuranceMap = new Map<string, number>()

  carInsuranceData.forEach((row) => {
    // For age 25 (default), use minimum_coverage
    if (row.age_group === '25') {
      const stateFips = row.state_fips
      const cost = parseFloat(row.minimum_coverage) || 0
      carInsuranceMap.set(stateFips, cost)
    }
  })

  return carInsuranceMap
}

async function loadPhoneData(): Promise<PhoneRawData[]> {
  return new Promise((resolve) => {
    Papa.parse('/data/utilz/TELECOM_PHONE_RAW.csv', {
      header: true,
      download: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        const data: PhoneRawData[] = results.data
          .filter((row) => row.state && row.state_fips)
          .map((row) => ({
            state: row.state.trim(),
            state_abbr: row.state_abbr?.trim() || '',
            state_fips: row.state_fips?.trim() || '',
            provider_name: row.provider_name?.trim() || '',
            alternative_provider_name: row.alternative_provider_name?.trim() || '',
            line_count: row.line_count?.trim() || '',
            monthly_cost: row.monthly_cost?.trim() || '',
            cost_per_line: row.cost_per_line?.trim() || '',
            alternative_monthly_cost: row.alternative_monthly_cost?.trim() || '',
            alternative_cost_per_line: row.alternative_cost_per_line?.trim() || '',
          }))
        resolve(data)
      },
      error: (error: unknown) => {
        console.error('Error loading Phone CSV:', error)
        resolve([])
      },
    })
  })
}

interface PhoneDataByState {
  byLineCount: Map<number, PhoneRawData>
  default: PhoneRawData | null
}

function createPhoneMap(phoneData: PhoneRawData[]): Map<string, PhoneDataByState> {
  const phoneMap = new Map<string, PhoneDataByState>()

  phoneData.forEach((row) => {
    const stateFips = row.state_fips
    const lineCount = parseInt(row.line_count) || 1

    if (!phoneMap.has(stateFips)) {
      phoneMap.set(stateFips, { byLineCount: new Map(), default: null })
    }

    const stateData = phoneMap.get(stateFips)!
    stateData.byLineCount.set(lineCount, row)

    // Set default as line_count=1
    if (lineCount === 1) {
      stateData.default = row
    }
  })

  return phoneMap
}

function getAgeBucketEntry(age: number | ''): AgePricingEntry {
  if (age === '' || age < 16) return agePricingTable[9] // age 25 default
  if (age > 90) return agePricingTable[agePricingTable.length - 1] // age 90
  
  // Find exact match or closest lower age
  let bestMatch = agePricingTable[9] // default to 25
  for (const entry of agePricingTable) {
    if (entry.age <= age) {
      bestMatch = entry
    } else {
      break
    }
  }
  return bestMatch
}

export function calculateCarInsuranceCost(
  baseStateCost: number,
  userAge: number | '',
  userGender: string
): { calculatedCost: number; adjustmentPercent: number } {
  if (!baseStateCost) return { calculatedCost: 0, adjustmentPercent: 0 }

  const ageBucketEntry = getAgeBucketEntry(userAge)
  const age25Entry = agePricingTable[9] // age 25

  // Calculate age adjustment percentage
  const ageAdjustmentPercent = ((ageBucketEntry.averagePrice - age25Entry.averagePrice) / age25Entry.averagePrice) * 100

  // Apply age adjustment
  let adjustedCost = baseStateCost * (1 + ageAdjustmentPercent / 100)

  // Apply gender adjustment if female (negative rate diff means female pays more)
  if (userGender === 'Female') {
    adjustedCost += ageBucketEntry.genderRateDiff
  }

  const totalAdjustmentPercent = ageAdjustmentPercent + (userGender === 'Female' ? ageBucketEntry.genderRateDiff : 0)

  return {
    calculatedCost: Math.round(adjustedCost * 100) / 100,
    adjustmentPercent: Math.round(totalAdjustmentPercent * 100) / 100,
  }
}

// Map household_type to food CSV column name
function mapHouseholdTypeToFoodColumn(householdType: string): string {
  const mapping: Record<string, string> = {
    '1 Adult, 0 Kids': 'adult_1_children_0',
    '1 Adult, 1 Kid': 'adult_1_children_1',
    '1 Adult, 2 Kids': 'adult_1_children_2',
    '1 Adult, 3 Kids': 'adult_1_children_3',
    '2 Adults (1 Working), 0 Kids': 'adults_2_children_0',
    '2 Adults (1 Working), 1 Kid': 'adults_2_children_1',
    '2 Adults (1 Working), 2 Kids': 'adults_2_children_2',
    '2 Adults (1 Working), 3 Kids': 'adults_2_children_3',
    '2 Adults (Both Working), 0 Kids': 'adults_2_children_0',
    '2 Adults (Both Working), 1 Kid': 'adults_2_children_1',
    '2 Adults (Both Working), 2 Kids': 'adults_2_children_2',
    '2 Adults (Both Working), 3 Kids': 'adults_2_children_3',
  }
  return mapping[householdType] || 'adult_1_children_0'
}

interface FoodDataRow {
  state_fips: string
  [key: string]: string | undefined
}

interface CountyFoodDataRow extends FoodDataRow {
  msa_code: string
}

export async function loadFoodStateData(): Promise<Map<string, Record<string, number>>> {
  return new Promise((resolve) => {
    Papa.parse('/data/food/FOOD_STATE_RAW.csv', {
      header: true,
      download: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        const foodByState = new Map<string, Record<string, number>>()
        results.data
          .filter((row: Record<string, string>) => row.state_fips)
          .forEach((row: Record<string, string>) => {
            const stateFips = row.state_fips?.trim() || ''
            const foodCosts: Record<string, number> = {
              adult_1_children_0: parseFloat(row.adult_1_children_0 || '0') || 0,
              adult_1_children_1: parseFloat(row.adult_1_children_1 || '0') || 0,
              adult_1_children_2: parseFloat(row.adult_1_children_2 || '0') || 0,
              adult_1_children_3: parseFloat(row.adult_1_children_3 || '0') || 0,
              adults_2_children_0: parseFloat(row.adults_2_children_0 || '0') || 0,
              adults_2_children_1: parseFloat(row.adults_2_children_1 || '0') || 0,
              adults_2_children_2: parseFloat(row.adults_2_children_2 || '0') || 0,
              adults_2_children_3: parseFloat(row.adults_2_children_3 || '0') || 0,
            }
            foodByState.set(stateFips, foodCosts)
          })
        resolve(foodByState)
      },
      error: () => resolve(new Map()),
    })
  })
}

export async function loadFoodCountyData(): Promise<Map<string, Record<string, number>>> {
  return new Promise((resolve) => {
    Papa.parse('/data/food/FOOD_COUNTY_RAW.csv', {
      header: true,
      download: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        const foodByMsa = new Map<string, Record<string, number>>()
        results.data
          .filter((row: Record<string, string>) => row.msa_code)
          .forEach((row: Record<string, string>) => {
            const msaCode = row.msa_code?.trim() || ''
            const foodCosts: Record<string, number> = {
              adult_1_children_0: parseFloat(row.adult_1_children_0 || '0') || 0,
              adult_1_children_1: parseFloat(row.adult_1_children_1 || '0') || 0,
              adult_1_children_2: parseFloat(row.adult_1_children_2 || '0') || 0,
              adult_1_children_3: parseFloat(row.adult_1_children_3 || '0') || 0,
              adults_2_children_0: parseFloat(row.adults_2_children_0 || '0') || 0,
              adults_2_children_1: parseFloat(row.adults_2_children_1 || '0') || 0,
              adults_2_children_2: parseFloat(row.adults_2_children_2 || '0') || 0,
              adults_2_children_3: parseFloat(row.adults_2_children_3 || '0') || 0,
            }
            foodByMsa.set(msaCode, foodCosts)
          })
        resolve(foodByMsa)
      },
      error: () => resolve(new Map()),
    })
  })
}

export function getFoodCostByHouseholdType(
  householdType: string,
  foodDataMap: Map<string, Record<string, number>>,
  stateFipsOrMsaCode: string
): number {
  const foodData = foodDataMap.get(stateFipsOrMsaCode)
  if (!foodData) return 0
  const columnName = mapHouseholdTypeToFoodColumn(householdType)
  const yearlyValue = foodData[columnName] || 0
  return Math.round((yearlyValue / 12) * 100) / 100
}

// ─── Housing ──────────────────────────────────────────────────────────────────

const ZORI_DATE_COL = '3/31/2026'

export interface HugFmrRow {
  fmr_0: number
  fmr_1: number
  fmr_2: number
  fmr_3: number
  fmr_4: number
}

function mapHouseholdTypeToFmr(householdType: string): keyof HugFmrRow {
  const map: Record<string, keyof HugFmrRow> = {
    '1 Adult, 0 Kids': 'fmr_0',
    '1 Adult, 1 Kid': 'fmr_1',
    '1 Adult, 2 Kids': 'fmr_2',
    '1 Adult, 3 Kids': 'fmr_3',
    '2 Adults (1 Working), 0 Kids': 'fmr_1',
    '2 Adults (1 Working), 1 Kid': 'fmr_2',
    '2 Adults (1 Working), 2 Kids': 'fmr_3',
    '2 Adults (1 Working), 3 Kids': 'fmr_4',
    '2 Adults (Both Working), 0 Kids': 'fmr_1',
    '2 Adults (Both Working), 1 Kid': 'fmr_2',
    '2 Adults (Both Working), 2 Kids': 'fmr_3',
    '2 Adults (Both Working), 3 Kids': 'fmr_4',
  }
  return map[householdType] || 'fmr_0'
}

export async function loadZoriHousingByState(): Promise<Map<string, number>> {
  return new Promise((resolve) => {
    Papa.parse('/data/home/ZORI_MULTI_COUNTY_RAW.csv', {
      header: true,
      download: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        const totals = new Map<string, { sum: number; count: number }>()
        results.data
          .filter((row) => row.state_fips && row[ZORI_DATE_COL])
          .forEach((row) => {
            const fips = row.state_fips.trim().padStart(2, '0')
            const val = parseFloat(row[ZORI_DATE_COL])
            if (!isNaN(val) && val > 0) {
              const entry = totals.get(fips) || { sum: 0, count: 0 }
              entry.sum += val
              entry.count += 1
              totals.set(fips, entry)
            }
          })
        const avgMap = new Map<string, number>()
        totals.forEach(({ sum, count }, fips) => {
          avgMap.set(fips, Math.round((sum / count) * 100) / 100)
        })
        resolve(avgMap)
      },
      error: () => resolve(new Map()),
    })
  })
}

export async function loadHugFmrData(): Promise<Map<string, HugFmrRow>> {
  return new Promise((resolve) => {
    Papa.parse('/data/home/HUG_FMR_COUNTY_RAW.csv', {
      header: true,
      download: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        const fmrMap = new Map<string, HugFmrRow>()
        results.data
          .filter((row) => row.state_fips && row.county_code)
          .forEach((row) => {
            const fips = row.state_fips.trim().padStart(2, '0')
            const cc = row.county_code.trim().padStart(3, '0')
            const key = `${fips}-${cc}`
            fmrMap.set(key, {
              fmr_0: parseFloat(row.fmr_0 || '0') || 0,
              fmr_1: parseFloat(row.fmr_1 || '0') || 0,
              fmr_2: parseFloat(row.fmr_2 || '0') || 0,
              fmr_3: parseFloat(row.fmr_3 || '0') || 0,
              fmr_4: parseFloat(row.fmr_4 || '0') || 0,
            })
          })
        resolve(fmrMap)
      },
      error: () => resolve(new Map()),
    })
  })
}

export function getHugFmrCost(
  householdType: string,
  fmrMap: Map<string, HugFmrRow>,
  stateFips: string,
  countyCode: string
): number | null {
  const key = `${stateFips.padStart(2, '0')}-${countyCode.padStart(3, '0')}`
  const row = fmrMap.get(key)
  if (!row) return null
  const col = mapHouseholdTypeToFmr(householdType)
  return row[col]
}

export async function loadStateData(): Promise<StateData[]> {
  const [stateResults, internetData, electricData, carInsuranceData, phoneData, minWageMap] = await Promise.all([
    new Promise<Papa.ParseResult<Record<string, string>>>((resolve) => {
      Papa.parse('/Normals/State Normal.csv', {
        header: true,
        download: true,
        complete: resolve,
        error: () => resolve({ data: [], errors: [], meta: {} } as unknown as Papa.ParseResult<Record<string, string>>),
      })
    }),
    loadInternetData(),
    loadElectricData(),
    loadCarInsuranceData(),
    loadPhoneData(),
    loadMinWageData(),
  ])

  const internetByState = aggregateInternetByState(internetData)
  const electricByState = createElectricMap(electricData)
  const carInsuranceByState = createCarInsuranceMap(carInsuranceData)
  const phoneByState = createPhoneMap(phoneData)

  const stateData: StateData[] = stateResults.data
    .filter((row) => row.state && row.state.trim())
    .map((row) => {
      const stateFips = row.state_fips?.trim() || ''
      const iData = internetByState.get(stateFips)
      const baseCost = carInsuranceByState.get(stateFips) || 0
      const phoneInfo = phoneByState.get(stateFips)
      const defaultPhoneData = phoneInfo?.default
      const minWage = minWageMap.get(stateFips) || 7.25

      return {
        state: row.state.trim(),
        state_abbr: row.state_abbr?.trim() || '',
        state_fips: stateFips,
        political: row.political?.trim() || '',
        gross_income: Math.round(minWage * 160 * 100) / 100,
        internet_cost: iData?.avg,
        internet_min: iData?.min,
        internet_max: iData?.max,
        electric_cost: electricByState.get(stateFips),
        car_insurance_base_cost: baseCost,
        car_insurance_cost: baseCost,
        phone_cost: defaultPhoneData ? parseFloat(defaultPhoneData.monthly_cost) || 0 : 0,
        phone_provider: defaultPhoneData?.provider_name,
        phone_alt_provider: defaultPhoneData?.alternative_provider_name,
        phone_alt_cost: defaultPhoneData ? parseFloat(defaultPhoneData.alternative_monthly_cost) || 0 : 0,
      }
    })

  return stateData
}

export async function loadCountyData(): Promise<CountyData[]> {
  const [countyResults, internetData, electricData, carInsuranceData, phoneData, minWageMap] = await Promise.all([
    new Promise<Papa.ParseResult<Record<string, string>>>((resolve) => {
      Papa.parse('/Normals/County Normal.csv', {
        header: true,
        download: true,
        complete: resolve,
        error: () => resolve({ data: [], errors: [], meta: {} } as unknown as Papa.ParseResult<Record<string, string>>),
      })
    }),
    loadInternetData(),
    loadElectricData(),
    loadCarInsuranceData(),
    loadPhoneData(),
    loadMinWageData(),
  ])

  const countyInternetMap = createCountyInternetMap(internetData)
  const electricByState = createElectricMap(electricData)
  const carInsuranceByState = createCarInsuranceMap(carInsuranceData)
  const phoneByState = createPhoneMap(phoneData)

  const countyData: CountyData[] = countyResults.data
    .filter((row) => row.state && row.county_name && row.county_name.trim())
    .map((row) => {
      const stateFips = row.state_fips?.trim() || ''
      const countyCode = row.county_code?.trim() || ''
      const key = `${stateFips}-${countyCode}`
      const baseCost = carInsuranceByState.get(stateFips) || 0
      const phoneInfo = phoneByState.get(stateFips)
      const defaultPhoneData = phoneInfo?.default
      const minWage = minWageMap.get(stateFips) || 7.25

      return {
        state: row.state.trim(),
        state_abbr: row.state_abbr?.trim() || '',
        state_fips: stateFips,
        county_code: countyCode,
        msa_code: row.msa_code?.trim() || '',
        county_name: row.county_name.trim(),
        gross_income: Math.round(minWage * 160 * 100) / 100,
        internet_cost: countyInternetMap.get(key),
        electric_cost: electricByState.get(stateFips),
        car_insurance_base_cost: baseCost,
        car_insurance_cost: baseCost,
        phone_cost: defaultPhoneData ? parseFloat(defaultPhoneData.monthly_cost) || 0 : 0,
        phone_provider: defaultPhoneData?.provider_name,
        phone_alt_provider: defaultPhoneData?.alternative_provider_name,
        phone_alt_cost: defaultPhoneData ? parseFloat(defaultPhoneData.alternative_monthly_cost) || 0 : 0,
      }
    })

  return countyData
}
