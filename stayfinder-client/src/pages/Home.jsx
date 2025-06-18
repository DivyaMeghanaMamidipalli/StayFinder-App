import React, { useContext, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, XCircle } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { AppContext } from '../context/AppContext';
import { useListings } from '../hooks/useListings';

const Home = () => {
  const navigate = useNavigate();
  const { listings, setFilters } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    guests: '',
    location: '',
    amenities: [],
  });

  const location = searchParams.get('location') || '';

  useListings();

  // Filter listings based on search param
  const filteredListings = listings.filter((listing) =>
    listing.location.toLowerCase().includes(location.toLowerCase())
  );

  const handleAmenityChange = (e) => {
    const amenity = e.target.value;
    setLocalFilters((prev) => {
      const current = new Set(prev.amenities);
      if (current.has(amenity)) current.delete(amenity);
      else current.add(amenity);
      return { ...prev, amenities: Array.from(current) };
    });
  };

  const applyFilters = () => {
    setFilters({
      guests: localFilters.guests,
      location: localFilters.location,
      amenities: localFilters.amenities.join(','),
    });
    setSearchParams({ location: localFilters.location });
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({});
    setLocalFilters({ guests: '', location: '', amenities: [] });
    setSearchParams({});
  };

  const activeFilterCount = [
    localFilters.guests && 1,
    localFilters.location && 1,
    localFilters.amenities.length > 0 && 1,
  ].filter(Boolean).length;

  if (!Array.isArray(listings)) return <div className="p-10 text-center">Loading listings...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-rose-500 to-pink-600 overflow-hidden py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Discover unique places to stay around the world
            </p>
          </div>
          <div className="w-full md:w-1/2 h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
            <iframe
              title="map"
              width="100%"
              height="100%"
              loading="lazy"
              allowFullScreen
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.017540795079!2d-122.41941568468108!3d37.774929779759315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c5b8a68a3%3A0xe4dcf0bd2c97cdae!2sSan+Francisco%2C+CA!5e0!3m2!1sen!2sus!4v1618307909032"
              className="rounded-lg border-none"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Filters & Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {location ? `Search results for "${location}"` : 'Featured Stays'}
            </h2>
            <p className="text-gray-600">{filteredListings.length} properties available</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:shadow-md transition-shadow"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
              >
                <XCircle className="w-4 h-4" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Location</label>
                <input
                  type="text"
                  value={localFilters.location}
                  onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })}
                  placeholder="City or Area"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Guests</label>
                <input
                  type="number"
                  min="1"
                  value={localFilters.guests}
                  onChange={(e) => setLocalFilters({ ...localFilters, guests: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {['wifi', 'parking', 'pool', 'tv', 'kitchen'].map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-1 text-sm">
                      <input
                        type="checkbox"
                        value={amenity}
                        checked={localFilters.amenities.includes(amenity)}
                        onChange={handleAmenityChange}
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={applyFilters}
              className="mt-4 px-6 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition"
            >
              Apply Filters
            </button>
          </div>
        )}

        {/* Property Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <PropertyCard
              key={listing._id}
              listing={listing}
              onClick={() => navigate(`/property/${listing._id}`)}
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
};

export default Home;