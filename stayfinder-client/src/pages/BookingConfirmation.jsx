import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Home, Calendar, Users } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL;

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const { token } = useContext(AppContext);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bookingId || !token) {
      setLoading(false);
      setError('Missing booking ID or authentication token.');
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch booking details.');
        }

        setBooking(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, token]);

  if (loading) {
    return <div className="p-10 text-center">Loading your confirmation...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-600">Error: {error}</div>;
  }

  if (!booking) {
    return <div className="p-10 text-center">Booking not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">Thank you! Your trip is scheduled. A confirmation has been sent to your email.</p>
        
        <div className="text-left border border-gray-200 rounded-lg p-4 mb-6">
          <h2 className="font-bold text-xl mb-4">Your Trip Details</h2>
          {booking.listing ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <img 
                src={booking.listing.images[0]} 
                alt={booking.listing.title} 
                className="w-full sm:w-40 h-32 object-cover rounded-lg"
              />
              <div className="flex-grow">
                <p className="font-semibold text-lg text-gray-800">{booking.listing.title}</p>
                <p className="text-sm text-gray-500 mb-3">{booking.listing.location}</p>
                
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{booking.guests} {booking.guests > 1 ? 'guests' : 'guest'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>Listing details not available.</p>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Booking ID: <span className="font-mono bg-gray-100 p-1 rounded">{booking._id}</span>
        </p>

        <Link to="/bookings" className="inline-block px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition-colors">
          View All My Bookings
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmation;