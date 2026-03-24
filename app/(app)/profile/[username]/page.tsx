import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId } from '@/lib/auth'
import { getProfileByUsername } from '@/lib/db/users'
import { isFollowing } from '@/lib/db/follows'
import { ProfileHeader } from '@/components/ProfileHeader'
import { PostCard } from '@/components/PostCard'
import { Empty } from '@/components/ui/empty'
import type { PostWithAuthor } from '@/types'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const profile = await getProfileByUsername(username)

  if (!profile) {
    notFound()
  }

  const currentUserId = await getCurrentUserId()
  const supabase = await createClient()

  // Check if current user is following this profile
  let isFollowingUser = false
  if (currentUserId && currentUserId !== profile.id) {
    isFollowingUser = await isFollowing(currentUserId, profile.id)
  }

  // Fetch user's posts
  const { data: postsData } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(*)
    `)
    .eq('author_id', profile.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(20)

  // Get likes status for current user
  let posts: PostWithAuthor[] = postsData || []
  if (currentUserId && postsData && postsData.length > 0) {
    const postIds = postsData.map(p => p.id)
    const { data: likes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', currentUserId)
      .in('post_id', postIds)
    
    const likedPostIds = new Set(likes?.map(l => l.post_id) || [])
    posts = postsData.map(post => ({
      ...post,
      is_liked_by_me: likedPostIds.has(post.id),
    }))
  }

  return (
    <div className="container max-w-2xl px-4 py-6">
      <ProfileHeader
        profile={profile}
        currentUserId={currentUserId}
        isFollowing={isFollowingUser}
      />

      {/* User's Posts */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Posts</h2>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Empty>
              <Empty.Icon />
              <Empty.Title>No posts yet</Empty.Title>
              <Empty.Description>
                {currentUserId === profile.id
                  ? "You haven't posted anything yet. Share your first post!"
                  : `${profile.first_name} hasn't posted anything yet.`}
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
    </div>
  )
}
