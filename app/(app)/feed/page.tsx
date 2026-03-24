import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getCurrentUserId } from '@/lib/auth'
import { PostComposer } from '@/components/PostComposer'
import { PostCard } from '@/components/PostCard'
import { Empty } from '@/components/ui/empty'
import type { PostWithAuthor } from '@/types'

async function getFeedPosts(currentUserId: string | null) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/feed`, {
    cache: 'no-store',
  })
  
  if (!response.ok) {
    return { data: [] as PostWithAuthor[], hasMore: false }
  }
  
  return response.json()
}

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login?redirect=/feed')
  }

  const currentUser = await getCurrentUser()
  const currentUserId = await getCurrentUserId()

  // Fetch feed posts directly from the database for SSR
  const { data: feedData } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(20)

  // Get likes status for current user
  let posts: PostWithAuthor[] = feedData || []
  if (currentUserId && feedData && feedData.length > 0) {
    const postIds = feedData.map(p => p.id)
    const { data: likes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', currentUserId)
      .in('post_id', postIds)
    
    const likedPostIds = new Set(likes?.map(l => l.post_id) || [])
    posts = feedData.map(post => ({
      ...post,
      is_liked_by_me: likedPostIds.has(post.id),
    }))
  }

  return (
    <div className="container max-w-2xl px-4 py-6">
      <h1 className="sr-only">Feed</h1>

      {/* Post Composer */}
      {currentUser && (
        <div className="mb-6">
          <PostComposer user={currentUser} />
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Empty>
            <Empty.Icon />
            <Empty.Title>No posts yet</Empty.Title>
            <Empty.Description>
              Be the first to share something! Or follow some users to see their posts here.
            </Empty.Description>
          </Empty>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  )
}
