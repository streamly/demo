'use client'
import { useInstantSearch } from 'react-instantsearch'
import { useAuth } from './AuthProvider'

export default function JumbotronBanner() {
  const { indexUiState } = useInstantSearch()
  const { signIn } = useAuth()
  
  // Check if user has searched (has query or filters)
  const hasSearched = !!(
    indexUiState.query || 
    indexUiState.refinementList || 
    indexUiState.range ||
    indexUiState.hierarchicalMenu
  )

  // Hide jumbotron if user has searched
  if (hasSearched) {
    return null
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px] lg:min-h-[450px]">
          
          {/* Left column - Dark background with white text */}
          <div className="bg-gray-900 text-white flex items-center order-2 lg:order-1 lg:-ml-[50vw] lg:pl-[50vw]">
            <div className="px-6 sm:px-8 lg:px-12 py-12 lg:py-16 w-full overflow-hidden">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight break-words">
                Bizilla TV
              </h1>
              
              <p className="text-lg lg:text-xl text-gray-100 mb-8 leading-relaxed break-words pr-8">
                Stream free live events and on-demand videos from leading companies, thought leaders, and business experts.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={signIn}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md transition-colors shadow-sm whitespace-nowrap"
                  title="Sign Up"
                >
                  Get Started
                </button>
                
                <a 
                  href="https://accounts.syndinet.com/sign-up"
                  className="bg-transparent border border-gray-300 text-white font-medium px-6 py-3 rounded-md hover:bg-white/10 transition-colors whitespace-nowrap text-center"
                  title="Create a Channel"
                >
                  Create a Channel
                </a>
              </div>
            </div>
          </div>

          {/* Right column - Background image */}
          <div 
            className="relative order-1 lg:order-2 min-h-[250px] lg:min-h-[450px] bg-gray-200 lg:-mr-[50vw] lg:pr-[50vw]"
            style={{
              backgroundImage: 'url(/jumbotron.png)',
              backgroundPosition: '75% 30%',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Subtle overlay for better text contrast */}
            <div className="absolute inset-0 bg-black/20 lg:hidden" />
          </div>
          
        </div>
      </div>
    </div>
  )
}
