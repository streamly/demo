'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@client/components/auth/AuthProvider'
import { getAccessToken } from '@client/services/authService'
import { useTypesenseSearch } from '@client/components/search/TypesenseSearchProvider'

interface DashboardSearchInitializerProps {
  children: React.ReactNode
}

export default function DashboardSearchInitializer({ children }: DashboardSearchInitializerProps) {
  const { isAuthenticated } = useAuth()
  const { initializeWithScopedKey } = useTypesenseSearch()
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    // Prevent infinite loop - only initialize once when authenticated
    if (!isAuthenticated || hasInitialized) return

    const initializeSearch = async () => {
      try {
        console.log('Dashboard: Fetching channel search key...')
        const token = await getAccessToken()
        
        const response = await fetch('/api/channel/search-key', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        const data = await response.json()
        
        if (response.ok && data.searchKey) {
          console.log('Dashboard: Channel search key fetched successfully', {
            userId: data.userId,
            filters: data.filters,
            hasSearchKey: !!data.searchKey
          })
          // Initialize search client with the scoped key
          await initializeWithScopedKey(data.searchKey)
          console.log('Dashboard: Search client initialized with scoped key')
        } else {
          console.error('Failed to fetch channel search key:', data.error || 'No search key received')
        }
      } catch (error) {
        console.error('Failed to initialize dashboard search:', error)
      } finally {
        setHasInitialized(true)
      }
    }

    initializeSearch()
  }, [isAuthenticated, hasInitialized, initializeWithScopedKey])

  // Always render children immediately - no loading states
  return <>{children}</>
}
