import { createClient } from '@/lib/supabase/server'
import type { Comment, CommentWithAuthor, CreateCommentInput, PaginatedResponse } from '@/types'

export async function createComment(postId: string, authorId: string, input: CreateCommentInput): Promise<Comment> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: authorId,
      content: input.content,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getCommentsByPost(postId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<CommentWithAuthor>> {
  const supabase = await createClient()
  
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!comments_author_id_fkey(*)
    `, { count: 'exact' })
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)
  
  if (error) throw error
  
  return {
    data: data || [],
    page,
    limit,
    total: count || 0,
    hasMore: (count || 0) > offset + limit,
  }
}

export async function deleteComment(commentId: string, authorId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('author_id', authorId)
  
  if (error) throw error
  return true
}

export async function getCommentById(commentId: string): Promise<Comment | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('id', commentId)
    .single()
  
  if (error) return null
  return data
}
