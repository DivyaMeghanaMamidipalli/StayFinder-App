import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL;

const Bookings = () => {
  const { token, user } = useContext(AppContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const endpoint = '/api/bookings';

        const res = await fetch(`${API_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch bookings');

        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchBookings();
  }, [user, token]);

  const handleCancel = async (bookingId, e) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel booking');

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        )
      );
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading bookings...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6">Your Trips</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800">No trips booked... yet!</h2>
          <p className="text-gray-600 mt-2 mb-4">Time to dust off your bags and start planning your next adventure.</p>
          <Link to="/" className="px-6 py-2 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600">
            Start Exploring
          </Link>
        </div>
      ) : (
        <ul className="space-y-6">
          {bookings.map((booking) => {
            const isListingAvailable = booking.listing;
            
            return (
              <li key={booking._id} className="block group">
                <Link 
                  to={isListingAvailable ? `/property/${booking.listing._id}` : '#'}
                  className={`bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row transition-all duration-300 ${isListingAvailable ? 'hover:shadow-xl hover:border-gray-300' : 'cursor-default'}`}
                >
                  {isListingAvailable ? (
                    <img 
                      src={booking.listing.images[0]} 
                      alt={booking.listing.title}
                      className="w-full md:w-56 h-48 md:h-auto object-cover"
                    />
                  ) : (
                    <div className="w-full md:w-56 h-48 md:h-full bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">No Image</p>
                    </div>
                  )}

                  <div className="p-4 flex flex-col flex-grow">
                    <div>
                      <h3 className="font-bold text-xl text-gray-800 group-hover:text-rose-600 transition-colors">
                        {booking.listing?.title || 'Listing Removed'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {user.role === 'host' ? `Booked by: ${booking.guest.name}` : `Hosted by: ${booking.listing?.host?.name || 'Unknown Host'}`}
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {new Date(booking.checkIn).toLocaleDateString()} -{' '}
                        {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="mt-auto pt-4 flex justify-between items-end">
                      <div className="text-sm">
                        <span className={`font-bold py-1 px-2 rounded-full text-xs capitalize ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      {booking.status !== 'cancelled' && user.role === 'guest' && (
                        <button
                          onClick={(e) => handleCancel(booking._id, e)}
                          className="px-4 py-1 bg-red-100 text-red-700 hover:bg-red-500 hover:text-white text-sm font-semibold rounded-md z-10 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Bookings;