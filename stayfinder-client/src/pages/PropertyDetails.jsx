import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Heart, Star, MapPin, User,
  Users, Home as HomeIcon, Wifi,DoorOpen
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import PaymentModal from '../components/PaymentModal';

const API_URL = import.meta.env.VITE_API_URL;

const PropertyDetails = () => {
  const { listings, user, setIsAuthModalOpen, setAuthMode } = useContext(AppContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedListing = listings.find(listing => listing._id === id);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!selectedListing) {
      // Could add fetch logic here if listings not in context
    }
  }, [selectedListing]);

  if (!selectedListing) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % selectedListing.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + selectedListing.images.length) % selectedListing.images.length);

  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
    : 0;

  const total = selectedListing.price * nights + 29;

  const handleBooking = () => {
    if (!checkIn || !checkOut) {
      setFormError('Please select check-in and check-out dates');
      return;
    }

    if (!user) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    setFormError('');
    setIsPaymentOpen(true);
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
                  src={selectedListing.images[currentImageIndex]}
                  alt={selectedListing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {selectedListing.images.length > 1 && (
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
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedListing.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" /><span>{selectedListing.location}</span></div>
                    <div className="flex items-center"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" /><span>{selectedListing.rating} ({selectedListing.reviews} reviews)</span></div>
                  </div>
                </div>
                <button className="p-2 border border-gray-300 rounded-full hover:shadow-md"><Heart className="w-5 h-5" /></button>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-6">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center"><User className="w-6 h-6 text-gray-600" /></div>
                <div>
                  <p className="font-semibold text-gray-900">Hosted by {selectedListing.host.name}</p>
                  <p className="text-sm text-gray-600">Superhost • 2 years hosting</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg"><Users className="w-6 h-6 mx-auto mb-2 text-gray-600" /><p className="font-semibold">{selectedListing.guests}</p><p className="text-sm text-gray-600">Guests</p></div>
                <div className="text-center p-4 bg-gray-50 rounded-lg"><HomeIcon className="w-6 h-6 mx-auto mb-2 text-gray-600" /><p className="font-semibold">{selectedListing.bedrooms}</p><p className="text-sm text-gray-600">Bedrooms</p></div>
                <div className="text-center p-4 bg-gray-50 rounded-lg"><DoorOpen className="w-6 h-6 mx-auto mb-2 text-gray-600 " /><p className="font-semibold">{selectedListing.bathrooms}</p><p className="text-sm text-gray-600">Bathrooms</p></div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">About this place</h3>
                <p className="text-gray-700 leading-relaxed">{selectedListing.description}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedListing.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Star className="w-4 h-4" />
                      <span className="capitalize">{amenity.replace('_', ' ')}</span>
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
                  <span className="text-2xl font-bold">${selectedListing.price}</span>
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
                      {[...Array(selectedListing.guests)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} {i + 1 === 1 ? 'guest' : 'guests'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button onClick={handleBooking} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                  {user ? 'Reserve' : 'Login to Book'}
                </button>
                {formError && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{formError}</p>
                )}

                {nights > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">${selectedListing.price} × {nights} nights</span>
                      <span className="font-medium">${selectedListing.price * nights}</span>
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
        property={selectedListing}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
      />
    </div>
  );
};

export default PropertyDetails;