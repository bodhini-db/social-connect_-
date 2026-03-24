'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { FollowButton } from '@/components/FollowButton'
import type { Profile } from '@/types'

interface UserCardProps {
  user: Profile
  currentUserId?: string | null
  isFollowing?: boolean
  showBio?: boolean
}

export function UserCard({ user, currentUserId, isFollowing = false, showBio = true }: UserCardProps) {
  const isOwnProfile = currentUserId === user.id

  const getInitials = () => {
    const first = user.first_name?.[0] || ''
    const last = user.last_name?.[0] || ''
    return (first + last).toUpperCase() || user.username[0].toUpperCase()
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Link href={`/profile/${user.username}`}>
            <Avatar className="h-12 w-12 cursor-pointer transition-opacity hover:opacity-80">
              <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/profile/${user.username}`}
                  className="block truncate font-semibold hover:underline"
                >
                  {user.first_name} {user.last_name}
                </Link>
                <Link
                  href={`/profile/${user.username}`}
                  className="block truncate text-sm text-muted-foreground"
                >
                  @{user.username}
                </Link>
              </div>
              {!isOwnProfile && currentUserId && (
                <FollowButton
                  userId={user.id}
                  initialIsFollowing={isFollowing}
                  size="sm"
                />
              )}
            </div>
            {showBio && user.bio && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {user.bio}
              </p>
            )}
            <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
              <span>
                <strong className="text-foreground">{user.posts_count}</strong> posts
              </span>
              <span>
                <strong className="text-foreground">{user.followers_count}</strong> followers
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
