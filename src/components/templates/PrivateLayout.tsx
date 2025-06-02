import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const PrivateLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/app" className="text-xl font-bold text-gray-900">UniScout</Link>
            <div className="space-x-4">
              <Link to="/app/profile" className="text-gray-600 hover:text-gray-900">Profile</Link>
              <button className="text-gray-600 hover:text-gray-900">Logout</button>
            </div>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">
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

export default PrivateLayout; 