import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createComment, getCommentsByPost } from '@/lib/db/comments'
import { getPostById } from '@/lib/db/posts'
import { createCommentSchema, paginationSchema } from '@/lib/validation'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    const { post_id } = await params
    const { searchParams } = new URL(request.url)
    
    const result = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    
    const { page, limit } = result.success ? result.data : { page: 1, limit: 20 }
    
    const comments = await getCommentsByPost(post_id, page, limit)
    
    return NextResponse.json(comments)
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { post_id } = await params
    const body = await request.json()
    
    // Check if post exists
    const post = await getPostById(post_id)
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    const result = createCommentSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }
    
    const comment = await createComment(post_id, userId, result.data)
    
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
