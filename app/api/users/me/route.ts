import { NextRequest, NextResponse } from 'next/server'
import { AuthgearError, updateUserMetadata, verifyAuthgearUser } from '@server/authgearClient'
import { setProfileData } from '@server/redisClient'
import { UserMetadataSchema } from '@server/validation'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const decoded = await verifyAuthgearUser(authHeader || undefined)
    const userId = decoded.sub

    if (!userId) {
      return NextResponse.json(
        { error: "Missing user ID in token" },
        { status: 401 }
      )
    }

    const metadataInput = await request.json()
    if (!metadataInput || typeof metadataInput !== "object") {
      return NextResponse.json(
        { error: "Missing metadata" },
        { status: 400 }
      )
    }

    console.log("Metadata", metadataInput)

    const parsed = UserMetadataSchema.safeParse(metadataInput)

    if (!parsed.success) {
      console.warn("Invalid metadata:", parsed.error.flatten().fieldErrors)
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const sanitized = parsed.data

    await updateUserMetadata(userId, sanitized)

    try {
      await setProfileData(userId, sanitized)
    } catch (error) {
      console.error('Failed to update profile data cache', error)
    }

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (err: any) {
    if (err instanceof AuthgearError) {
      return NextResponse.json(
        { error: err.code, message: err.message },
        { status: 401 }
      )
    }

    console.error("updateProfile error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would:
    // 1. Get user ID from authentication token
    // 2. Fetch profile from database
    // 3. Return user's current profile data

    // For now, return a placeholder response
    return NextResponse.json(
      {
        message: 'Profile retrieval endpoint',
        note: 'Implement database integration to fetch user profile'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
