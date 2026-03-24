import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { likePost, unlikePost } from '@/lib/db/likes'
import { getPostById } from '@/lib/db/posts'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { post_id } = await params
    
    // Check if post exists
    const post = await getPostById(post_id)
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    const like = await likePost(post_id, userId)
    
    return NextResponse.json({ success: true, like })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      if (error.message === 'Already liked') {
        return NextResponse.json(
          { error: 'Already liked this post' },
          { status: 409 }
        )
      }
    }
    console.error('Like error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { post_id } = await params
    
    await unlikePost(post_id, userId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Unlike error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
