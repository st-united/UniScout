import { Contact } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className='bg-white shadow-md z-50'>
      <div className='md:mx-16 mx-8'>
        <div className='flex justify-between h-16'>
          <div className='flex items-center'>
            <div className='text-2xl font-bold text-orange-500'>DEV PLUS</div>
          </div>
          <div className='flex items-center'>
            <button className='inline-flex items-center px-4 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-500 hover:text-white transition-colors'>
              <Contact className='w-5 h-5 mr-2' />
              Contact
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
