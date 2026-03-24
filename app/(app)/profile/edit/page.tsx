import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { EditProfileForm } from '@/components/EditProfileForm'

export default async function EditProfilePage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/login?redirect=/profile/edit')
  }

  return (
    <div className="container max-w-2xl px-4 py-6">
      <EditProfileForm profile={currentUser} />
    </div>
  )
}
