import {Search,Filter,ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard from './PropertyCard';

const HomePage = ({searchQuery, setSearchQuery, filteredListings,setSelectedListing,setCurrentPage}) => (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gradient-to-r from-rose-500 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Discover unique places to stay around the world
            </p>
            <div className="bg-white rounded-full p-2 flex items-center shadow-xl max-w-md">
              <Search className="w-5 h-5 text-gray-400 ml-4" />
              <input
                type="text"
                placeholder="Where are you going?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
              />
              <button className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-full font-medium transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
        {/* Decorative shapes */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-500" />
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? `Search results for "${searchQuery}"` : 'Featured Stays'}
            </h2>
            <p className="text-gray-600">{filteredListings.length} properties available</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:shadow-md transition-shadow">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <PropertyCard
              key={listing._id}
              listing={listing}
              onClick={(listing) => {
                setSelectedListing(listing);
                setCurrentPage('details');
              }}
            />
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );

  export default HomePage;