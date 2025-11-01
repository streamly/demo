'use client'
import { RefinementList } from 'react-instantsearch'

export default function SidebarFilters() {
    return (
        <aside className="w-64 bg-white border-r border-gray-100 overflow-y-auto p-5 hidden md:block">
            <h2 className="font-medium mb-3 text-gray-700 uppercase tracking-wide text-sm">
                Company
            </h2>
            <RefinementList attribute="company" searchable />

            <h2 className="font-medium mt-8 mb-3 text-gray-700 uppercase tracking-wide text-sm">
                Tags
            </h2>
            <RefinementList attribute="tags" searchable />
        </aside>
    )
}