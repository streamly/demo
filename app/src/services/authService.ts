class AuthService {
  private authgear: any = null
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return this.authgear

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

      this.authgear = authgearModule
      this.isInitialized = true
      return authgearModule
    } catch (error) {
      console.error('Failed to initialize Authgear:', error)
      throw error
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const authgear = await this.initialize()
      
      if (authgear.sessionState !== 'AUTHENTICATED') {
        return null
      }

      // Get access token from Authgear
      return await authgear.getAccessToken()
    } catch (error) {
      console.error('Failed to get access token:', error)
      return null
    }
  }

  async getUserInfo() {
    try {
      const authgear = await this.initialize()
      
      if (authgear.sessionState !== 'AUTHENTICATED') {
        return null
      }

      return await authgear.fetchUserInfo()
    } catch (error) {
      console.error('Failed to get user info:', error)
      return null
    }
  }

  async signIn() {
    try {
      const authgear = await this.initialize()
      await authgear.startAuthentication({
        redirectURI: window.location.origin + '/auth/callback',
      })
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  }

  async signOut() {
    try {
      const authgear = await this.initialize()
      await authgear.logout({
        redirectURI: window.location.origin,
      })
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }

  async finishAuthentication() {
    try {
      const authgear = await this.initialize()
      await authgear.finishAuthentication()
    } catch (error) {
      console.error('Failed to finish authentication:', error)
      throw error
    }
  }

  async checkAuthState() {
    try {
      const authgear = await this.initialize()
      
      if (authgear.sessionState === 'AUTHENTICATED') {
        const userInfo = await authgear.fetchUserInfo()
        return { isAuthenticated: true, user: userInfo }
      }
      
      return { isAuthenticated: false, user: null }
    } catch (error) {
      console.error('Failed to check auth state:', error)
      return { isAuthenticated: false, user: null }
    }
  }
}

export const authService = new AuthService()
