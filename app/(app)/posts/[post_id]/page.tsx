import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getCurrentUserId } from '@/lib/auth'
import { getPostById } from '@/lib/db/posts'
import { getCommentsByPost } from '@/lib/db/comments'
import { PostCard } from '@/components/PostCard'
import { CommentSection } from '@/components/CommentSection'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface PostDetailPageProps {
  params: Promise<{ post_id: string }>
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { post_id } = await params
  const currentUserId = await getCurrentUserId()
  const currentUser = await getCurrentUser()

  const post = await getPostById(post_id, currentUserId)

  if (!post) {
    notFound()
  }

  const { data: comments } = await getCommentsByPost(post_id)

  return (
    <div className="container max-w-2xl px-4 py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/feed">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to feed
          </Link>
        </Button>
      </div>

      <PostCard
        post={post}
        currentUserId={currentUserId}
        showFullContent
      />

      <div className="mt-6">
        <CommentSection
          postId={post_id}
          comments={comments}
          currentUser={currentUser}
        />
      </div>
    </div>
  )
}
