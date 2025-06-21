import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Heart, Star, MapPin, User,
  Users, Home as HomeIcon, Wifi, DoorOpen
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import PaymentModal from '../components/PaymentModal';

const API_URL = import.meta.env.VITE_API_URL;

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500"></div>
  </div>
);

const ErrorScreen = ({ message }) => (
  <div className="flex items-center justify-center h-screen p-4">
    <div className="p-10 text-center bg-red-50 border border-red-200 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-red-700">Something went wrong</h2>
      <p className="mt-2 text-red-600">{message || "Could not load the property details."}</p>
    </div>
  </div>
);


const PropertyDetails = () => {
  const { listings, user, token, setIsAuthModalOpen, setAuthMode } = useContext(AppContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchPropertyData = async () => {
      const listingFromContext = listings.find((listing) => listing._id === id);

      if (listingFromContext) {
        setProperty(listingFromContext);
        setIsLoading(false);
      } else {
        try {
          const res = await fetch(`${API_URL}/api/listings/${id}`);
          if (!res.ok) {
            throw new Error(`Property not found or server error (status: ${res.status})`);
          }
          const data = await res.json();
          setProperty(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPropertyData();
  }, [id, listings]); 

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }
  
  if (!property) {
    return <ErrorScreen message="This property could not be found." />;
  }

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);

  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
    : 0;

  const total = property.price * nights + 29;

  const handleBooking = async () => {
    setFormError('');
    setIsChecking(true);

    if (!checkIn || !checkOut) {
      setFormError('Please select check-in and check-out dates.');
      setIsChecking(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate < today) {
      setFormError('Check-in date cannot be in the past.');
      setIsChecking(false);
      return;
    }

    if (checkOutDate <= checkInDate) {
      setFormError('Check-out date must be after the check-in date.');
      setIsChecking(false);
      return;
    }

    if (!user) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      setIsChecking(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/bookings/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          listingId: property._id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'An error occurred.');
      }

      setIsPaymentOpen(true);

    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Properties</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative mb-8">
              <div className="aspect-[16/10] rounded-xl overflow-hidden">
                <img
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {property.images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" /><span>{property.location}</span></div>
                    <div className="flex items-center"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" /><span>{property.rating} ({property.reviews} reviews)</span></div>
                  </div>
                </div>
                <button className="p-2 border border-gray-300 rounded-full hover:shadow-md"><Heart className="w-5 h-5" /></button>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-6">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center"><User className="w-6 h-6 text-gray-600" /></div>
                <div>
                  <p className="font-semibold text-gray-900">Hosted by {property.host.name || property.host}</p>
                  <p className="text-sm text-gray-600">Superhost • 2 years hosting</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg"><Users className="w-6 h-6 mx-auto mb-2 text-gray-600" /><p className="font-semibold">{property.guests}</p><p className="text-sm text-gray-600">Guests</p></div>
                <div className="text-center p-4 bg-gray-50 rounded-lg"><HomeIcon className="w-6 h-6 mx-auto mb-2 text-gray-600" /><p className="font-semibold">{property.bedrooms}</p><p className="text-sm text-gray-600">Bedrooms</p></div>
                <div className="text-center p-4 bg-gray-50 rounded-lg"><DoorOpen className="w-6 h-6 mx-auto mb-2 text-gray-600 " /><p className="font-semibold">{property.bathrooms}</p><p className="text-sm text-gray-600">Bathrooms</p></div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">About this place</h3>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Star className="w-4 h-4" />
                      <span className="capitalize">{amenity.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
                <div className="flex items-baseline space-x-2 mb-6">
                  <span className="text-2xl font-bold">${property.price}</span>
                  <span className="text-gray-600">/ night</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                      <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                      <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                    <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg">
                      {[...Array(property.guests)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} {i + 1 === 1 ? 'guest' : 'guests'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={isChecking}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-rose-300 disabled:cursor-not-allowed"
                >
                  {isChecking ? 'Checking...' : (user ? 'Reserve' : 'Login to Book')}
                </button>
                {formError && (
                  <p className="mt-2 text-sm text-center text-red-600 font-medium">{formError}</p>
                )}

                {nights > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">${property.price} × {nights} nights</span>
                      <span className="font-medium">${property.price * nights}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Service fee</span>
                      <span className="font-medium">$29</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold">${total}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        property={property}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
      />
    </div>
  );
};

export default PropertyDetails;