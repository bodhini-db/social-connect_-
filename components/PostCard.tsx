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
import { MessageCircle, MoreHorizontal, Trash2, Heart, Share2 } from 'lucide-react'
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
    <Card className="group border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
        <Link href={`/profile/${post.author?.username}`} className="group/avatar">
          <Avatar className="h-12 w-12 cursor-pointer ring-2 ring-transparent transition-all duration-300 group-hover/avatar:ring-primary/20 group-hover/avatar:scale-105">
            <AvatarImage src={post.author?.avatar_url || undefined} alt={post.author?.username} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-1 flex-col min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Link
                href={`/profile/${post.author?.username}`}
                className="font-semibold hover:text-primary transition-colors truncate"
              >
                {post.author?.first_name} {post.author?.last_name}
              </Link>
              <Link
                href={`/profile/${post.author?.username}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors truncate"
              >
                @{post.author?.username}
              </Link>
            </div>
            {isOwnPost && onDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-sm bg-background/95">
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

      <CardContent className="pb-4">
        <Link href={`/posts/${post.id}`} className="block group/content">
          <p className={`whitespace-pre-wrap text-foreground/90 leading-relaxed ${showFullContent ? '' : 'line-clamp-6'} group-hover/content:text-foreground transition-colors`}>
            {post.content}
          </p>
        </Link>
        {post.image_url && (
          <div className="relative mt-4 aspect-video overflow-hidden rounded-xl bg-muted/50 shadow-inner">
            <Image
              src={post.image_url}
              alt="Post image"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 border-t border-border/40 pt-4">
        <LikeButton
          postId={post.id}
          initialLiked={post.is_liked_by_me || false}
          initialCount={post.like_count}
          isAuthenticated={!!currentUserId}
        />
        <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
          <Link href={`/posts/${post.id}`}>
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{post.comment_count}</span>
            <span className="sm:hidden">{post.comment_count > 0 ? post.comment_count : ''}</span>
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors ml-auto">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
