import { createClient } from '@/lib/supabase/server'
import type { Post, PostWithAuthor, CreatePostInput, UpdatePostInput, PaginatedResponse } from '@/types'

export async function createPost(authorId: string, input: CreatePostInput): Promise<Post> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content: input.content,
      author_id: authorId,
      image_url: input.image_url || null,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getPostById(postId: string, currentUserId?: string | null): Promise<PostWithAuthor | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(*)
    `)
    .eq('id', postId)
    .eq('is_active', true)
    .single()
  
  if (error) return null
  
  // Check if current user has liked the post
  let isLikedByMe = false
  if (currentUserId) {
    const { data: like } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', currentUserId)
      .single()
    isLikedByMe = !!like
  }
  
  return {
    ...data,
    is_liked_by_me: isLikedByMe,
  }
}

export async function getAllPosts(page: number = 1, limit: number = 20, currentUserId?: string | null): Promise<PaginatedResponse<PostWithAuthor>> {
  const supabase = await createClient()
  
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabase
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
  let postsWithLikes = data || []
  if (currentUserId && data && data.length > 0) {
    const postIds = data.map(p => p.id)
    const { data: likes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', currentUserId)
      .in('post_id', postIds)
    
    const likedPostIds = new Set(likes?.map(l => l.post_id) || [])
    postsWithLikes = data.map(post => ({
      ...post,
      is_liked_by_me: likedPostIds.has(post.id),
    }))
  }
  
  return {
    data: postsWithLikes,
    page,
    limit,
    total: count || 0,
    hasMore: (count || 0) > offset + limit,
  }
}

export async function getPostsByUser(userId: string, page: number = 1, limit: number = 20, currentUserId?: string | null): Promise<PaginatedResponse<PostWithAuthor>> {
  const supabase = await createClient()
  
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(*)
    `, { count: 'exact' })
    .eq('author_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) throw error
  
  // Get likes status for current user
  let postsWithLikes = data || []
  if (currentUserId && data && data.length > 0) {
    const postIds = data.map(p => p.id)
    const { data: likes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', currentUserId)
      .in('post_id', postIds)
    
    const likedPostIds = new Set(likes?.map(l => l.post_id) || [])
    postsWithLikes = data.map(post => ({
      ...post,
      is_liked_by_me: likedPostIds.has(post.id),
    }))
  }
  
  return {
    data: postsWithLikes,
    page,
    limit,
    total: count || 0,
    hasMore: (count || 0) > offset + limit,
  }
}

export async function updatePost(postId: string, authorId: string, input: UpdatePostInput): Promise<Post> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('posts')
    .update({ content: input.content })
    .eq('id', postId)
    .eq('author_id', authorId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deletePost(postId: string, authorId: string): Promise<boolean> {
  const supabase = await createClient()
  
  // Soft delete
  const { error } = await supabase
    .from('posts')
    .update({ is_active: false })
    .eq('id', postId)
    .eq('author_id', authorId)
  
  if (error) throw error
  return true
}
