import React, { useState, useContext } from 'react';
import { Search, Menu, User, X, Home } from 'lucide-react';
import { useNavigate, useLocation,useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, setUser, setIsAuthModalOpen, setAuthMode } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const locationSearch = searchParams.get('location') || '';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Home className="w-8 h-8 text-rose-500" />
            <span className="text-xl font-bold text-gray-900">StayFinder</span>
          </div>

          {/* Desktop Search */}
          {location.pathname === '/' && (
            <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search destinations, properties..."
                  value={locationSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    const newParams = new URLSearchParams(searchParams);
                    if (value) {
                      newParams.set('location', value);
                    } else {
                      newParams.delete('location');
                    }
                    setSearchParams(newParams);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">
              Become a Host
            </button>
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-gray-700">Hi, {user.name}</span>
                <button
                  onClick={() => setUser(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full hover:shadow-md transition-shadow"
              >
                <Menu className="w-4 h-4" />
                <User className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Search */}
        {location.pathname === '/' && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={locationSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    const newParams = new URLSearchParams(searchParams);
                    if (value) {
                      newParams.set('location', value);
                    } else {
                      newParams.delete('location');
                    }
                    setSearchParams(newParams);
                  }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              Become a Host
            </button>
            {user ? (
              <>
                <div className="px-4 py-2 text-gray-700">Hi, {user.name}</div>
                <button
                  onClick={() => setUser(null)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
