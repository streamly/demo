'use client'
import { SearchBox } from 'react-instantsearch'

export default function SearchHeader() {
  return (
    <header className="bg-white/90 backdrop-blur shadow-sm p-4 flex justify-between items-center sticky top-0 z-10 border-b border-gray-100">
      <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-800">
        Bizilla Videos
      </h1>
      <div className="w-full sm:w-1/3">
        <SearchBox
        />
      </div>
    </header>
  )
}