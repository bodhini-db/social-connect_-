'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LikeButton } from '@/components/LikeButton'
import { MessageCircle, MoreHorizontal, Trash2 } from 'lucide-react'
import type { PostWithAuthor } from '@/types'

interface PostCardProps {
  post: PostWithAuthor
  currentUserId?: string | null
  onDelete?: (postId: string) => void
  showFullContent?: boolean
}

export function PostCard({ post, currentUserId, onDelete, showFullContent = false }: PostCardProps) {
  const isOwnPost = currentUserId === post.author_id

  const getInitials = () => {
    const first = post.author?.first_name?.[0] || ''
    const last = post.author?.last_name?.[0] || ''
    return (first + last).toUpperCase() || post.author?.username?.[0]?.toUpperCase() || '?'
  }

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirm('Are you sure you want to delete this post?')) return
    onDelete(post.id)
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
        <Link href={`/profile/${post.author?.username}`}>
          <Avatar className="h-10 w-10 cursor-pointer transition-opacity hover:opacity-80">
            <AvatarImage src={post.author?.avatar_url || undefined} alt={post.author?.username} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${post.author?.username}`}
                className="font-semibold hover:underline"
              >
                {post.author?.first_name} {post.author?.last_name}
              </Link>
              <Link
                href={`/profile/${post.author?.username}`}
                className="text-sm text-muted-foreground"
              >
                @{post.author?.username}
              </Link>
            </div>
            {isOwnPost && onDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <Link href={`/posts/${post.id}`} className="block">
          <p className={`whitespace-pre-wrap ${showFullContent ? '' : 'line-clamp-6'}`}>
            {post.content}
          </p>
        </Link>
        {post.image_url && (
          <div className="relative mt-3 aspect-video overflow-hidden rounded-lg bg-muted">
            <Image
              src={post.image_url}
              alt="Post image"
              fill
              className="object-cover"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-4 border-t pt-3">
        <LikeButton
          postId={post.id}
          initialLiked={post.is_liked_by_me || false}
          initialCount={post.like_count}
          isAuthenticated={!!currentUserId}
        />
        <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground">
          <Link href={`/posts/${post.id}`}>
            <MessageCircle className="h-4 w-4" />
            <span>{post.comment_count}</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
