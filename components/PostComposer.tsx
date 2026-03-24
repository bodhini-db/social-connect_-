'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ImageUpload'
import { Spinner } from '@/components/ui/spinner'
import { ImagePlus, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile } from '@/types'

interface PostComposerProps {
  user: Profile
  onPostCreated?: () => void
}

const MAX_CHARS = 280

export function PostComposer({ user, onPostCreated }: PostComposerProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const charsRemaining = MAX_CHARS - content.length
  const isOverLimit = charsRemaining < 0

  const getInitials = () => {
    const first = user.first_name?.[0] || ''
    const last = user.last_name?.[0] || ''
    return (first + last).toUpperCase() || user.username[0].toUpperCase()
  }

  const handleSubmit = async () => {
    if (!content.trim() || isOverLimit || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          image_url: imageUrl,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create post')
      }

      setContent('')
      setImageUrl(null)
      setShowImageUpload(false)
      toast.success('Post created!')
      
      if (onPostCreated) {
        onPostCreated()
      }
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUploaded = (url: string) => {
    setImageUrl(url)
    setShowImageUpload(false)
  }

  const removeImage = () => {
    setImageUrl(null)
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border-0 p-0 text-lg focus-visible:ring-0"
            />
            {imageUrl && (
              <div className="relative mt-3">
                <img
                  src={imageUrl}
                  alt="Upload preview"
                  className="max-h-64 rounded-lg object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {showImageUpload && !imageUrl && (
              <div className="mt-3">
                <ImageUpload
                  bucket="post-images"
                  onUploaded={handleImageUploaded}
                  onCancel={() => setShowImageUpload(false)}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between border-t pt-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowImageUpload(!showImageUpload)}
            disabled={!!imageUrl}
            className="text-primary"
          >
            <ImagePlus className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
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
            onClick={handleSubmit}
            disabled={!content.trim() || isOverLimit || isSubmitting}
            className="min-w-[80px]"
          >
            {isSubmitting ? <Spinner className="h-4 w-4" /> : 'Post'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
