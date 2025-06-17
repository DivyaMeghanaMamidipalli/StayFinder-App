import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import PropertyDetailsPage from './components/PropertyDetailsPage';
import AuthModal from './components/AuthModal';
import { mockListings } from './data/mockListings';

const StayFinder = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedListing, setSelectedListing] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredListings, setFilteredListings] = useState(mockListings);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setFilteredListings(mockListings);
      } else {
        const filtered = mockListings.filter(listing =>
          listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredListings(filtered);
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header {...{ searchQuery, setSearchQuery, user, setUser, setIsAuthModalOpen, setAuthMode, isMenuOpen, setIsMenuOpen, setCurrentPage }} />
      {currentPage === 'home' && <HomePage setSearchQuery={setSearchQuery} filteredListings={filteredListings} setSelectedListing={setSelectedListing} setCurrentPage={setCurrentPage} />}
      {currentPage === 'details' && <PropertyDetailsPage selectedListing={selectedListing} setCurrentPage={setCurrentPage} user={user} setIsAuthModalOpen={setIsAuthModalOpen} setAuthMode={setAuthMode} />}
      <AuthModal {...{ isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode, setUser }} />
    </div>
  );
};

export default StayFinder;