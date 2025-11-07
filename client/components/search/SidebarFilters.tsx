'use client'
import { useState, useCallback, useEffect } from 'react'
import { RefinementList, RangeInput, useClearRefinements, useRange } from 'react-instantsearch'

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
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {/* Most Important Filters - Top Priority */}
                <FilterSection
                    title="Companies"
                    attribute="companies"
                    searchQuery={filterSearch}
                />

                <div className="my-6 border-t border-gray-200" />

                <FilterSection
                    title="Type"
                    attribute="types"
                    searchQuery={filterSearch}
                />

                <div className="my-6 border-t border-gray-200" />

                <DurationFilter />

                <div className="my-6 border-t border-gray-200" />

                {/* Secondary Filters - Content-based */}
                <FilterSection
                    title="Topics"
                    attribute="topics"
                    searchQuery={filterSearch}
                />

                <div className="my-6 border-t border-gray-200" />

                <FilterSection
                    title="Audiences"
                    attribute="audiences"
                    searchQuery={filterSearch}
                />

                <div className="my-6 border-t border-gray-200" />

                <FilterSection
                    title="People"
                    attribute="people"
                    searchQuery={filterSearch}
                />

                <div className="my-6 border-t border-gray-200" />

                {/* Less Important Filters - Bottom */}
                <FilterSection
                    title="Tags"
                    attribute="tags"
                    searchQuery={filterSearch}
                />

                <div className="my-6 border-t border-gray-200" />

                <FilterSection
                    title="Format"
                    attribute="format"
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

function DurationFilter() {
    const { range, start, refine, canRefine } = useRange({ attribute: 'duration' })
    const [localMin, setLocalMin] = useState<string>('')
    const [localMax, setLocalMax] = useState<string>('')
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

    // Update local state when range changes externally
    useEffect(() => {
        if (start && start.length === 2) {
            // Convert seconds to minutes for display
            setLocalMin(start[0] ? (start[0] / 60).toString() : '')
            setLocalMax(start[1] ? (start[1] / 60).toString() : '')
        }
    }, [start])

    const applyRange = useCallback((min: number | undefined, max: number | undefined) => {
        if (canRefine) {
            refine([min, max])
        }
    }, [canRefine, refine])

    const debouncedRefine = useCallback((min: string, max: string) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer)
        }

        const timer = setTimeout(() => {
            // Convert minutes to seconds for the search
            const minVal = min ? parseInt(min) * 60 : undefined
            const maxVal = max ? parseInt(max) * 60 : undefined
            applyRange(minVal, maxVal)
        }, 400)

        setDebounceTimer(timer)
    }, [debounceTimer, applyRange])

    const handleMinChange = (value: string) => {
        setLocalMin(value)
        debouncedRefine(value, localMax)
    }

    const handleMaxChange = (value: string) => {
        setLocalMax(value)
        debouncedRefine(localMin, value)
    }

    const handlePresetClick = (min: number | undefined, max: number | undefined) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer)
        }
        applyRange(min, max)
        // Convert seconds to minutes for display
        setLocalMin(min ? (min / 60).toString() : '')
        setLocalMax(max ? (max / 60).toString() : '')
    }

    const clearFilter = () => {
        if (debounceTimer) {
            clearTimeout(debounceTimer)
        }
        applyRange(undefined, undefined)
        setLocalMin('')
        setLocalMax('')
    }

    return (
        <div>
            <h3 className="mb-3 text-sm font-medium text-gray-900">Duration</h3>
            
            {/* Preset buttons */}
            <div className="space-y-2 mb-4">
                <button
                    onClick={() => handlePresetClick(undefined, 300)}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                >
                    Under 5 min
                </button>
                <button
                    onClick={() => handlePresetClick(300, 900)}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                >
                    5 – 15 min
                </button>
                <button
                    onClick={() => handlePresetClick(900, 3600)}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                >
                    15 – 60 min
                </button>
                <button
                    onClick={() => handlePresetClick(3600, undefined)}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                >
                    Over 60 min
                </button>
            </div>

            {/* Custom range inputs */}
            <div className="border-t border-gray-200 pt-3">
                <div className="text-xs text-gray-600 mb-2">Custom range (minutes):</div>
                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        value={localMin}
                        onChange={(e) => handleMinChange(e.target.value)}
                        placeholder="Min"
                        min="0"
                        step="1"
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-gray-500 text-sm">to</span>
                    <input
                        type="number"
                        value={localMax}
                        onChange={(e) => handleMaxChange(e.target.value)}
                        placeholder="Max"
                        min="0"
                        step="1"
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                {(localMin || localMax) && (
                    <button
                        onClick={clearFilter}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                        Clear range
                    </button>
                )}
            </div>
        </div>
    )
}
