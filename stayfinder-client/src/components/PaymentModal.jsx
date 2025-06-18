import React, { useState, useContext } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL;

const PaymentModal = ({ isOpen, onClose, property, checkIn, checkOut, guests }) => {
  const navigate = useNavigate();
  const { token } = useContext(AppContext);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    return cleaned.length < 3 ? cleaned : cleaned.slice(0, 2) + '/' + cleaned.slice(2);
  };

  const isValidCard = (number) => {
    const cleaned = number.replace(/\D/g, '');
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    const cleanedCard = cardNumber.replace(/\D/g, '');

    if (!isValidCard(cleanedCard)) {
      setError('Invalid card number');
      return;
    }

    if (!expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      setError('Invalid expiry (MM/YY)');
      return;
    }

    if (!cvv.match(/^\d{3,4}$/)) {
      setError('Invalid CVV');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: property._id,
          checkIn,
          checkOut,
          guests,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Booking failed');
        setIsProcessing(false);
        return;
      }

      // Success
      setIsProcessing(false);
      onClose();
      navigate(`/booking-confirmation/${data.booking._id}`);
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Payment for {property?.title}</h2>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              className="w-full border px-3 py-2 rounded-lg"
              disabled={isProcessing}
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Expiry</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                className="w-full border px-3 py-2 rounded-lg"
                disabled={isProcessing}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">CVV</label>
              <input
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                className="w-full border px-3 py-2 rounded-lg"
                disabled={isProcessing}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-rose-500 text-white py-2 rounded-lg hover:bg-rose-600 transition disabled:opacity-50"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </div>
            ) : (
              'Pay Now'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
