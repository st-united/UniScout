import ViewUniversity from './viewuniversity';
import Footer from '../layout/Footer';
import Navbar from '../layout/Navbar';

const HomePage = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <main className='flex-grow p-4 mx-auto w-full'>
        <ViewUniversity />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
