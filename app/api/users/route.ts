import { NextResponse } from 'next/server'
import { getAllUsers } from '@/lib/db/users'
import { paginationSchema } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const result = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    
    const { page, limit } = result.success ? result.data : { page: 1, limit: 20 }
    
    const users = await getAllUsers(page, limit)
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
