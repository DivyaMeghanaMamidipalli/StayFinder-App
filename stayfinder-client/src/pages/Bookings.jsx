import React, { useEffect, useState, useContext } from 'react';
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
        const endpoint =
          user.role === 'host' ? '/api/host/bookings' : '/api/bookings';

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

  if (loading) return <div className="p-6">Loading bookings...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (bookings.length === 0) return <div className="p-6">No bookings found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Your Bookings</h2>
      <ul className="space-y-4">
        {bookings.map((booking) => (
          <li key={booking._id} className="border p-4 rounded shadow-sm">
            <h3 className="font-semibold text-lg">
              {booking.listing?.title || 'Listing Removed'}
            </h3>
            <p className="text-sm text-gray-600">
              {user.role === 'host' ? `Guest: ${booking.guest.name}` : `Host: ${booking.listing?.host?.name}`}
            </p>
            <p className="text-sm text-gray-600">
              {new Date(booking.checkIn).toLocaleDateString()} -{' '}
              {new Date(booking.checkOut).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Guests: {booking.guests} | Status: {booking.status}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Bookings;