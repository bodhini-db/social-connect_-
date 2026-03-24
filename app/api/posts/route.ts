import { NextResponse } from 'next/server'
import { requireAuth, getCurrentUserId } from '@/lib/auth'
import { createPost, getAllPosts } from '@/lib/db/posts'
import { createPostSchema, paginationSchema } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const result = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    
    const { page, limit } = result.success ? result.data : { page: 1, limit: 20 }
    const currentUserId = await getCurrentUserId()
    
    const posts = await getAllPosts(page, limit, currentUserId)
    
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth()
    const body = await request.json()
    
    const result = createPostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }
    
    const post = await createPost(userId, result.data)
    
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Create post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
