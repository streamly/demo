'use client'
import { useSearchBox } from 'react-instantsearch'

interface SearchBoxProps {
  onSearchFocus?: (focused: boolean) => void
}

export default function SearchBox({ onSearchFocus }: SearchBoxProps) {
  const { query, refine } = useSearchBox()

  return (
    <div className="flex-1 flex justify-center px-4">
      <div className="w-full max-w-2xl">
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
      </div>
    </div>
  )
}
