import { NextResponse } from 'next/server'
import { requireAuth, getCurrentUserId } from '@/lib/auth'
import { getPostById, updatePost, deletePost } from '@/lib/db/posts'
import { updatePostSchema } from '@/lib/validation'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    const { post_id } = await params
    const currentUserId = await getCurrentUserId()
    
    const post = await getPostById(post_id, currentUserId)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { post_id } = await params
    const body = await request.json()
    
    const result = updatePostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }
    
    // Check if post exists and belongs to user
    const existingPost = await getPostById(post_id, userId)
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    if (existingPost.author_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    const post = await updatePost(post_id, userId, result.data)
    
    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Update post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ post_id: string }> }
) {
  return PUT(request, context)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { post_id } = await params
    
    // Check if post exists and belongs to user
    const existingPost = await getPostById(post_id, userId)
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    if (existingPost.author_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    await deletePost(post_id, userId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Delete post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
