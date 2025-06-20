import React, { useState, useContext, useEffect } from 'react';
import { X, Check } from 'lucide-react'; 
import { AppContext } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL;

// --- Helper component for validation items ---
const ValidationCriteria = ({ isValid, children }) => (
  <li className={`flex items-center text-sm ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
    {isValid ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
    {children}
  </li>
);

const AuthModal = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setToken,
    setAuthMode,
    setUser
  } = useContext(AppContext);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasSpecial: false,
  });
  
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authMode === 'register') {
      const { password } = formData;
      const minLength = password.length >= 8;
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      setPasswordValidation({ minLength, hasUpper, hasLower, hasSpecial });
    }
  }, [formData.password, authMode]);


  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  const { name, email, password, confirmPassword } = formData;

  if (authMode === 'register') {
    const isPasswordValid = Object.values(passwordValidation).every(Boolean);
    if (!isPasswordValid) {
      setError('Password does not meet all the requirements.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
  }

  try {
    const endpoint = authMode === 'login' ? 'login' : 'register';
    const payload = authMode === 'login'
      ? { email: email.toLowerCase(), password }
      : { name, email: email.toLowerCase(), password };

    const res = await fetch(`${API_URL}/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      const errorMessage = data.error || data.message || 'Authentication failed';

      const userNotFoundErrors = [
        'user not found',
        'email not registered',
        'no user found',
      ];

      if (
        authMode === 'login' &&
        (userNotFoundErrors.some(msg => errorMessage.toLowerCase().includes(msg)) || res.status === 404)
      ) {
        setAuthMode('register');
        setError('Email not found. Please register to create an account.'); // More specific error message
        setIsLoading(false);
        return;
      }
      throw new Error(errorMessage);
    }

    setUser(data.user);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setIsAuthModalOpen(false);
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });

  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};

  const handleModeSwitch = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setError('');
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {authMode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <button onClick={() => setIsAuthModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              // --- Show criteria on focus for register mode ---
              onFocus={() => authMode === 'register' && setShowPasswordCriteria(true)}
              onBlur={() => setShowPasswordCriteria(false)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              disabled={isLoading}
            />
          </div>
          
          {/* --- Password Criteria Display --- */}
          {authMode === 'register' && showPasswordCriteria && (
            <ul className="mt-2 space-y-1 p-3 bg-gray-50 rounded-md">
              <ValidationCriteria isValid={passwordValidation.minLength}>
                At least 8 characters long
              </ValidationCriteria>
              <ValidationCriteria isValid={passwordValidation.hasLower}>
                Contains a lowercase letter (a-z)
              </ValidationCriteria>
              <ValidationCriteria isValid={passwordValidation.hasUpper}>
                Contains an uppercase letter (A-Z)
              </ValidationCriteria>
              <ValidationCriteria isValid={passwordValidation.hasSpecial}>
                Contains a special character (!@#$...)
              </ValidationCriteria>
            </ul>
          )}

          {authMode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                disabled={isLoading}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {authMode === 'login' ? 'Logging in...' : 'Signing up...'}
              </div>
            ) : (
              authMode === 'login' ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={handleModeSwitch}
              className="ml-1 text-rose-500 hover:text-rose-600 font-medium"
              disabled={isLoading}
            >
              {authMode === 'login' ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;