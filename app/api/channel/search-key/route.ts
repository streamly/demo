import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // For now, return the same key from env variable
    // In the future, this would return a user-scoped key
    const searchKey = process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY

    if (!searchKey) {
      return NextResponse.json(
        { error: 'Search key not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      searchKey,
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
