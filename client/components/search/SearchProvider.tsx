'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useInstantSearch } from 'react-instantsearch'

interface SearchContextType {
  isSearchFocused: boolean
  hasEverSearched: boolean
  showSearchMode: boolean
  setIsSearchFocused: (focused: boolean) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

interface SearchProviderProps {
  children: ReactNode
}

export function SearchProvider({ children }: SearchProviderProps) {
  const { indexUiState } = useInstantSearch()
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [hasEverSearched, setHasEverSearched] = useState(false)

  // Check if user has searched (has query or filters)
  const hasSearched = !!(
    indexUiState.query ||
    indexUiState.refinementList ||
    indexUiState.range ||
    indexUiState.hierarchicalMenu
  )

  useEffect(() => {
    if (hasSearched) {
      setHasEverSearched(true)
    }
  }, [hasSearched])

  // Show search mode when focused OR when user has searched OR has ever searched
  const showSearchMode = isSearchFocused || hasSearched || hasEverSearched

  const handleSearchFocus = (focused: boolean) => {
    setIsSearchFocused(focused)
    if (focused) {
      setHasEverSearched(true)
    }
  }

  const value: SearchContextType = {
    isSearchFocused,
    hasEverSearched,
    showSearchMode,
    setIsSearchFocused: handleSearchFocus
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
