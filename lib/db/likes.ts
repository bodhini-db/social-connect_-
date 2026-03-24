import { createClient } from '@/lib/supabase/server'
import type { Like } from '@/types'

export async function likePost(postId: string, userId: string): Promise<Like> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('likes')
    .insert({
      post_id: postId,
      user_id: userId,
    })
    .select()
    .single()
  
  if (error) {
    if (error.code === '23505') {
      throw new Error('Already liked')
    }
    throw error
  }
  return data
}

export async function unlikePost(postId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)
  
  if (error) throw error
  return true
}

export async function hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()
  
  return !!data
}
