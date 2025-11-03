'use client'
import { useSearchBox } from 'react-instantsearch'
import { useAuth } from './AuthProvider'
import Link from 'next/link'

// #TODO: fix that when clicking on search bar first batch of results just disappears
interface SearchHeaderProps {
  onSearchFocus?: (focused: boolean) => void
}

export default function SearchHeader({ onSearchFocus }: SearchHeaderProps) {
  const { isAuthenticated, user, signIn, signOut } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Bizilla Videos
        </h1>
        
        <div className="flex items-center gap-4 flex-1 max-w-2xl ml-8">
          <div className="flex-1 max-w-md">
            <CustomSearchBox onSearchFocus={onSearchFocus} />
          </div>
          
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {user?.email && (
                  <span className="text-sm text-gray-600 hidden sm:block">
                    {user.email}
                  </span>
                )}
                <Link
                  href="/profile"
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={signIn}
                className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function CustomSearchBox({ onSearchFocus }: { onSearchFocus?: (focused: boolean) => void }) {
  const { query, refine } = useSearchBox()

  return (
    <form className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => refine(e.target.value)}
        onFocus={() => onSearchFocus?.(true)}
        onBlur={() => onSearchFocus?.(false)}
        placeholder="Search videos..."
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {query && (
        <button
          type="button"
          onClick={() => refine('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </form>
  )
}
