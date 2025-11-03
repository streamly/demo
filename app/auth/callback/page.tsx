'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '../../src/components/AuthProvider'

export default function AuthCallback() {
  const router = useRouter()
  const { refreshAuth, checkIfUserHasCompleteProfile } = useAuth()

  useEffect(() => {
    async function handleCallback() {
      try {
        // Only run on client side
        if (typeof window === 'undefined') {
          return
        }

        // Dynamically import authgear to avoid SSR issues
        const { default: authgear } = await import('@authgear/web')

        // Configure Authgear first (same as in AuthProvider)
        const endpoint = process.env.NEXT_PUBLIC_AUTHGEAR_ENDPOINT
        const clientID = process.env.NEXT_PUBLIC_AUTHGEAR_CLIENT_ID

        console.log('Callback - Authgear Config:', { endpoint, clientID })

        if (!endpoint || !clientID) {
          console.error('Missing Authgear environment variables in callback')
          router.push('/')
          return
        }

        await authgear.configure({
          endpoint,
          clientID,
        })

        // Handle the authentication callback
        console.log('🔄 Finishing authentication...')
        await authgear.finishAuthentication()
        console.log('✅ Authentication completed successfully')

        // Refresh auth state in the provider
        console.log('🔄 Refreshing auth state...')
        await refreshAuth()

        // Check if user has complete profile
        const hasCompleteProfile = checkIfUserHasCompleteProfile()
        
        if (!hasCompleteProfile) {
          console.log('👤 Profile incomplete, redirecting to profile page')
          router.push('/profile?reason=signin-incomplete')
        } else {
          console.log('🏠 Profile complete, redirecting to home page')
          router.push('/')
        }
      } catch (error) {
        console.error('Authentication callback failed:', error)
        // Redirect to home page even if there's an error
        router.push('/')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-900">Signing you in...</h2>
        <p className="text-gray-600">Please wait while we complete your authentication.</p>
      </div>
    </div>
  )
}
