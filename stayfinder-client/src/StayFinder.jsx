import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import PropertyDetailsPage from './components/PropertyDetailsPage';
import AuthModal from './components/AuthModal';

const API_URL = import.meta.env.VITE_API_URL;

const StayFinder = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedListing, setSelectedListing] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredListings, setFilteredListings] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/listings?search=${searchQuery}`);
        const data = await res.json();
        setFilteredListings(data.listings || []);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };

    const timeout = setTimeout(fetchListings, 200);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header {...{ searchQuery, setSearchQuery, user, setUser, setIsAuthModalOpen, setAuthMode, isMenuOpen, setIsMenuOpen, setCurrentPage }} />
      {currentPage === 'home' && <HomePage {...{ searchQuery, setSearchQuery, filteredListings, setSelectedListing, setCurrentPage }} />}
      {currentPage === 'details' && <PropertyDetailsPage {...{ selectedListing, setCurrentPage, user, setIsAuthModalOpen, setAuthMode }} />}
      <AuthModal {...{ isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode, setUser }} />
    </div>
  );
};

export default StayFinder;
