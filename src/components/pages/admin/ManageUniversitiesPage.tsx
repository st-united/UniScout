import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUniversity, University, UniversityFilters } from '../../contexts/UniversityContext';
import Loading from '../../molecules/common/Loading';
import FilterPanel from '../../../components/universities/FilterPanel';

const ManageUniversitiesPage = () => {
  const { universities, loading } = useUniversity();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>(universities);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredUniversities(universities);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const filtered = universities.filter(
      university =>
        university.name.toLowerCase().includes(lowercaseQuery) ||
        university.country.toLowerCase().includes(lowercaseQuery) ||
        university.fields.some(field => field.toLowerCase().includes(lowercaseQuery))
    );
    
    setFilteredUniversities(filtered);
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUniversities(filteredUniversities.map(uni => uni.id));
    } else {
      setSelectedUniversities([]);
    }
  };
  
  const handleSelectUniversity = (id: string) => {
    setSelectedUniversities(prev =>
      prev.includes(id) ? prev.filter(uniId => uniId !== id) : [...prev, id]
    );
  };
  
  const handleApplyFilters = (filters: UniversityFilters) => {
    let filtered = [...universities];
    
    if (filters.region !== undefined) {
      filtered = filtered.filter(uni => uni.region === filters.region);
    }
    
    if (filters.country !== undefined) {
      filtered = filtered.filter(uni => uni.country === filters.country);
    }
    
    if (filters.field !== undefined) {
      filtered = filtered.filter(uni => filters.field !== undefined && uni.fields.includes(filters.field));
    }
    
    if (filters.size !== undefined) {
      filtered = filtered.filter(uni => uni.size === filters.size);
    }
    
    if (filters.type !== undefined) {
      filtered = filtered.filter(uni => uni.type === filters.type);
    }
    
    // Apply search query if present
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        university =>
          university.name.toLowerCase().includes(lowercaseQuery) ||
          university.country.toLowerCase().includes(lowercaseQuery) ||
          university.fields.some(field => field.toLowerCase().includes(lowercaseQuery))
      );
    }
    
    setFilteredUniversities(filtered);
  };
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-secondary mb-4 sm:mb-0">Manage Universities</h1>
          
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark">
            <Plus size={16} className="mr-2" />
            Add University
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="relative flex-grow md:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="search"
                  placeholder="Search universities..."
                  className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Filter size={16} className="mr-2" />
                  Filter
                </button>
                
                <button
                  disabled={selectedUniversities.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-red-500 rounded-md shadow-sm text-sm font-medium text-red-500 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Selected
                </button>
              </div>
            </div>
            
            {isFilterOpen && (
              <div className="mt-4">
                <FilterPanel onApplyFilters={handleApplyFilters} />
              </div>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">
                    <div className="flex items-center">
                      <input
                        id="select-all"
                        type="checkbox"
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={selectedUniversities.length === filteredUniversities.length && filteredUniversities.length > 0}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    University
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ranking
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUniversities.map((university) => (
                  <tr key={university.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          checked={selectedUniversities.includes(university.id)}
                          onChange={() => handleSelectUniversity(university.id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                          <img 
                            src={university.logo} 
                            alt={university.name} 
                            className="max-h-full max-w-full"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{university.name}</div>
                          <div className="text-sm text-gray-500">
                            {university.fields.slice(0, 2).join(', ')}
                            {university.fields.length > 2 && '...'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {university.country}, {university.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{university.ranking}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        university.size === 'Large' 
                          ? 'bg-blue-100 text-blue-800' 
                          : university.size === 'Medium'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {university.size}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        university.type === 'Public' 
                          ? 'bg-purple-100 text-purple-800' 
                          : university.type === 'Private'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {university.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/universities/${university.id}`}
                          className="text-secondary hover:text-secondary-light"
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div className="relative group">
                          <button className="text-gray-500 hover:text-gray-700">
                            <MoreHorizontal size={18} />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Archive
                            </a>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Feature on Homepage
                            </a>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Generate Report
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredUniversities.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      No universities found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </a>
              <a href="#" className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </a>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                  <span className="font-medium">{filteredUniversities.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" aria-current="page" className="z-10 bg-primary border-primary text-white relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                    1
                  </a>
                  <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                    2
                  </a>
                  <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                    3
                  </a>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                  <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                    10
                  </a>
                  <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageUniversitiesPage;