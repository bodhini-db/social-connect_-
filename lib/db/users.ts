import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Profile, ProfileUpdate, PaginatedResponse } from '@/types'

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  
  if (error) return null
  return data
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const supabase = await createAdminClient()
  
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()
  
  return !!data
}

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getAllUsers(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Profile>> {
  const supabase = await createClient()
  
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
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

export async function getFollowers(userId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Profile>> {
  const supabase = await createClient()
  
  const offset = (page - 1) * limit
  
  // Get follower IDs
  const { data: follows, error: followsError, count } = await supabase
    .from('follows')
    .select('follower_id', { count: 'exact' })
    .eq('following_id', userId)
    .range(offset, offset + limit - 1)
  
  if (followsError) throw followsError
  
  if (!follows || follows.length === 0) {
    return { data: [], page, limit, total: 0, hasMore: false }
  }
  
  const followerIds = follows.map(f => f.follower_id)
  
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', followerIds)
  
  if (profilesError) throw profilesError
  
  return {
    data: profiles || [],
    page,
    limit,
    total: count || 0,
    hasMore: (count || 0) > offset + limit,
  }
}

export async function getFollowing(userId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Profile>> {
  const supabase = await createClient()
  
  const offset = (page - 1) * limit
  
  // Get following IDs
  const { data: follows, error: followsError, count } = await supabase
    .from('follows')
    .select('following_id', { count: 'exact' })
    .eq('follower_id', userId)
    .range(offset, offset + limit - 1)
  
  if (followsError) throw followsError
  
  if (!follows || follows.length === 0) {
    return { data: [], page, limit, total: 0, hasMore: false }
  }
  
  const followingIds = follows.map(f => f.following_id)
  
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', followingIds)
  
  if (profilesError) throw profilesError
  
  return {
    data: profiles || [],
    page,
    limit,
    total: count || 0,
    hasMore: (count || 0) > offset + limit,
  }
}
