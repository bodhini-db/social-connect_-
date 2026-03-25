import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { EditProfileForm } from '@/components/EditProfileForm'
import { SettingsPanel } from '@/components/SettingsPanel'

export default async function SettingsPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/login?redirect=/settings')
  }

  return (
    <div className="container mx-auto grid max-w-4xl gap-6 px-4 py-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">More personal settings than the profile edit page.</p>
      </div>

      <div>
        <EditProfileForm profile={currentUser} />
      </div>

      <div>
        <SettingsPanel profile={currentUser} />
      </div>
    </div>
  )
}
