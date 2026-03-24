import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { followUser, unfollowUser } from '@/lib/db/follows'
import { getProfileById } from '@/lib/db/users'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { user_id } = await params
    
    // Check if user exists
    const targetUser = await getProfileById(user_id)
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Can't follow yourself
    if (userId === user_id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }
    
    const follow = await followUser(userId, user_id)
    
    return NextResponse.json({ success: true, follow })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      if (error.message === 'Already following') {
        return NextResponse.json(
          { error: 'Already following this user' },
          { status: 409 }
        )
      }
    }
    console.error('Follow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { user_id } = await params
    
    await unfollowUser(userId, user_id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Unfollow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
