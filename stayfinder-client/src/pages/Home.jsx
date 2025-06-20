import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { Search, Filter, XCircle } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { AppContext } from '../context/AppContext';
import { useListings } from '../hooks/useListings';

const mapContainerStyle = {
  width: '100%',
  height: '100%', // Changed for better map responsiveness in its container
};

const centerDefault = {
  lat: 37.7749,
  lng: -122.4194,
};

const GOOGLE_MAPS_API = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

const Home = () => {
  const navigate = useNavigate();
  const { listings, setFilters, user } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [mapCenter, setMapCenter] = useState(centerDefault);
  
  // --- UPDATED STATE: Added date and price filters ---
  const [localFilters, setLocalFilters] = useState({
    guests: '',
    location: '',
    amenities: [],
    startDate: '',
    endDate: '',
    minPrice: '',
    maxPrice: '',
  });

  const location = searchParams.get('location') || '';

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API,
  });

  useListings();
  console.log("Data:", listings);

  const filteredListings = listings.filter((listing) => {
    const matchesLocation = listing.location.toLowerCase().includes(location.toLowerCase());

    const hostId =
      typeof listing.host === 'object' && listing.host !== null
        ? listing.host._id
        : listing.host;

    const isOwner = user?.role === 'host' ? hostId === user.id : true;

    return matchesLocation && isOwner;
  });


  const handleAmenityChange = (e) => {
    const amenity = e.target.value;
    setLocalFilters((prev) => {
      const current = new Set(prev.amenities);
      if (current.has(amenity)) current.delete(amenity);
      else current.add(amenity);
      return { ...prev, amenities: Array.from(current) };
    });
  };

  // --- UPDATED FUNCTION: applyFilters now includes date and price ---
  const applyFilters = () => {
    setFilters({
      guests: localFilters.guests,
      location: localFilters.location,
      amenities: localFilters.amenities.join(','),
      startDate: localFilters.startDate,
      endDate: localFilters.endDate,
      minPrice: localFilters.minPrice,
      maxPrice: localFilters.maxPrice,
    });
    setSearchParams({ location: localFilters.location });
    setShowFilters(false);
  };

  // --- UPDATED FUNCTION: clearFilters now resets date and price ---
  const clearFilters = () => {
    setFilters({});
    setLocalFilters({
      guests: '',
      location: '',
      amenities: [],
      startDate: '',
      endDate: '',
      minPrice: '',
      maxPrice: '',
    });
    setSearchParams({});
    setMapCenter(centerDefault);
  };

  const geocodeLocation = useCallback(async () => {
    if (!location) return;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_MAPS_API}`
    );
    const data = await response.json();
    if (data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      setMapCenter({ lat, lng });
    }
  }, [location, GOOGLE_MAPS_API]); // Added GOOGLE_MAPS_API to dependency array

  useEffect(() => {
    geocodeLocation();
  }, [geocodeLocation]);

  // --- UPDATED LOGIC: activeFilterCount now checks for new filters ---
  const activeFilterCount = [
    localFilters.guests,
    localFilters.location,
    localFilters.amenities.length > 0,
    localFilters.startDate || localFilters.endDate,
    localFilters.minPrice || localFilters.maxPrice,
  ].filter(Boolean).length;


  if (!isLoaded) return <div className="p-10 text-center">Loading ...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-rose-500 to-pink-600 overflow-hidden py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center space-y-6">
          <div className="text-white max-w-2xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{user?.role === 'host'
                ? ''
                : 'Find Your Perfect Stay'}</h1>
            <p className="text-xl md:text-2xl text-white/90">
              {user?.role === 'host'
                ? 'Add Your Properties and rent them accross the World'
                : 'Discover unique places to stay around the world'}
            </p>
          </div>
          {location && (
            <div className="w-full md:w-2/3 h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
              <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={12}>
                {filteredListings.map((listing) => {
                  const { lat, lng } = listing;
                  const isValidCoords = typeof lat === 'number' && typeof lng === 'number';
                  return isValidCoords ? (
                    <Marker
                      key={listing._id}
                      position={{ lat, lng }}
                      title={listing.title}
                    />
                  ) : null;
                })}
              </GoogleMap>
            </div>
          )}
        </div>
      </div>

      {/* Filters & Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {user?.role === 'host'
                ? 'Your Properties'
                : location
                ? `Search results for "${location}"`
                : 'Featured Stays'}
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

        {/* --- UPDATED FILTER UI: New layout with date and price --- */}
        {showFilters && (
          <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Location Filter */}
              <div>
                <label className="block mb-2 text-sm font-medium">Location</label>
                <input
                  type="text"
                  value={localFilters.location}
                  onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })}
                  placeholder="e.g. San Francisco"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              {/* Guests Filter */}
              <div>
                <label className="block mb-2 text-sm font-medium">Guests</label>
                <input
                  type="number"
                  min="1"
                  value={localFilters.guests}
                  onChange={(e) => setLocalFilters({ ...localFilters, guests: e.target.value })}
                  placeholder="Any"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              {/* Date Filters */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-2 text-sm font-medium">Check-in</label>
                  <input
                    type="date"
                    value={localFilters.startDate}
                    onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-gray-600"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Check-out</label>
                  <input
                    type="date"
                    min={localFilters.startDate} // Prevents selecting end date before start date
                    value={localFilters.endDate}
                    onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-gray-600"
                  />
                </div>
              </div>

              {/* Price Filters */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-2 text-sm font-medium">Min Price</label>
                  <input
                    type="number"
                    min="0"
                    value={localFilters.minPrice}
                    onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
                    placeholder="$0"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Max Price</label>
                  <input
                    type="number"
                    min={localFilters.minPrice || "0"}
                    value={localFilters.maxPrice}
                    onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
                    placeholder="$1000+"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Amenities Filter */}
            <div className="pt-4 border-t">
              <label className="block mb-2 text-sm font-medium">Amenities</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {['wifi', 'parking', 'pool', 'tv', 'kitchen'].map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2 font-normal">
                    <input
                      type="checkbox"
                      value={amenity}
                      checked={localFilters.amenities.includes(amenity)}
                      onChange={handleAmenityChange}
                      className="rounded text-rose-500 focus:ring-rose-400"
                    />
                    <span className="capitalize">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-rose-500 text-white font-semibold rounded-md hover:bg-rose-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}


        {/* Property Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <PropertyCard
              key={listing._id || listing.id}
              listing={listing}
              onClick={() => navigate(`/property/${listing._id  || listing.id}`)}
            />
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;