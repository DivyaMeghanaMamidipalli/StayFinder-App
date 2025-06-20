import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { Search, Filter, XCircle } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { AppContext } from '../context/AppContext';

// --- NEW ---
// Custom hook to manage listings data fetching and filtering
// This simplifies the Home component and centralizes data logic.
const useListingsData = () => {
  const { listings, setFilters, user } = useContext(AppContext);

  // The backend does the heavy lifting for filtering.
  // This client-side filter is now only for the special case of a host viewing their own properties.
  const filteredListings = React.useMemo(() => {
    if (user?.role === 'host') {
      return listings.filter(listing => {
        const hostId = typeof listing.host === 'object' && listing.host !== null ? listing.host._id : listing.host;
        return hostId === user.id;
      });
    }
    return listings;
  }, [listings, user]);

  return { filteredListings, setFilters, user };
};


// Map styles
const mapContainerStyle = {
  width: '100%',
  height: '100%', // Map will fill its container
};

const centerDefault = {
  lat: 37.7749,
  lng: -122.4194,
};

const GOOGLE_MAPS_API = import.meta.env.VITE_GOOGLE_MAP_API_KEY;


const Home = () => {
  const navigate = useNavigate();
  const { filteredListings, setFilters, user } = useListingsData(); // Using the new custom hook
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [mapCenter, setMapCenter] = useState(centerDefault);
  
  // --- UPDATED ---
  // Local state for all filters, including new ones for price and date
  const [localFilters, setLocalFilters] = useState({
    guests: '',
    location: '',
    amenities: [],
    minPrice: '',
    maxPrice: '',
    checkIn: '',
    checkOut: '',
  });

  const location = searchParams.get('location') || '';

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API,
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

  // --- UPDATED ---
  // Apply all filters to the global context and update URL
  const applyFilters = () => {
    const filtersToApply = {
      guests: localFilters.guests,
      location: localFilters.location,
      amenities: localFilters.amenities.join(','),
      minPrice: localFilters.minPrice,
      maxPrice: localFilters.maxPrice,
      checkIn: localFilters.checkIn,
      checkOut: localFilters.checkOut,
    };
    // Remove empty filters before setting them
    Object.keys(filtersToApply).forEach(key => {
      if (!filtersToApply[key]) {
        delete filtersToApply[key];
      }
    });

    setFilters(filtersToApply);
    setSearchParams(localFilters.location ? { location: localFilters.location } : {});
    setShowFilters(false);
  };
  
  // --- UPDATED ---
  // Clear all filters, including the new ones
  const clearFilters = () => {
    setFilters({});
    setLocalFilters({
      guests: '',
      location: '',
      amenities: [],
      minPrice: '',
      maxPrice: '',
      checkIn: '',
      checkOut: '',
    });
    setSearchParams({});
    setMapCenter(centerDefault);
  };

  const geocodeLocation = useCallback(async () => {
    if (!location || !isLoaded) return;
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: location }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          setMapCenter({ lat: lat(), lng: lng() });
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
          setMapCenter(centerDefault); // Reset if location not found
        }
      });
    } catch (error) {
      console.error("Error in geocoding: ", error);
    }
  }, [location, isLoaded]);

  useEffect(() => {
    geocodeLocation();
  }, [geocodeLocation]);

  // Calculate active filter count for the UI
  const activeFilterCount = Object.values(localFilters).filter(value => 
    Array.isArray(value) ? value.length > 0 : value !== ''
  ).length;

  if (!isLoaded) return <div className="p-10 text-center">Loading Maps...</div>;

  // --- NEW LAYOUT ---
  // Determine if the map should be shown based on location search
  const showMap = !!location;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - The map has been removed from here */}
      <div className="relative bg-gradient-to-r from-rose-500 to-pink-600 overflow-hidden py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center space-y-6">
          <div className="text-white max-w-2xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {user?.role === 'host'
                ? 'Your Properties'
                : 'Find Your Perfect Stay'}
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              {user?.role === 'host'
                ? 'Manage your properties and bookings.'
                : 'Discover unique places to stay around the world.'}
            </p>
          </div>
        </div>
      </div>

      {/* --- NEW LAYOUT CONTAINER --- */}
      {/* This flex container manages the side-by-side layout on large screens */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:flex lg:gap-8">
        
        {/* Left Column: Filters and Listings */}
        <div className={showMap ? "lg:w-1/2" : "w-full"}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {location ? `Stays in "${location}"` : 'Featured Stays'}
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
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* --- UPDATED FILTER PANEL --- */}
          {showFilters && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                {/* Location & Guests */}
                <div>
                  <label className="block mb-1 text-sm font-medium">Location</label>
                  <input type="text" value={localFilters.location} onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })} placeholder="City or Area" className="w-full px-3 py-2 border rounded-md"/>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Guests</label>
                  <input type="number" min="1" value={localFilters.guests} onChange={(e) => setLocalFilters({ ...localFilters, guests: e.target.value })} className="w-full px-3 py-2 border rounded-md"/>
                </div>

                {/* Price Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium">Min Price</label>
                    <input type="number" min="0" value={localFilters.minPrice} onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })} placeholder="$" className="w-full px-3 py-2 border rounded-md"/>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">Max Price</label>
                    <input type="number" min="0" value={localFilters.maxPrice} onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })} placeholder="$" className="w-full px-3 py-2 border rounded-md"/>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Check-in</label>
                        <input type="date" value={localFilters.checkIn} onChange={(e) => setLocalFilters({...localFilters, checkIn: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Check-out</label>
                        <input type="date" value={localFilters.checkOut} onChange={(e) => setLocalFilters({...localFilters, checkOut: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"/>
                    </div>
                </div>

              </div>
              {/* Amenities - Moved to its own row for better layout */}
              <div>
                <label className="block mb-1 text-sm font-medium">Amenities</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {['wifi', 'parking', 'pool', 'tv', 'kitchen', 'air_conditioning'].map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" value={amenity} checked={localFilters.amenities.includes(amenity)} onChange={handleAmenityChange} className="rounded"/>
                        <span>{amenity.replace('_', ' ')}</span>
                    </label>
                    ))}
                </div>
              </div>

              <button onClick={applyFilters} className="mt-4 px-6 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition">
                Apply Filters
              </button>
            </div>
          )}

          {/* Property Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredListings.map((listing) => (
              <PropertyCard
                key={listing._id}
                listing={listing}
                onClick={() => navigate(`/property/${listing._id}`)}
              />
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-16 col-span-full">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* --- NEW: MOBILE MAP --- */}
          {/* This map is only visible on small screens (block) and hidden on large screens (lg:hidden) */}
          {showMap && (
            <div className="lg:hidden mt-8 h-96 rounded-lg overflow-hidden shadow-lg">
              <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={12}>
                  {/* You can add markers here if needed */}
              </GoogleMap>
            </div>
          )}
        </div>

        {/* --- NEW: DESKTOP MAP --- */}
        {/* Right Column: Map. Only shown when a location is active */}
        {showMap && (
            <div className="hidden lg:block lg:w-1/2 h-[calc(100vh-10rem)] sticky top-24">
                <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
                    <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={12}>
                        {/* It's good practice to geocode and store lat/lng with listings for performance */}
                        {/* This part assumes listings have lat/lng properties */}
                    </GoogleMap>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Home;