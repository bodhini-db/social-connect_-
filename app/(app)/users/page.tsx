import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId } from '@/lib/auth'
import { isFollowing } from '@/lib/db/follows'
import { UserCard } from '@/components/UserCard'
import { Empty } from '@/components/ui/empty'
import type { Profile } from '@/types'

export default async function UsersPage() {
  const supabase = await createClient()
  const currentUserId = await getCurrentUserId()

  // Fetch all users
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // Get following status for each user
  const usersWithFollowStatus: (Profile & { isFollowing: boolean })[] = []
  
  for (const user of users || []) {
    let isFollowingUser = false
    if (currentUserId && currentUserId !== user.id) {
      isFollowingUser = await isFollowing(currentUserId, user.id)
    }
    usersWithFollowStatus.push({ ...user, isFollowing: isFollowingUser })
  }

  return (
    <div className="container max-w-2xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Discover Users</h1>
        <p className="mt-1 text-muted-foreground">
          Find and connect with interesting people
        </p>
      </div>

      <div className="space-y-4">
        {usersWithFollowStatus.length === 0 ? (
          <Empty>
            <Empty.Icon />
            <Empty.Title>No users yet</Empty.Title>
            <Empty.Description>
              Be the first to join SocialConnect!
            </Empty.Description>
          </Empty>
        ) : (
          usersWithFollowStatus.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              currentUserId={currentUserId}
              isFollowing={user.isFollowing}
            />
          ))
        )}
      </div>
    </div>
  )
}
