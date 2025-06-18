import  { useEffect,createContext, useState} from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [listings, setListings] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);

      fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        });
    }
  }, []);
  

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        listings,
        setListings,
        filters,
        setFilters,
        loading,
        setLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
