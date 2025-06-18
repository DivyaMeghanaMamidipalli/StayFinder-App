import { useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL;
export const useListings = () => {
  const { setListings, filters, setLoading } = useContext(AppContext);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams(filters).toString();
        const res = await fetch(`${API_URL}/api/listings?${query}`);
        const data = await res.json();

        // ✅ Ensure data is an array
        if (Array.isArray(data)) {
          setListings(data);
        } else if (Array.isArray(data.listings)) {
          setListings(data.listings);
        } else {
          console.error('API returned unexpected structure:', data);
          setListings([]); // fallback to empty array
        }
      } catch (err) {
        console.error('Failed to fetch listings', err);
        setListings([]); // fallback to empty array
      }
      setLoading(false);
    };

    fetchListings();
  }, [filters]);

  return null;
};
