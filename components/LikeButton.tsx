'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  postId: string
  initialLiked: boolean
  initialCount: number
  isAuthenticated: boolean
}

export function LikeButton({ postId, initialLiked, initialCount, isAuthenticated }: LikeButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Optimistic update
    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setCount(prev => newIsLiked ? prev + 1 : prev - 1)

    startTransition(async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/like`, {
          method: newIsLiked ? 'POST' : 'DELETE',
        })

        if (!response.ok) {
          // Revert on error
          setIsLiked(!newIsLiked)
          setCount(prev => newIsLiked ? prev - 1 : prev + 1)
        }
      } catch {
        // Revert on error
        setIsLiked(!newIsLiked)
        setCount(prev => newIsLiked ? prev - 1 : prev + 1)
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isPending}
      className={cn(
        'gap-2 transition-colors',
        isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
      )}
    >
      <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
      <span>{count}</span>
    </Button>
  )
}
