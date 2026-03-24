'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { UserPlus, UserMinus } from 'lucide-react'
import { toast } from 'sonner'

interface FollowButtonProps {
  userId: string
  initialIsFollowing: boolean
  size?: 'default' | 'sm' | 'lg'
  showIcon?: boolean
}

export function FollowButton({
  userId,
  initialIsFollowing,
  size = 'default',
  showIcon = false,
}: FollowButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)

  const handleFollow = async () => {
    // Optimistic update
    const newIsFollowing = !isFollowing
    setIsFollowing(newIsFollowing)

    startTransition(async () => {
      try {
        const response = await fetch(`/api/users/${userId}/follow`, {
          method: newIsFollowing ? 'POST' : 'DELETE',
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to update follow status')
        }

        router.refresh()
        toast.success(newIsFollowing ? 'Following!' : 'Unfollowed')
      } catch (error) {
        // Revert on error
        setIsFollowing(!newIsFollowing)
        toast.error(error instanceof Error ? error.message : 'Something went wrong')
      }
    })
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size={size}
      onClick={handleFollow}
      disabled={isPending}
      className="min-w-[100px]"
    >
      {isPending ? (
        <Spinner className="h-4 w-4" />
      ) : (
        <>
          {showIcon && (
            isFollowing ? (
              <UserMinus className="mr-2 h-4 w-4" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )
          )}
          {isFollowing ? 'Following' : 'Follow'}
        </>
      )}
    </Button>
  )
}
