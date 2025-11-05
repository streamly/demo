import { getVideoById, getVideoByObjectId } from '@/server/typesenseClient'
import { getUserInfoFromAuthgear, verifyAuthgearUser } from '@server/authgearClient'
import { pushToList, setAnalyticsData, setExpire } from '@server/redisClient'
import { createHash, randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

interface VideoPlayActionData {
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
  billing?: string
  score?: number
  videoPosition?: number
  ranking?: number
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
    await verifyAuthgearUser(authHeader || undefined)
    const token = authHeader!.slice("Bearer ".length).trim()

    const body = await request.json()
    const { videoId } = body

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

    // Build base action data
    const actionData: VideoPlayActionData = {
      uuid,
      guid,
      aid: videoData.uid,
      videoId: videoData.id,
      videoTitle: videoData.title,
      videoCompany: videoData.company || videoData.channel || '',
      gated: Boolean(videoData.gated),
      hostUrl: request.headers.get('origin') || '',
      billing: videoData.billing,
      score: videoData.score,
      videoPosition: videoData.__position,
      ranking: videoData.ranking,
      timestamp: Date.now()
    }

    // Add user info if authenticated
    if (userInfo) {
      actionData.userId = userInfo.sub
      actionData.userFirstname = userInfo.givenName
      actionData.userLastname = userInfo.familyName
      actionData.userCompany = userInfo.customAttributes?.company
      actionData.userPosition = userInfo.customAttributes?.position
      actionData.userIndustry = userInfo.customAttributes?.industry
      actionData.userEmail = userInfo.email
      actionData.userPhone = userInfo.customAttributes?.phone
    }

    // Store in Redis
    const redisKey = `analytics:play:${actionData.guid}`
    await setAnalyticsData(redisKey, JSON.stringify(actionData), 86400 * 30) // Store for 30 days

    // Also add to a daily analytics list for easy querying
    const dateKey = new Date().toISOString().split('T')[0]
    const dailyKey = `analytics:daily:${dateKey}:play`
    await pushToList(dailyKey, actionData.guid)
    await setExpire(dailyKey, 86400 * 90) // Keep daily lists for 90 days

    console.log('Video play event tracked:', {
      videoId: actionData.videoId,
      videoTitle: actionData.videoTitle,
      userId: actionData.userId,
      timestamp: actionData.timestamp
    })

    return NextResponse.json({
      success: true,
      guid: actionData.guid,
      message: 'Play event tracked successfully'
    })

  } catch (error) {
    console.error('Failed to track play event:', error)
    return NextResponse.json(
      { error: 'Failed to track play event' },
      { status: 500 }
    )
  }
}
