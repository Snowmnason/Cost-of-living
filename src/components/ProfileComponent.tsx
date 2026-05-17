import { useState, useEffect } from 'react'
import type { ProfileData } from '@/context/ProfileContextDef'
import { useProfile } from '@/hooks/useProfile'

export default function ProfileComponent() {
  const { profile, updateProfile } = useProfile()
  const [formData, setFormData] = useState<ProfileData>(profile)
  const [saved, setSaved] = useState(false)

  const handleChange = (field: keyof ProfileData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    updateProfile(formData)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 2500)
      return () => clearTimeout(timer)
    }
  }, [saved])

  return (
    <div className="w-full p-8">
      <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--foreground)' }}>Your Profile</h2>

      <div className="space-y-4">
        {/* Age */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Age</label>
          <input
            type="number"
            min="18"
            max="120"
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value ? parseInt(e.target.value) : '')}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--muted)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              '--tw-ring-color': 'var(--accent)',
            } as React.CSSProperties}
            placeholder="Enter your age"
          />
        </div>

        {/* Sex */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
            Sex <span className="opacity-60">*Used for car insurance calculations</span>
          </label>
          <select
            value={formData.sex}
            onChange={(e) => handleChange('sex', e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--muted)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <option value="">Select sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Filing Status */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Filing Status</label>
          <select
            value={formData.filing_status}
            onChange={(e) => handleChange('filing_status', e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{
              backgroundColor: 'var(--muted)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <option value="">Select filing status</option>
            <option value="Single">Single</option>
            <option value="Married Joint">Married Filing Jointly</option>
            <option value="Married Separate">Married Filing Separately</option>
            <option value="Head of Household">Head of Household</option>
            <option value="Qualifying Widow">Qualifying Widow(er)</option>
          </select>
        </div>

        {/* Household Type */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Household Type</label>
          <select
            value={formData.household_type}
            onChange={(e) => handleChange('household_type', e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{
              backgroundColor: 'var(--muted)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <option value="">Select household type</option>
            <option value="1-adult-0-kids">1 Adult, 0 Kids</option>
            <option value="1-adult-1-kid">1 Adult, 1 Kid</option>
            <option value="1-adult-2-kids">1 Adult, 2 Kids</option>
            <option value="1-adult-3-kids">1 Adult, 3 Kids</option>
            <option value="2-adults-1-working-0-kids">2 Adults (1 Working), 0 Kids</option>
            <option value="2-adults-1-working-1-kid">2 Adults (1 Working), 1 Kid</option>
            <option value="2-adults-1-working-2-kids">2 Adults (1 Working), 2 Kids</option>
            <option value="2-adults-1-working-3-kids">2 Adults (1 Working), 3 Kids</option>
            <option value="2-adults-2-working-0-kids">2 Adults (Both Working), 0 Kids</option>
            <option value="2-adults-2-working-1-kid">2 Adults (Both Working), 1 Kid</option>
            <option value="2-adults-2-working-2-kids">2 Adults (Both Working), 2 Kids</option>
            <option value="2-adults-2-working-3-kids">2 Adults (Both Working), 3 Kids</option>
          </select>
        </div>

        {/* 401k Contribution */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
            401k Contribution <span className="opacity-60">*Pre-tax, reduces taxable income</span>
          </label>
          <div className="flex gap-2">
            {[0, 6, 10, 15].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => handleChange('contribution_401k', pct)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: formData.contribution_401k === pct ? 'var(--accent)' : 'var(--muted)',
                  color: formData.contribution_401k === pct ? 'white' : 'var(--muted-foreground)',
                  border: `1px solid ${formData.contribution_401k === pct ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-5 w-full px-4 py-2.5 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
        style={{ backgroundColor: 'var(--accent)', color: 'white' }}
      >
        Save Profile
      </button>

      {saved && (
        <div className="mt-3 p-3 rounded-lg text-sm font-medium text-center transition-opacity duration-300" style={{ backgroundColor: '#10b981', color: 'white' }}>
          ✓ Profile saved successfully
        </div>
      )}
    </div>
  )
}
