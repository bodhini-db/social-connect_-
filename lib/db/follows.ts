import { createClient } from '@/lib/supabase/server'
import type { Follow } from '@/types'

export async function followUser(followerId: string, followingId: string): Promise<Follow> {
  const supabase = await createClient()
  
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself')
  }
  
  const { data, error } = await supabase
    .from('follows')
    .insert({
      follower_id: followerId,
      following_id: followingId,
    })
    .select()
    .single()
  
  if (error) {
    if (error.code === '23505') {
      throw new Error('Already following')
    }
    throw error
  }
  return data
}

export async function unfollowUser(followerId: string, followingId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
  
  if (error) throw error
  return true
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single()
  
  return !!data
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)
  
  return data?.map(f => f.following_id) || []
}
