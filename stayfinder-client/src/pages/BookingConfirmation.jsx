import React from 'react';
import { useParams } from 'react-router-dom';

const BookingConfirmation = () => {
  const { bookingId } = useParams();

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Booking Confirmed!</h1>
      <p className="text-gray-700 mb-2">Booking ID: {bookingId}</p>
    </div>
  );
};

export default BookingConfirmation;
