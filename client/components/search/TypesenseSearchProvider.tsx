'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { InstantSearch } from 'react-instantsearch'
import { createInstantSearchAdapter } from '@client/services/typesenseService'

interface TypesenseSearchContextType {
  searchClient: any | null
  isReady: boolean
  error: string | null
  setApiKey: (apiKey: string) => void
}

const TypesenseSearchContext = createContext<TypesenseSearchContextType | undefined>(undefined)

interface TypesenseSearchProviderProps {
  children: ReactNode
  apiKey?: string // Optional custom API key (for dashboard)
  autoInitialize?: boolean // Whether to initialize immediately with default key
}

export function TypesenseSearchProvider({ 
  children, 
  apiKey,
  autoInitialize = true 
}: TypesenseSearchProviderProps) {
  const [searchClient, setSearchClient] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeSearchClient = async (key?: string) => {
    try {
      console.log('Initializing Typesense search client...')
      // Use requestAnimationFrame to ensure skeleton renders first
      await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
      const adapter = createInstantSearchAdapter(key)
      setSearchClient(adapter.searchClient)
      setIsReady(true)
      setError(null)
      console.log('Typesense search client ready')
    } catch (err) {
      console.error('Failed to initialize search client:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize search')
      setIsReady(false)
    }
  }

  // Initialize on mount if autoInitialize is true
  useEffect(() => {
    if (autoInitialize) {
      initializeSearchClient(apiKey)
    }
  }, [apiKey, autoInitialize])

  const handleSetApiKey = (newApiKey: string) => {
    setIsReady(false)
    initializeSearchClient(newApiKey)
  }

  const value: TypesenseSearchContextType = {
    searchClient,
    isReady,
    error,
    setApiKey: handleSetApiKey
  }

  return (
    <TypesenseSearchContext.Provider value={value}>
      {children}
    </TypesenseSearchContext.Provider>
  )
}

export function useTypesenseSearch() {
  const context = useContext(TypesenseSearchContext)
  if (context === undefined) {
    throw new Error('useTypesenseSearch must be used within a TypesenseSearchProvider')
  }
  return context
}

// Wrapper component that provides InstantSearch when ready
interface InstantSearchWrapperProps {
  children: ReactNode
  indexName?: string
  loadingComponent?: ReactNode
}

export function InstantSearchWrapper({ 
  children, 
  indexName = 'videos',
  loadingComponent 
}: InstantSearchWrapperProps) {
  const { searchClient, isReady, error } = useTypesenseSearch()

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">Search Error</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      </div>
    )
  }

  // Always render InstantSearch - it will handle its own loading states
  if (!isReady || !searchClient) {
    // Create a minimal search client for InstantSearch to work
    const dummyClient = {
      search: () => Promise.resolve({ 
        results: [{ 
          hits: [], 
          nbHits: 0, 
          page: 0, 
          nbPages: 0, 
          hitsPerPage: 20, 
          processingTimeMS: 0,
          query: '',
          params: ''
        }] 
      })
    }
    return (
      <InstantSearch searchClient={dummyClient as any} indexName={indexName}>
        {children}
      </InstantSearch>
    )
  }

  return (
    <InstantSearch searchClient={searchClient} indexName={indexName}>
      {children}
    </InstantSearch>
  )
}
