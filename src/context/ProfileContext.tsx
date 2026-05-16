import React, { useState } from 'react'
import { ProfileContext, type ProfileData } from '@/context/ProfileContextDef'

const defaultProfile: ProfileData = {
  age: '',
  sex: '',
  filing_status: '',
  household_type: '',
  contribution_401k: 0,
}

function getInitialProfile(): ProfileData {
  try {
    const stored = localStorage.getItem('costOfLivingProfile')
    return stored ? JSON.parse(stored) : defaultProfile
  } catch (e) {
    console.error('Failed to parse stored profile:', e)
    return defaultProfile
  }
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(getInitialProfile)

  const updateProfile = (newProfile: ProfileData) => {
    setProfile(newProfile)
    localStorage.setItem('costOfLivingProfile', JSON.stringify(newProfile))
  }

  const clearProfile = () => {
    setProfile(defaultProfile)
    localStorage.removeItem('costOfLivingProfile')
  }

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export type { ProfileData }
