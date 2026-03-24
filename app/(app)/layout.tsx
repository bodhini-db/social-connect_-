import { Navbar } from '@/components/Navbar'
import { getCurrentUser } from '@/lib/auth'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main>{children}</main>
    </div>
  )
}
