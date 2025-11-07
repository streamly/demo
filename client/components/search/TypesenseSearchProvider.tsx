'use client'
import { createInstantSearchAdapter } from '@client/services/typesenseService'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { InstantSearch } from 'react-instantsearch'

interface TypesenseSearchContextType {
  searchClient: any | null
  isReady: boolean
  error: string | null
  initializeWithScopedKey: (apiKey: string) => Promise<void>
}

const TypesenseSearchContext = createContext<TypesenseSearchContextType | undefined>(undefined)

interface TypesenseSearchProviderProps {
  children: ReactNode
  autoInitialize?: boolean // Whether to initialize immediately
}

export function TypesenseSearchProvider({
  children,
  autoInitialize = true
}: TypesenseSearchProviderProps) {
  const [searchClient, setSearchClient] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeSearchClient = async (apiKey?: string) => {
    try {
      console.log('Initializing Typesense search client...', apiKey ? 'with scoped key' : 'with default key')
      // Use requestAnimationFrame to ensure skeleton renders first
      await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
      const adapter = createInstantSearchAdapter(apiKey)
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

  const initializeWithScopedKey = async (apiKey: string) => {
    setIsReady(false)
    await initializeSearchClient(apiKey)
  }

  // Initialize on mount if autoInitialize is true
  useEffect(() => {
    if (autoInitialize) {
      initializeSearchClient()
    }
  }, [autoInitialize])

  const value: TypesenseSearchContextType = {
    searchClient,
    isReady,
    error,
    initializeWithScopedKey
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
  indexName = process.env.NEXT_PUBLIC_TYPESENSE_COLLECTION,
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
