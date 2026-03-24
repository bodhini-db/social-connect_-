import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { deleteComment, getCommentById } from '@/lib/db/comments'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ post_id: string; comment_id: string }> }
) {
  try {
    const { userId } = await requireAuth()
    const { comment_id } = await params
    
    // Check if comment exists and belongs to user
    const comment = await getCommentById(comment_id)
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    if (comment.author_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    await deleteComment(comment_id, userId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Delete comment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
