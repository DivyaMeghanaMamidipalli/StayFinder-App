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

        if (Array.isArray(data)) {
          setListings(data);
        } else if (Array.isArray(data.listings)) {
          setListings(data.listings);
        } else {
          console.error('API returned unexpected structure:', data);
          setListings([]); 
        }
      } catch (err) {
        console.error('Failed to fetch listings', err);
        setListings([]); 
      }
      setLoading(false);
    };

    fetchListings();
  }, [filters]);

  return null;
};
