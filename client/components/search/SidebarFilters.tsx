'use client'
import { useState, useCallback } from 'react'
import { RefinementList, useClearRefinements } from 'react-instantsearch'

export default function SidebarFilters() {
    const [filterSearch, setFilterSearch] = useState('')
    const { canRefine, refine } = useClearRefinements()

    const handleClearAll = () => {
        setFilterSearch('')
        refine()
    }

    return (
        <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block fixed left-0 top-20 bottom-0 overflow-y-auto">
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                            Filters
                        </h2>
                        <button
                            onClick={handleClearAll}
                            disabled={!canRefine && !filterSearch}
                            className={`text-xs cursor-pointer ${
                                canRefine || filterSearch
                                    ? 'text-blue-600 hover:text-blue-800'
                                    : 'text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Clear
                        </button>
                    </div>

                    {/* Single search for all filters */}
                    <div className="relative">
                        <input
                            type="text"
                            value={filterSearch}
                            onChange={(e) => setFilterSearch(e.target.value)}
                            placeholder="Search filters..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {filterSearch && (
                            <button
                                onClick={() => setFilterSearch('')}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <FilterSection
                    title="Format"
                    attribute="format"
                    searchQuery={filterSearch}
                />

                <div className="my-6 border-t border-gray-200" />

                <FilterSection
                    title="Company"
                    attribute="company"
                    searchQuery={filterSearch}
                />

                <div className="my-6 border-t border-gray-200" />

                <FilterSection
                    title="Duration"
                    attribute="duration"
                    searchQuery={filterSearch}
                />

                <div className="my-6 border-t border-gray-200" />

                <FilterSection
                    title="Date Added"
                    attribute="date_added"
                    searchQuery={filterSearch}
                />
            </div>
        </aside>
    )
}

function FilterSection({
    title,
    attribute,
    searchQuery,
}: {
    title: string
    attribute: string
    searchQuery: string
}) {
    const transformItems = useCallback((items: any[]) => {
        if (!searchQuery.trim()) return items
        
        return items.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery])

    return (
        <div>
            <h3 className="mb-3 text-sm font-medium text-gray-900">{title}</h3>
            <RefinementList
                attribute={attribute}
                searchable={false}
                showMore={true}
                limit={5}
                transformItems={transformItems}
                classNames={{
                    root: 'filter-list',
                    showMore: 'mt-2 text-xs text-blue-600 hover:text-blue-800 cursor-pointer',
                }}
            />
        </div>
    )
}
