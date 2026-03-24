import { NextResponse } from 'next/server'
import { getProfileById } from '@/lib/db/users'
import { isFollowing } from '@/lib/db/follows'
import { getCurrentUserId } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const { user_id } = await params
    
    const profile = await getProfileById(user_id)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if current user is following this user
    const currentUserId = await getCurrentUserId()
    let isFollowingUser = false
    
    if (currentUserId && currentUserId !== user_id) {
      isFollowingUser = await isFollowing(currentUserId, user_id)
    }
    
    return NextResponse.json({
      ...profile,
      is_following: isFollowingUser,
      is_own_profile: currentUserId === user_id,
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
