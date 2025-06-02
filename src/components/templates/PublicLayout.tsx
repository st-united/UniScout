import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="text-xl font-bold text-gray-900">UniScout</a>
            <div className="space-x-4">
              <a href="/login" className="text-gray-600 hover:text-gray-900">Login</a>
            </div>
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="bg-white shadow mt-8">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-600">© 2024 UniScout. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout; 