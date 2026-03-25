'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/FollowButton'
import { MapPin, Link as LinkIcon, Calendar, Settings } from 'lucide-react'
import { format } from 'date-fns'
import type { Profile } from '@/types'

interface ProfileHeaderProps {
  profile: Profile
  currentUserId?: string | null
  isFollowing?: boolean
}

export function ProfileHeader({ profile, currentUserId, isFollowing = false }: ProfileHeaderProps) {
  const isOwnProfile = currentUserId === profile.id

  const getInitials = () => {
    const first = profile.first_name?.[0] || ''
    const last = profile.last_name?.[0] || ''
    return (first + last).toUpperCase() || profile.username[0].toUpperCase()
  }

  return (
    <div className="space-y-4">
      {/* Cover area */}
      <div className="h-32 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 sm:h-48" />

      {/* Profile info */}
      <div className="relative px-4">
        {/* Avatar */}
        <div className="absolute -top-16 sm:-top-20">
          <Avatar className="h-24 w-24 border-4 border-background sm:h-32 sm:w-32">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
            <AvatarFallback className="bg-primary text-2xl text-primary-foreground sm:text-3xl">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end pb-4">
          {isOwnProfile ? (
            <Button variant="outline" asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          ) : currentUserId ? (
            <FollowButton
              userId={profile.id}
              initialIsFollowing={isFollowing}
              showIcon
            />
          ) : (
            <Button asChild>
              <Link href="/login">Follow</Link>
            </Button>
          )}
        </div>

        {/* Name and username */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold">
            {profile.first_name} {profile.last_name}
          </h1>
          <p className="text-muted-foreground">@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-3 whitespace-pre-wrap">{profile.bio}</p>
        )}

        {/* Meta info */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {profile.location}
            </span>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <LinkIcon className="h-4 w-4" />
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
          </span>
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-4">
          <Link href={`/profile/${profile.username}`} className="hover:underline">
            <strong>{profile.posts_count}</strong>{' '}
            <span className="text-muted-foreground">posts</span>
          </Link>
          <button className="hover:underline">
            <strong>{profile.followers_count}</strong>{' '}
            <span className="text-muted-foreground">followers</span>
          </button>
          <button className="hover:underline">
            <strong>{profile.following_count}</strong>{' '}
            <span className="text-muted-foreground">following</span>
          </button>
        </div>
      </div>
    </div>
  )
}
