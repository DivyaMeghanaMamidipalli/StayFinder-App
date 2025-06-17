import React, { useState } from 'react';
import { amenityIcons } from '../utils/icons';
import {ChevronLeft, ChevronRight,Heart,Star,MapPin,User,Users,Home,Wifi, Car, Coffee, Tv} from 'lucide-react';


const PropertyDetailsPage = ({selectedListing, setCurrentPage, user,setIsAuthModalOpen,setAuthMode}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);

    if (!selectedListing) return <div>Loading...</div>;

    const nextImage = () => {
      setCurrentImageIndex((prev) => 
        prev === selectedListing.images.length - 1 ? 0 : prev + 1
      );
    };

    const prevImage = () => {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedListing.images.length - 1 : prev - 1
      );
    };

    const handleBooking = () => {
      if (!checkIn || !checkOut) {
        alert('Please select check-in and check-out dates');
        return;
      }
      if (!user) {
        setAuthMode('login');
        setIsAuthModalOpen(true);
        return;
      }
      alert(`Booking confirmed for ${selectedListing.title}!`);
    };

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to listings</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
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
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {selectedListing.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Property Info */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedListing.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{selectedListing.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{selectedListing.rating} ({selectedListing.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 border border-gray-300 rounded-full hover:shadow-md">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>

                {/* Host Info */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-6">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Hosted by {selectedListing.host}</p>
                    <p className="text-sm text-gray-600">Superhost • 2 years hosting</p>
                  </div>
                </div>

                {/* Property Details */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Users className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <p className="font-semibold">{selectedListing.guests}</p>
                    <p className="text-sm text-gray-600">Guests</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Home className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <p className="font-semibold">{selectedListing.bedrooms}</p>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 mx-auto mb-2 bg-gray-600 rounded" />
                    <p className="font-semibold">{selectedListing.bathrooms}</p>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">About this place</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedListing.description}</p>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedListing.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-3">
                        {amenityIcons[amenity] || <Wifi className="w-4 h-4" />}
                        <span className="capitalize">{amenity.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Check-in
                        </label>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Check-out
                        </label>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Guests
                      </label>
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        {[...Array(selectedListing.guests)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i + 1 === 1 ? 'guest' : 'guests'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    {user ? 'Reserve' : 'Login to Book'}
                  </button>

                  {checkIn && checkOut && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">
                          ${selectedListing.price} × {Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))} nights
                        </span>
                        <span className="font-medium">
                          ${selectedListing.price * Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Service fee</span>
                        <span className="font-medium">$29</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold">
                          ${selectedListing.price * Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) + 29}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default PropertyDetailsPage;