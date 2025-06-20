import { useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import {mockListings} from '../data/mockListings';

const API_URL = import.meta.env.VITE_API_URL;
export const useListings = () => {
  const { setListings, filters, setLoading } = useContext(AppContext);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams(filters).toString();
        const res = await fetch(`${API_URL}/api/listings?${query}`);

        // If server is running but returns error (like 500, 404), still throw
        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();

        if (Array.isArray(data)) {
          setListings(data);
        } else if (Array.isArray(data.listings)) {
          setListings(data.listings);
        } else {
          console.error('Unexpected data structure from API:', data);
          setListings([]);
        }
      } catch (err) {
        // Only show mock data if the server is NOT reachable (network error)
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('ERR_CONNECTION_REFUSED')) {
          console.warn('Server is offline — showing mock data');
          setListings(mockListings);
        } else {
          console.error('Error fetching listings:', err.message);
          setListings([]); 
        }
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filters]);

  return null;
};
