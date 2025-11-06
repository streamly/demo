// Module-level state for authgear instance
let authgear: any = null
let isInitialized = false

async function initializeAuthgear() {
  if (isInitialized) return authgear

  try {
    // Dynamically import authgear to avoid SSR issues
    const { default: authgearModule } = await import('@authgear/web')
    
    const endpoint = process.env.NEXT_PUBLIC_AUTHGEAR_ENDPOINT
    const clientID = process.env.NEXT_PUBLIC_AUTHGEAR_CLIENT_ID

    if (!endpoint || !clientID) {
      throw new Error('Authgear environment variables not configured')
    }

    await authgearModule.configure({
      endpoint,
      clientID,
    })

    authgear = authgearModule
    isInitialized = true
    return authgearModule
  } catch (error) {
    console.error('Failed to initialize Authgear:', error)
    throw error
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    const authgearInstance = await initializeAuthgear()
    
    if (authgearInstance.sessionState !== 'AUTHENTICATED') {
      return null
    }

    // Get access token from Authgear
    return await authgearInstance.getAccessToken()
  } catch (error) {
    console.error('Failed to get access token:', error)
    return null
  }
}

export async function getUserInfo() {
  try {
    const authgearInstance = await initializeAuthgear()
    
    if (authgearInstance.sessionState !== 'AUTHENTICATED') {
      return null
    }

    return await authgearInstance.fetchUserInfo()
  } catch (error) {
    console.error('Failed to get user info:', error)
    return null
  }
}

export async function signIn() {
  try {
    const authgearInstance = await initializeAuthgear()
    await authgearInstance.startAuthentication({
      redirectURI: window.location.origin + '/auth/callback',
    })
  } catch (error) {
    console.error('Sign in failed:', error)
    throw error
  }
}

export async function signUp() {
  try {
    const authgearInstance = await initializeAuthgear()
    await authgearInstance.startAuthentication({
      redirectURI: window.location.origin + '/auth/callback',
      // Authgear handles both sign-in and sign-up through the same flow
      // Users can choose to sign up or sign in on the Authgear page
    })
  } catch (error) {
    console.error('Sign up failed:', error)
    throw error
  }
}

export async function signOut() {
  try {
    const authgearInstance = await initializeAuthgear()
    await authgearInstance.logout({
      redirectURI: window.location.origin,
    })
  } catch (error) {
    console.error('Sign out failed:', error)
    throw error
  }
}

export async function finishAuthentication() {
  try {
    const authgearInstance = await initializeAuthgear()
    await authgearInstance.finishAuthentication()
  } catch (error) {
    console.error('Failed to finish authentication:', error)
    throw error
  }
}

export async function checkAuthState() {
  try {
    const authgearInstance = await initializeAuthgear()
    
    if (authgearInstance.sessionState === 'AUTHENTICATED') {
      const userInfo = await authgearInstance.fetchUserInfo()
      return { isAuthenticated: true, user: userInfo }
    }
    
    return { isAuthenticated: false, user: null }
  } catch (error) {
    console.error('Failed to check auth state:', error)
    return { isAuthenticated: false, user: null }
  }
}
