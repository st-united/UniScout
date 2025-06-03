import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Chatbot from '@app/components/common/Chatbot';

const Layout = () => {
  return (
    <div className='flex flex-col min-h-screen bg-background'>
      <Navbar />

      <div className='flex-1'>
        <main className='flex-1 p-4 md:p-6 lg:p-8 overflow-auto'>
          <Outlet />
        </main>
      </div>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default Layout;
