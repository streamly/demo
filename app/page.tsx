'use client'
import 'instantsearch.css/themes/satellite-min.css'
import {
  Configure,
  InstantSearch,
} from 'react-instantsearch'
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter'

import InfiniteScrollHits from './components/InifiniteScrollHits'
import SearchHeader from './components/SearchHeader'
import SidebarFilters from './components/SidebarFilters'

const typesenseAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY!,
    nodes: [
      {
        host: process.env.NEXT_PUBLIC_TYPESENSE_HOST!,
        port: 443,
        protocol: 'https',
      },
    ],
  },
  additionalSearchParameters: {
    query_by: 'title,description,company,tags',
  },
})

const searchClient = typesenseAdapter.searchClient

export default function Page() {
  return (
    <InstantSearch indexName="videos" searchClient={searchClient}>
      <Configure hitsPerPage={12} />

      <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
        <SearchHeader />

        <main className="flex flex-1 overflow-hidden">
          <SidebarFilters />
          <section className="flex-1 overflow-y-auto p-5">
            <InfiniteScrollHits />
          </section>
        </main>
      </div>
    </InstantSearch>
  )
}