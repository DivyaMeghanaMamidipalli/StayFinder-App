import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const BecomeHost = () => {
  const { user, token, setUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [hostListings, setHostListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchListings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/host/listings`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) setHostListings(data);
        else console.error(data.error);
      } catch (err) {
        console.error('Error fetching host listings:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user.role === 'host') fetchListings();
    else setLoading(false);
  }, [user]);

  const becomeHost = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/promote`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'host' })
      });
      const data = await res.json();
      if (res.ok) {
        setUser({ ...user, role: 'host' });
      } else {
        setError(data.error || 'Could not update role');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to become host');
    }
  };

  if (!user) return <div className="p-6">You must be logged in to become a host.</div>;

  if (loading) return <div className="p-6">Loading...</div>;

  if (user.role === 'host') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome, Host!</h2>
        <button
          onClick={() => navigate('/host')}
          className="bg-rose-500 text-white px-6 py-2 rounded mb-6"
        >
          Create New Listing
        </button>
        <h3 className="text-xl font-semibold mb-3">Your Properties</h3>
        {hostListings.length === 0 ? (
          <p>You haven't added any Properties yet.</p>
        ) : (
          <ul className="space-y-2">
            {hostListings.map(listing => (
              <li key={listing._id} className="border p-4 rounded shadow-sm">
                <h4 className="font-bold text-lg">{listing.title}</h4>
                <p className="text-gray-600">{listing.location} - Rs.{listing.price}/night</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Become a Host</h2>
      <p className="text-gray-600 mb-6">
        Share your space and earn income by hosting travelers from around the world.
      </p>
      {error && <p className="text-red-600 mb-4 font-medium">{error}</p>}
      <button
        onClick={becomeHost}
        className="bg-rose-500 text-white px-6 py-3 rounded hover:bg-rose-600 transition"
      >
        Confirm & Become a Host
      </button>
    </div>
  );
};

export default BecomeHost;
