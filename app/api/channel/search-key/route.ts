import { verifyAuthgearUser } from '@server/authgearClient'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization')
    const decoded = await verifyAuthgearUser(authHeader || undefined)
    const userId = decoded.sub

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // For now, return the same key from env variable
    // In the future, this would return a user-scoped key with filters like: user_id:=${userId}
    const searchKey = process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY

    if (!searchKey) {
      return NextResponse.json(
        { error: 'Search key not configured' },
        { status: 500 }
      )
    }

    console.log('Channel search key requested for user:', userId)

    return NextResponse.json({
      searchKey,
      userId,
      filters: `user_id:=${userId}`,
      success: true
    })
  } catch (error) {
    console.error('Failed to get channel search key:', error)
    return NextResponse.json(
      { error: 'Failed to get search key' },
      { status: 500 }
    )
  }
}
