import { Contact } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className='bg-white shadow-md z-50 sticky top-0'>
      <div className='md:mx-16 mx-8'>
        <div className='flex justify-between h-16'>
          <div className='flex items-center'>
            <div className='text-2xl font-bold text-orange-500'>DEV PLUS</div>
          </div>
          <div className='flex items-center'>
            <button className='inline-flex items-center px-4 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-500 hover:text-white transition-colors'>
              <Contact className='w-5 h-5 mr-2' onClick={() => navigate('/contact')} />
              Contact
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
