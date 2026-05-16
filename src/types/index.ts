export interface StateData {
  state: string
  state_abbr: string
  state_fips: string
  political: string
  gross_income: number
  internet_cost?: number
  internet_min?: number
  internet_max?: number
  electric_cost?: number
  car_insurance_cost?: number
  car_insurance_base_cost?: number
  phone_cost?: number
  phone_provider?: string
  phone_alt_provider?: string
  phone_alt_cost?: number
  food_cost?: number
}

export interface CountyData {
  state: string
  state_abbr: string
  state_fips: string
  county_code: string
  msa_code: string
  county_name: string
  gross_income: number
  internet_cost?: number
  electric_cost?: number
  car_insurance_cost?: number
  car_insurance_base_cost?: number
  phone_cost?: number
  phone_provider?: string
  phone_alt_provider?: string
  phone_alt_cost?: number
  food_cost?: number
}

export interface OewsJobData {
  occ_code: string
  occ_title: string
  hourly_pct10: number | null
  hourly_pct25: number | null
  hourly_median: number | null
  hourly_pct75: number | null
  hourly_pct90: number | null
}

export type OewsJobTitle = { occ_code: string; occ_title: string }
