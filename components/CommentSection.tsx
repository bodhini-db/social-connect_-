'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { CommentWithAuthor, Profile } from '@/types'

interface CommentSectionProps {
  postId: string
  comments: CommentWithAuthor[]
  currentUser: Profile | null
}

const MAX_CHARS = 280

export function CommentSection({ postId, comments: initialComments, currentUser }: CommentSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState(initialComments)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const charsRemaining = MAX_CHARS - content.length
  const isOverLimit = charsRemaining < 0

  const getInitials = (author: CommentWithAuthor['author']) => {
    const first = author?.first_name?.[0] || ''
    const last = author?.last_name?.[0] || ''
    return (first + last).toUpperCase() || author?.username?.[0]?.toUpperCase() || '?'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isOverLimit || isSubmitting || !currentUser) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to post comment')
      }

      const newComment = await response.json()
      setComments(prev => [...prev, { ...newComment, author: currentUser }])
      setContent('')
      toast.success('Comment posted!')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return

    setDeletingId(commentId)
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete comment')
      }

      setComments(prev => prev.filter(c => c.id !== commentId))
      toast.success('Comment deleted')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete comment')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Comments ({comments.length})</h3>

      {/* Comment form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatar_url || undefined} alt={currentUser.username} />
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {getInitials(currentUser)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Write a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    charsRemaining < 20
                      ? charsRemaining < 0
                        ? 'text-destructive'
                        : 'text-yellow-500'
                      : 'text-muted-foreground'
                  }`}
                >
                  {charsRemaining}
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!content.trim() || isOverLimit || isSubmitting}
                >
                  {isSubmitting ? <Spinner className="h-4 w-4" /> : 'Comment'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>{' '}
          to leave a comment.
        </p>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Link href={`/profile/${comment.author?.username}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author?.avatar_url || undefined} alt={comment.author?.username} />
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    {getInitials(comment.author)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/${comment.author?.username}`}
                      className="text-sm font-semibold hover:underline"
                    >
                      {comment.author?.first_name} {comment.author?.last_name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {currentUser?.id === comment.author_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                    >
                      {deletingId === comment.id ? (
                        <Spinner className="h-3 w-3" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
                <p className="mt-1 text-sm">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
