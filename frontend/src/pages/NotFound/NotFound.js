import React from 'react';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-civisafe-50 to-purple-100">
    <h1 className="text-6xl font-bold text-civisafe-600 mb-4">404</h1>
    <p className="text-2xl text-gray-700 mb-8">Page Not Found</p>
    <a href="/" className="px-6 py-3 bg-civisafe-600 text-white rounded-xl font-semibold hover:bg-civisafe-700 transition-colors">Go Home</a>
  </div>
);

export default NotFound; 