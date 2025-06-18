import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import PropertyDetails from './pages/PropertyDetails';
import BookingConfirmation from './pages/BookingConfirmation';
import AuthModal from './components/AuthModal';
import Footer  from './components/Footer';
import { AppProvider } from './context/AppContext';

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
        </Routes>
        <Footer />
        <AuthModal />
        
      </Router>
    </AppProvider>
  );
};

export default App;
