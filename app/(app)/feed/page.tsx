import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getCurrentUserId } from '@/lib/auth'
import { PostComposer } from '@/components/PostComposer'
import { PostCard } from '@/components/PostCard'
import { Empty } from '@/components/ui/empty'
import { Sparkles, TrendingUp, Users } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-2xl px-4 py-6">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Your Feed
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            What's happening
          </h1>
          <p className="mt-2 text-muted-foreground">
            Stay connected with posts from people you follow
          </p>
        </div>

        {/* Post Composer */}
        {currentUser && (
          <div className="mb-8">
            <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <PostComposer user={currentUser} />
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-8 text-center shadow-lg">
              <Empty>
                <Empty.Icon className="h-12 w-12 text-muted-foreground/50" />
                <Empty.Title className="text-xl font-semibold">No posts yet</Empty.Title>
                <Empty.Description className="text-muted-foreground max-w-sm mx-auto">
                  Be the first to share something! Or follow some users to see their posts here.
                </Empty.Description>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm">
                    <TrendingUp className="h-4 w-4" />
                    Discover trending posts
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent-foreground text-sm">
                    <Users className="h-4 w-4" />
                    Find people to follow
                  </div>
                </div>
              </Empty>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="group">
                <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <PostCard
                    post={post}
                    currentUserId={currentUserId}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
