import  { createContext, useState} from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);

  

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
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
