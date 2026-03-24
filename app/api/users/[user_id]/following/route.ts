import { NextResponse } from 'next/server'
import { getFollowing } from '@/lib/db/users'
import { paginationSchema } from '@/lib/validation'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const { user_id } = await params
    const { searchParams } = new URL(request.url)
    
    const result = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    
    const { page, limit } = result.success ? result.data : { page: 1, limit: 20 }
    
    const following = await getFollowing(user_id, page, limit)
    
    return NextResponse.json(following)
  } catch (error) {
    console.error('Get following error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
