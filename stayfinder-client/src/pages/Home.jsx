import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { Search, Filter, XCircle } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { AppContext } from '../context/AppContext';
import { useListings } from '../hooks/useListings';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
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
  const viewMode = searchParams.get('view');

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API,
  });

  useListings();

  const filteredListings = listings.filter((listing) => {
      // If user is a host and is in 'host view' mode, only show their properties.
      if (user?.role === 'host' && viewMode === 'host') {
        const hostId = typeof listing.host === 'object' && listing.host !== null ? listing.host._id : listing.host;
        return hostId === user.id;
      }
      // Otherwise, for guests or hosts in normal view, show all listings from backend.
      return true;
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

  const applyFilters = () => {
    // We only set the location in the URL search params for simplicity and geocoding.
    // All other filters are passed to the context, which the useListings hook will use.
    setSearchParams(localFilters.location ? { location: localFilters.location } : {});
    
    setFilters({
      guests: localFilters.guests,
      location: localFilters.location,
      amenities: localFilters.amenities.join(','),
      startDate: localFilters.startDate,
      endDate: localFilters.endDate,
      minPrice: localFilters.minPrice,
      maxPrice: localFilters.maxPrice,
    });

    setShowFilters(false);
  };

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
    if (!location) {
        // When clearing filters, reset map to default
        setMapCenter(centerDefault);
        return;
    };
    try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_MAPS_API}`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          setMapCenter({ lat, lng });
        }
    } catch (error) {
        console.error("Error geocoding location:", error);
    }
  }, [location, GOOGLE_MAPS_API]);

  useEffect(() => {
    geocodeLocation();
  }, [geocodeLocation]);
  
  // Keep track of the number of *applied* filters, not just local ones
  const { guests, amenities, startDate, endDate, minPrice, maxPrice } = useContext(AppContext).filters;
  const activeFilterCount = [
    guests,
    location,
    amenities,
    startDate,
    endDate,
    minPrice,
    maxPrice,
  ].filter(Boolean).length;


  if (!isLoaded) return <div className="p-10 text-center">Loading ...</div>;

  // --- MAP COMPONENT to avoid repetition ---
  const MapComponent = () => (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={location ? 12 : 9}>
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
  );

  const handleShowAll = () => {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('view');
      setSearchParams(newParams);
    };                          

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Map is REMOVED from here */}
      <div className="relative bg-gradient-to-r from-rose-500 to-pink-600 overflow-hidden py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center space-y-6">
          <div className="text-white max-w-2xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{user?.role === 'host'
                ? 'Manage Your Properties'
                : 'Find Your Perfect Stay'}</h1>
            <p className="text-xl md:text-2xl text-white/90">
              {user?.role === 'host'
                ? 'View, edit, and manage your listings and bookings.'
                : 'Discover unique places to stay around the world.'}
            </p>
          </div>
          {/* MAP IS NO LONGER HERE */}
        </div>
      </div>

      {/* --- NEW LAYOUT: Filters, Listings, and Map --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* --- Flex container for side-by-side layout on desktop --- */}
        <div className="flex flex-col lg:flex-row lg:gap-8">
          
          {/* --- LEFT COLUMN: Filters and Listings --- */}
          <div className={`w-full ${location ? 'lg:w-3/5 xl:w-2/3' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {user?.role === 'host' && viewMode === 'host'
                    ? 'Your Properties'
                    : location
                    ? `Stays in "${location}"`
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
                {user?.role === 'host' && viewMode === 'host' && (
                      <button
                        onClick={handleShowAll}
                        className="px-4 py-2 text-sm bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200"
                      >
                        Show All Properties
                      </button>
                  )}
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Location & Guests */}
                  <div className="xl:col-span-1">
                    <label className="block mb-2 text-sm font-medium">Location</label>
                    <input type="text" value={localFilters.location} onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })} placeholder="e.g. San Francisco" className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div className="xl:col-span-1">
                    <label className="block mb-2 text-sm font-medium">Guests</label>
                    <input type="number" min="1" value={localFilters.guests} onChange={(e) => setLocalFilters({ ...localFilters, guests: e.target.value })} placeholder="Any" className="w-full px-3 py-2 border rounded-md" />
                  </div>
                   {/* Date Filters */}
                  <div className="sm:col-span-2 lg:col-span-2 xl:col-span-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block mb-2 text-sm font-medium">Check-in</label>
                        <input type="date" value={localFilters.startDate} onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value, endDate: '' })} className="w-full px-3 py-2 border rounded-md text-gray-600"/>
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium">Check-out</label>
                        <input type="date" min={localFilters.startDate} value={localFilters.endDate} onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-md text-gray-600" />
                      </div>
                  </div>
                  {/* Price Filters */}
                  <div className="sm:col-span-2 lg:col-span-2 xl:col-span-3 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block mb-2 text-sm font-medium">Min Price</label>
                        <input type="number" min="0" value={localFilters.minPrice} onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })} placeholder="$0" className="w-full px-3 py-2 border rounded-md" />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium">Max Price</label>
                        <input type="number" min={localFilters.minPrice || "0"} value={localFilters.maxPrice} onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })} placeholder="$1000+" className="w-full px-3 py-2 border rounded-md" />
                      </div>
                  </div>
                </div>
                {/* Amenities Filter */}
                <div className="pt-4 border-t">
                  <label className="block mb-2 text-sm font-medium">Amenities</label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {['wifi', 'parking', 'pool', 'tv', 'kitchen'].map((amenity) => (
                      <label key={amenity} className="flex items-center space-x-2 font-normal">
                        <input type="checkbox" value={amenity} checked={localFilters.amenities.includes(amenity)} onChange={handleAmenityChange} className="rounded text-rose-500 focus:ring-rose-400" />
                        <span className="capitalize">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={applyFilters} className="px-6 py-2 bg-rose-500 text-white font-semibold rounded-md hover:bg-rose-600 transition-colors">Apply Filters</button>
                </div>
              </div>
            )}

            {/* Property Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6">
              {filteredListings.map((listing) => (
                <PropertyCard
                  key={listing._id || listing.id}
                  listing={listing}
                  onClick={() => navigate(`/property/${listing._id || listing.id}`)}
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
            
            {/* --- MOBILE MAP: Visible only on small screens --- */}
            {location && (
                <div className="mt-8 lg:hidden w-full h-96 rounded-lg overflow-hidden shadow-lg">
                    <MapComponent />
                </div>
            )}
          </div>

          {/* --- RIGHT COLUMN: Desktop Map (Sticky) --- */}
          {location && (
              <div className="hidden lg:block w-2/5 xl:w-1/3">
                <div className="sticky top-24 h-[calc(100vh-7rem)] rounded-lg overflow-hidden shadow-lg">
                  {isLoaded ? (
                    <MapComponent />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <p className="text-gray-600">Loading Map...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Home;