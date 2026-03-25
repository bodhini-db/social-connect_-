'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import type { Profile } from '@/types'

interface SettingsPanelProps {
  profile: Profile
}

export function SettingsPanel({ profile }: SettingsPanelProps) {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="rounded-xl border border-border/40 bg-card/70 p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Account Settings</h2>
      <p className="text-sm text-muted-foreground mb-4">Customize your account preferences and privacy behavior.</p>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm">Email notifications</p>
        <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm">Dark mode preference</p>
        <Switch checked={darkMode} onCheckedChange={setDarkMode} />
      </div>

      <div className="mb-4">
        <p className="text-sm mb-2">Profile visibility (coming soon)</p>
        <p className="text-xs text-muted-foreground">This section can eventually include privacy options like private account, blocked users, and link sharing controls.</p>
      </div>

      <Button asChild>
        <Link href="/profile/edit">Go to profile edit</Link>
      </Button>
    </div>
  )
}
