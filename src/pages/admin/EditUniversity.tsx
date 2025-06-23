import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';

const fieldsOptions = [
  'Agriculture & Food Science',
  'Arts & Design',
  'Economics, Business & Management',
  'Engineering',
  'Law & Political Science',
  'Medicine, Pharmacy & Health Sciences',
  'Physical Science',
  'Social Sciences & Humanities',
  'Sports & Physical Education',
  'Technology',
  'Other',
];

const EditUniversity: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fieldsRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    coordinates: '',
    type: '',
    numberOfStudents: '',
    ranking: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    fields: [] as string[],
    other: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        const response = await axios.get(`/api/universities/${id}`);
        setFormData(response.data);
      } catch (error) {
        console.error('Failed to fetch university data', error);
      }
    };

    fetchUniversity();

    const handleClickOutside = (e: MouseEvent) => {
      if (fieldsRef.current && !fieldsRef.current.contains(e.target as Node)) {
        setFieldsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [id]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.type) newErrors.type = 'University type is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = 'Invalid URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFieldToggle = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.includes(field)
        ? prev.fields.filter((f) => f !== field)
        : [...prev.fields, field],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await axios.put(`/api/universities/${id}`, formData);
      setSubmitMessage('University updated successfully!');
      setTimeout(() => navigate('/admin/universities'), 1500);
    } catch (error) {
      console.error(error);
      setSubmitMessage('Failed to update university.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [activeTab, setActiveTab] = useState<string>('universities');

  return (
    <div className='flex h-screen overflow-hidden'>
      <div className='flex flex-col flex-1 overflow-y-auto'>
        <main className='flex-1 p-6 bg-gray-50'>
          <div className='max-w-7xl mx-auto bg-white p-6 rounded-md shadow'>
            <h1 className='text-2xl font-semibold mb-6'>Edit University</h1>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Text Inputs */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div>
                  <label htmlFor='name' className='block mb-1'>
                    Name *
                  </label>
                  <input
                    id='name'
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor='location' className='block mb-1'>
                    Location *
                  </label>
                  <input
                    id='location'
                    type='text'
                    name='location'
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.location && (
                    <p className='text-red-500 text-sm mt-1'>{errors.location}</p>
                  )}
                </div>
                <div>
                  <label htmlFor='coordinates' className='block mb-1'>
                    Coordinates
                  </label>
                  <input
                    id='coordinates'
                    type='text'
                    name='coordinates'
                    value={formData.coordinates}
                    onChange={handleChange}
                    placeholder='e.g. 40.7128, -74.0060'
                    className='w-full border border-gray-300 rounded px-3 py-2'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div>
                  <label htmlFor='university-type' className='block mb-1'>
                    University Type *
                  </label>
                  <select
                    id='university-type'
                    name='type'
                    value={formData.type}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 ${
                      errors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value=''>Select type</option>
                    <option value='Public'>Public</option>
                    <option value='Private'>Private</option>
                    <option value='Community'>Community</option>
                    <option value='For-profit'>For-profit</option>
                  </select>
                  {errors.type && <p className='text-red-500 text-sm mt-1'>{errors.type}</p>}
                </div>
                <div>
                  <label htmlFor='numberOfStudents' className='block mb-1'>
                    Number of Students
                  </label>
                  <input
                    id='numberOfStudents'
                    type='number'
                    name='numberOfStudents'
                    value={formData.numberOfStudents}
                    onChange={handleChange}
                    className='w-full border border-gray-300 rounded px-3 py-2'
                  />
                </div>
                <div>
                  <label htmlFor='ranking' className='block mb-1'>
                    Ranking
                  </label>
                  <input
                    id='ranking'
                    type='number'
                    name='ranking'
                    value={formData.ranking}
                    onChange={handleChange}
                    className='w-full border border-gray-300 rounded px-3 py-2'
                  />
                </div>
              </div>

              {/* Contact */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div>
                  <label htmlFor='phone' className='block mb-1'>
                    Phone
                  </label>
                  <input
                    id='phone'
                    type='text'
                    name='phone'
                    value={formData.phone}
                    onChange={handleChange}
                    className='w-full border border-gray-300 rounded px-3 py-2'
                  />
                </div>
                <div>
                  <label htmlFor='email' className='block mb-1'>
                    Email
                  </label>
                  <input
                    id='email'
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor='website' className='block mb-1'>
                    Website
                  </label>
                  <input
                    id='website'
                    type='text'
                    name='website'
                    value={formData.website}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 ${
                      errors.website ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.website && <p className='text-red-500 text-sm mt-1'>{errors.website}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor='description' className='block mb-1'>
                  Description
                </label>
                <textarea
                  id='description'
                  name='description'
                  value={formData.description}
                  onChange={handleChange}
                  className='w-full border border-gray-300 rounded px-3 py-2'
                  rows={4}
                />
              </div>

              {/* Fields of Study */}
              <div ref={fieldsRef} className='relative max-w-md'>
                <label
                  htmlFor='fields-dropdown'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Fields of Study
                </label>
                <button
                  id='fields-dropdown'
                  type='button'
                  onClick={() => setFieldsOpen((open) => !open)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-left focus:outline-none'
                >
                  {formData.fields.length === 0 ? (
                    <span className='text-gray-400'>Select fields of study...</span>
                  ) : (
                    formData.fields.join(', ')
                  )}
                </button>
                {fieldsOpen && (
                  <ul className='absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto'>
                    {fieldsOptions.map((option) => (
                      <button
                        key={option}
                        type='button'
                        onClick={() => handleFieldToggle(option)}
                        className={`w-full text-left px-3 py-2 cursor-pointer hover:bg-blue-100 ${
                          formData.fields.includes(option) ? 'bg-blue-200 font-semibold' : ''
                        }`}
                        tabIndex={0}
                      >
                        {option}
                      </button>
                    ))}
                  </ul>
                )}
              </div>

              {/* Other */}
              <div>
                <label htmlFor='other' className='block mb-1'>
                  Other
                </label>
                <textarea
                  id='other'
                  name='other'
                  value={formData.other}
                  onChange={handleChange}
                  className='w-full border border-gray-300 rounded px-3 py-2'
                  rows={3}
                />
              </div>

              <div className='flex justify-end'>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='px-8 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50'
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {submitMessage && (
                <p
                  className={`text-sm mt-4 ${
                    submitMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {submitMessage}
                </p>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditUniversity;
