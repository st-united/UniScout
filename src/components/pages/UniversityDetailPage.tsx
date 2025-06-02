import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Globe, 
  Star, 
  Users, 
  Building, 
  MapPin, 
  ExternalLink,
  Handshake,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUniversity, University } from '../contexts/UniversityContext';
import Loading from '../molecules/common/Loading';

const UniversityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getUniversity } = useUniversity();
  const [university, setUniversity] = useState<University | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const universityData = getUniversity(id);
    if (universityData) {
      setUniversity(universityData);
    } else {
      setNotFound(true);
    }
    
    setLoading(false);
  }, [id, getUniversity]);

  if (loading) {
    return <Loading />;
  }

  if (notFound || !university) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">University Not Found</h1>
        <p className="text-gray-600 mb-8">The university you're looking for doesn't exist or has been removed.</p>
        <Link 
          to="/universities" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Universities
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <Link 
        to="/universities" 
        className="inline-flex items-center text-primary hover:text-primary-dark mb-6"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Universities
      </Link>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-secondary text-white p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="bg-white p-4 rounded-lg h-20 w-20 md:h-24 md:w-24 flex items-center justify-center mr-6 mb-4 md:mb-0">
              <img 
                src={university.logo} 
                alt={`${university.name} logo`} 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{university.name}</h1>
              <div className="flex flex-wrap items-center mt-2">
                <div className="flex items-center mr-4">
                  <MapPin size={16} className="mr-1" />
                  <span>{university.country}, {university.region}</span>
                </div>
                <div className="flex items-center mr-4">
                  <Star size={16} className="text-yellow-400 fill-current mr-1" />
                  <span>{university.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center">
                  <BarChart3 size={16} className="mr-1" />
                  <span>Rank #{university.ranking}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <h2 className="text-xl font-semibold text-secondary mb-4">Overview</h2>
                <p className="text-gray-700 leading-relaxed">
                  {university.description}
                </p>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="mr-4 p-3 rounded-full bg-primary-light text-white">
                      <Building size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium">{university.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="mr-4 p-3 rounded-full bg-blue-100 text-blue-800">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Size</p>
                      <p className="font-medium">{university.size}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="mr-4 p-3 rounded-full bg-green-100 text-green-800">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Students</p>
                      <p className="font-medium">{university.students.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="mr-4 p-3 rounded-full bg-purple-100 text-purple-800">
                      <Handshake size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Partnerships</p>
                      <p className="font-medium">{university.partnerships}</p>
                    </div>
                  </div>
                </div>
              </motion.section>
              
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mb-8"
              >
                <h2 className="text-xl font-semibold text-secondary mb-4">Fields of Study</h2>
                <div className="flex flex-wrap gap-2">
                  {university.fields.map((field, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </motion.section>
              
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-secondary mb-4">Collaboration Opportunities</h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-primary">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-2 text-gray-700">
                      Research collaboration opportunities in IT and Computer Science
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-primary">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-2 text-gray-700">
                      Industry-academic partnerships for curriculum development
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-primary">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-2 text-gray-700">
                      Student internship and co-op programs
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-primary">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-2 text-gray-700">
                      Joint IT training programs and certifications
                    </p>
                  </li>
                </ul>
              </motion.section>
            </div>
            
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-gray-50 rounded-lg p-6 mb-6"
              >
                <h3 className="text-lg font-medium text-secondary mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <a 
                      href={university.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:text-primary-dark"
                    >
                      <Globe size={18} className="mr-2" />
                      <span>Official Website</span>
                      <ExternalLink size={14} className="ml-1" />
                    </a>
                  </div>
                  <div>
                    <a 
                      href="#" 
                      className="inline-flex items-center justify-center w-full px-4 py-2 border border-primary text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors"
                    >
                      Contact University
                    </a>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="rounded-lg overflow-hidden border border-gray-200"
              >
                <div className="bg-primary text-white py-3 px-4 font-medium">
                  Request Information
                </div>
                <div className="p-6">
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        className="w-full border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        className="w-full border border-gray-300 rounded-md"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Submit Request
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDetailPage;