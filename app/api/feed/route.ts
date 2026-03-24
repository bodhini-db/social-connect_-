import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId } from '@/lib/auth'
import { getFollowingIds } from '@/lib/db/follows'
import { paginationSchema } from '@/lib/validation'
import type { PostWithAuthor, FeedPost } from '@/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const result = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    
    const { page, limit } = result.success ? result.data : { page: 1, limit: 20 }
    const offset = (page - 1) * limit
    
    const supabase = await createClient()
    const currentUserId = await getCurrentUserId()
    
    // Get following IDs if user is logged in
    let followingIds: string[] = []
    if (currentUserId) {
      followingIds = await getFollowingIds(currentUserId)
    }
    
    // Fetch all active posts
    const { data: posts, error, count } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(*)
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    
    // Get likes status for current user
    let postsWithLikes: PostWithAuthor[] = posts || []
    if (currentUserId && posts && posts.length > 0) {
      const postIds = posts.map(p => p.id)
      const { data: likes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', currentUserId)
        .in('post_id', postIds)
      
      const likedPostIds = new Set(likes?.map(l => l.post_id) || [])
      postsWithLikes = posts.map(post => ({
        ...post,
        is_liked_by_me: likedPostIds.has(post.id),
      }))
    }
    
    // Mark posts from followed users and sort
    const feedPosts: FeedPost[] = postsWithLikes.map(post => ({
      ...post,
      is_from_following: followingIds.includes(post.author_id),
    }))
    
    // Sort: followed users first, then by date
    feedPosts.sort((a, b) => {
      if (a.is_from_following && !b.is_from_following) return -1
      if (!a.is_from_following && b.is_from_following) return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    
    return NextResponse.json({
      data: feedPosts,
      page,
      limit,
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    })
  } catch (error) {
    console.error('Get feed error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
