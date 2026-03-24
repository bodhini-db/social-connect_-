import { NextResponse } from 'next/server'
import { getFollowers } from '@/lib/db/users'
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
    
    const followers = await getFollowers(user_id, page, limit)
    
    return NextResponse.json(followers)
  } catch (error) {
    console.error('Get followers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
