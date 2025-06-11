import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { SignIn } from './pages';
import CreateUniversity from './pages/admin/CreateUniversity';
import DashboardPage from './pages/admin/DashboardPage';
import ManagePage from './pages/admin/ManagePage';
import UniversityListPage from './pages/admin/UniversityListPage';
import NotFound from './pages/NotFound/NotFound';
import SignInForm from './pages/SignIn/SignInForm';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Router>
      <div className='flex h-screen bg-gray-100'>
        {/* Only show Sidebar if not on /sign-in */}
        {window.location.pathname !== '/sign-in' && (
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        <div className='flex-1 flex flex-col overflow-hidden'>
          {window.location.pathname !== '/sign-in' && <Header title='Admin Panel' />}
          <main className='flex-1 overflow-auto'>
            <Routes>
              <Route path='/' element={<DashboardPage />} />
              <Route path='/overview' element={<ManagePage />} />
              <Route path='/university' element={<UniversityListPage />} />
              <Route path='/sign-in' element={<SignIn />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
