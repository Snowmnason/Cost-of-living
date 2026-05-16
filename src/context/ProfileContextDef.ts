import { createContext } from 'react'

export interface ProfileData {
  age: number | ''
  sex: string
  filing_status: string
  household_type: string
  contribution_401k: number
}

export interface ProfileContextType {
  profile: ProfileData
  updateProfile: (profile: ProfileData) => void
  clearProfile: () => void
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined)
