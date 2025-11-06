import { upsertUser } from '@/server/db/user'
import { AuthgearError, fetchUserById, updateAuthgearUserMetadata, verifyAuthgearUser } from '@server/authgearClient'
import {
    authErrorResponse,
    badRequestResponse,
    internalErrorResponse,
    successResponse,
    validationErrorResponse
} from '@server/responses'
import { UserProfileDataSchema } from '@server/validation'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        const decoded = await verifyAuthgearUser(authHeader || undefined)
        const userId = decoded.sub

        if (!userId) {
            return authErrorResponse('Missing user ID in token')
        }

        const user = await fetchUserById(userId)
        const metadataInput = await request.json()

        if (!metadataInput || typeof metadataInput !== 'object') {
            return badRequestResponse('Missing metadata')
        }

        if (!user?.standardAttributes.email) {
            return badRequestResponse('User email not found in Authgear')
        }

        const parsed = UserProfileDataSchema.safeParse(metadataInput)
        if (!parsed.success) {
            return validationErrorResponse('Invalid input', parsed.error.flatten())
        }

        const sanitized = parsed.data

        try {
            await updateAuthgearUserMetadata(userId, sanitized)
        } catch (error: any) {
            console.error('Failed to update Authgear metadata:', error)
            return internalErrorResponse('Failed to update Authgear metadata')
        }

        try {
            await upsertUser({ ...sanitized, id: userId, email: user.standardAttributes.email })
        } catch (error: any) {
            console.error('Database upsert failed:', error)
            return internalErrorResponse('Failed to update user in database')
        }

        return successResponse(null, 'Profile updated successfully')
    } catch (err: any) {
        if (err instanceof AuthgearError) {
            return authErrorResponse(err.message)
        }

        console.error('updateProfile error:', err)
        return internalErrorResponse('Failed to update profile')
    }
}