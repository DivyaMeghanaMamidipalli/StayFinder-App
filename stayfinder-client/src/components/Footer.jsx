import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 ">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-sm text-gray-600 text-center">
        <p>&copy; {new Date().getFullYear()} StayFinder. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;