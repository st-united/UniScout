import ViewUniversity from './viewuniversity';
import Footer from '../layout/Footer';
import Navbar from '../layout/Navbar';
//import UniversityFilter from './UniversityFilter'; // Commented out due to unresolved path
//import ConnectWithUs from '../contact/ConnectWithUs'; // Commented out due to unresolved path
import { mockUniversities } from '@app/components/data/mockData'; // Import full mock data

const HomePage = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <main className='flex-grow p-4 max-w-7xl mx-auto'>
        <ViewUniversity universities={mockUniversities} />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
