import { createHash, randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getUserInfoFromAuthgear, verifyAuthgearUser } from '../../lib/authgearClient'
import { pushToList, setAnalyticsData, setExpire } from '../../lib/redisClient'
import { getVideoById, getVideoByObjectId } from '../../lib/typesense'

interface ContactActionData {
  uuid: string
  guid: string
  aid?: string
  videoId: string
  videoTitle: string
  videoCompany: string
  gated: boolean
  hostUrl: string
  userId?: string
  userFirstname?: string
  userLastname?: string
  userCompany?: string
  userPosition?: string
  userIndustry?: string
  userEmail?: string
  userPhone?: string
  message?: string
  timestamp: number
}

function getUserUUID(request: NextRequest): string {
  // Get user IP from request headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('remote-addr')

  // Try different headers to get the real IP
  const ip = forwarded?.split(',')[0] || realIP || remoteAddr || 'unknown'

  // Create MD5 hash of IP
  const hash = createHash('md5').update(ip).digest('hex')

  return hash
}

export async function POST(request: NextRequest) {
  try {
    // Verify Authgear token
    const authHeader = request.headers.get('authorization')
    const jwtPayload = await verifyAuthgearUser(authHeader || undefined)
    const token = authHeader!.slice("Bearer ".length).trim()

    const body = await request.json()
    const { videoId, message } = body

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Fetch video data from Typesense
    let videoData = await getVideoById(videoId)
    if (!videoData) {
      // Try by objectID if not found by id
      videoData = await getVideoByObjectId(videoId)
    }

    if (!videoData) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Fetch user info from Authgear
    const userInfo = await getUserInfoFromAuthgear(token)

    const uuid = getUserUUID(request)
    const guid = randomUUID()

    // Build contact action data
    const actionData: ContactActionData = {
      uuid,
      guid,
      aid: videoData.uid,
      videoId: videoData.id,
      videoTitle: videoData.title,
      videoCompany: videoData.company || videoData.channel || '',
      gated: Boolean(videoData.gated),
      hostUrl: request.headers.get('origin') || '',
      userId: userInfo.sub,
      userFirstname: userInfo.givenName,
      userLastname: userInfo.familyName,
      userCompany: userInfo.customAttributes?.company,
      userPosition: userInfo.customAttributes?.position,
      userIndustry: userInfo.customAttributes?.industry,
      userEmail: userInfo.email,
      userPhone: userInfo.customAttributes?.phone,
      message: message?.trim() || undefined,
      timestamp: Date.now()
    }

    // Store in Redis
    const redisKey = `analytics:contact:${actionData.guid}`
    await setAnalyticsData(redisKey, JSON.stringify(actionData), 86400 * 30) // Store for 30 days

    // Add to daily analytics list
    const dateKey = new Date().toISOString().split('T')[0]
    const dailyKey = `analytics:daily:${dateKey}:contact`
    await pushToList(dailyKey, actionData.guid)
    await setExpire(dailyKey, 86400 * 90) // Keep daily lists for 90 days

    // Also add to user-specific contact list
    const userContactKey = `analytics:user:${userInfo.sub}:contacts`
    await pushToList(userContactKey, actionData.guid)
    await setExpire(userContactKey, 86400 * 365) // Keep user contacts for 1 year

    console.log('Contact event tracked:', {
      videoId: actionData.videoId,
      videoTitle: actionData.videoTitle,
      userId: actionData.userId,
      userEmail: actionData.userEmail,
      hasMessage: !!actionData.message,
      timestamp: actionData.timestamp
    })

    return NextResponse.json({
      success: true,
      guid: actionData.guid,
      message: 'Contact event tracked successfully'
    })

  } catch (error) {
    console.error('Failed to track contact event:', error)
    return NextResponse.json(
      { error: 'Failed to track contact event' },
      { status: 500 }
    )
  }
}
