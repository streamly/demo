'use client'
import { useEffect, useState } from 'react'
import { useTypesenseSearch } from '@client/components/search/TypesenseSearchProvider'
import { useAuth } from '@client/components/auth/AuthProvider'

interface DashboardSearchInitializerProps {
  children: React.ReactNode
}

export default function DashboardSearchInitializer({ children }: DashboardSearchInitializerProps) {
  const { isAuthenticated } = useAuth()
  const { setApiKey } = useTypesenseSearch()
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    // Prevent infinite loop - only initialize once when authenticated
    if (!isAuthenticated || hasInitialized) return

    const initializeSearch = async () => {
      try {
        console.log('Dashboard: Fetching search key...')
        const response = await fetch('/api/channel/search-key')
        const data = await response.json()
        
        if (response.ok && data.searchKey) {
          console.log('Dashboard: Setting search key for scoped search')
          setApiKey(data.searchKey)
        } else {
          console.error('Failed to fetch search key:', data.error || 'No search key received')
        }
      } catch (error) {
        console.error('Failed to initialize dashboard search:', error)
      } finally {
        setHasInitialized(true)
      }
    }

    initializeSearch()
  }, [isAuthenticated, hasInitialized, setApiKey])

  // Always render children immediately - no loading states
  return <>{children}</>
}
