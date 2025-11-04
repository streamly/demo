import { createClient } from "redis"
import type { z } from "zod"
import { UserMetadataSchema } from "@server/validation"

type UserMetadata = z.infer<typeof UserMetadataSchema>

const REDIS_URL = process.env.REDIS_URL!
const redis = createClient({ url: REDIS_URL })
let isConnected = false
let isConnecting = false

// Add error handling for Redis connection
redis.on('error', (err: Error) => {
    console.error('Redis Client Error:', err)
    isConnected = false
})

redis.on('connect', () => {
    console.log('Redis Client Connected')
})

redis.on('ready', () => {
    console.log('Redis Client Ready')
    isConnected = true
})

redis.on('end', () => {
    console.log('Redis Client Disconnected')
    isConnected = false
})

async function connectClient() {
    if (isConnected) {
        return
    }

    if (isConnecting) {
        // Wait for existing connection attempt
        while (isConnecting) {
            await new Promise(resolve => setTimeout(resolve, 10))
        }
        return
    }

    try {
        isConnecting = true

        // Check if already connected (in case of race condition)
        if (redis.isReady) {
            isConnected = true
            return
        }

        await redis.connect()
        isConnected = true
    } catch (error) {
        // If error is "Socket already opened", the connection is actually ready
        if (error instanceof Error && error.message.includes('Socket already opened')) {
            isConnected = true
            return
        }
        throw error
    } finally {
        isConnecting = false
    }
}

export interface PortalCacheData {
    id: string
    branded: boolean
    name: string
    description: string
    filter: string
    sort: string
    createdAt: string
    updatedAt: string
}

export async function getPortalData(domain: string) {
    await connectClient()
    const dataStr = await redis.hGet("portals", domain)
    if (!dataStr) return null

    try {
        return JSON.parse(dataStr) as PortalCacheData
    } catch (err) {
        console.error(`Failed to parse portal data for domain=${domain}:`, err)
        return null
    }
}

export async function setProfileData(userId: string, metadata: UserMetadata) {
    await connectClient()
    const existing = await getProfileData(userId)
    const now = new Date().toISOString()

    const payload = {
        ...(existing || {}),
        ...metadata,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
    }

    console.log('User profile data cache', payload)

    await redis.set(`profile:${userId}`, JSON.stringify(payload))
    return payload
}

export async function getProfileData(userId: string) {
    await connectClient()
    const dataStr = await redis.get(`profile:${userId}`)
    if (!dataStr) return null

    try {
        return JSON.parse(dataStr)
    } catch (err) {
        console.error(`Failed to parse profile data for userId=${userId}:`, err)
        return null
    }
}

// Export helper functions for analytics use
export async function setAnalyticsData(key: string, value: string, ttlSeconds: number) {
    await connectClient()
    await redis.setEx(key, ttlSeconds, value)
}

export async function pushToList(key: string, value: string) {
    await connectClient()
    await redis.lPush(key, value)
}

export async function setExpire(key: string, ttlSeconds: number) {
    await connectClient()
    await redis.expire(key, ttlSeconds)
}

export async function getAnalyticsData(key: string) {
    await connectClient()
    return await redis.get(key)
}

export async function getListRange(key: string, start: number = 0, stop: number = -1) {
    await connectClient()
    return await redis.lRange(key, start, stop)
}

// Export the redis client for direct use (with connection handling)
export async function getConnectedRedisClient() {
    await connectClient()
    return redis
}
