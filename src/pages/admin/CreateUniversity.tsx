import { Upload } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';

interface FormData {
  universityName: string;
  country: string;
  location: string;
  coordinates: string;
  type: string;
  yearFounded: string;
  numberOfStudents: string;
  ranking: string;
  strength: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  fields: string[];
  other: string;
  logo: File | null;
}

interface FormErrors {
  universityName?: string;
  country?: string;
  location?: string;
  coordinates?: string;
  type?: string;
  yearFounded?: string;
  numberOfStudents?: string;
  ranking?: string;
  strength?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  fields?: string;
  other?: string;
  logo?: string;
}

// Mock data to simulate existing universities for uniqueness validation
const existingUniversities = [
  {
    name: 'Harvard University',
    phone: '+1-617-495-1000',
    email: 'info@harvard.edu',
    website: 'https://harvard.edu',
  },
  {
    name: 'MIT',
    phone: '+1-617-253-1000',
    email: 'info@mit.edu',
    website: 'https://mit.edu',
  },
];

const CreateUniversity = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    universityName: '',
    country: '',
    location: '',
    coordinates: '',
    type: '',
    yearFounded: '',
    numberOfStudents: '',
    ranking: '',
    strength: '',
    phone: '',
    email: '',
    website: 'https://',
    description: '',
    fields: [],
    other: '',
    logo: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Fields of Study options for the multi-select dropdown
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

  // Dropdown open state for Fields of Study
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const fieldsRef = useRef<HTMLDivElement>(null);

  // Close fields dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fieldsRef.current && !fieldsRef.current.contains(event.target as Node)) {
        setFieldsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.universityName.trim()) {
      newErrors.universityName = 'University name is required';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.type) {
      newErrors.type = 'University type is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.website.trim() || formData.website === 'https://') {
      newErrors.website = 'Website is required';
    }
    if (!formData.logo) {
      newErrors.logo = 'Logo is required';
    }

    // Format validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.phone && !/^\+?[1-9][\d\-()\s]{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (7-15 digits)';
    }
    if (
      formData.numberOfStudents &&
      (isNaN(Number(formData.numberOfStudents)) || Number(formData.numberOfStudents) < 0)
    ) {
      newErrors.numberOfStudents = 'Please enter a valid number of students';
    }
    if (formData.ranking && (isNaN(Number(formData.ranking)) || Number(formData.ranking) < 1)) {
      newErrors.ranking = 'Please enter a valid ranking (positive number)';
    }
    if (
      formData.yearFounded &&
      (isNaN(Number(formData.yearFounded)) ||
        Number(formData.yearFounded) < 1000 ||
        Number(formData.yearFounded) > new Date().getFullYear())
    ) {
      newErrors.yearFounded = 'Please enter a valid year (1000 - current year)';
    }
    if (
      formData.website &&
      formData.website !== 'https://' &&
      !/^https?:\/\/.+\..+/.test(formData.website)
    ) {
      newErrors.website = 'Please enter a valid website URL (must include http:// or https://)';
    }

    // Uniqueness validation
    const existingNames = existingUniversities.map((u) => u.name.toLowerCase());
    if (formData.universityName && existingNames.includes(formData.universityName.toLowerCase())) {
      newErrors.universityName = 'A university with this name already exists';
    }

    const existingPhones = existingUniversities.map((u) => u.phone);
    if (formData.phone && existingPhones.includes(formData.phone)) {
      newErrors.phone = 'This phone number is already registered to another university';
    }

    const existingEmails = existingUniversities.map((u) => u.email.toLowerCase());
    if (formData.email && existingEmails.includes(formData.email.toLowerCase())) {
      newErrors.email = 'This email address is already registered to another university';
    }

    const existingWebsites = existingUniversities.map((u) => u.website.toLowerCase());
    if (
      formData.website &&
      formData.website !== 'https://' &&
      existingWebsites.includes(formData.website.toLowerCase())
    ) {
      newErrors.website = 'This website URL is already registered to another university';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleFieldToggle = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.includes(field)
        ? prev.fields.filter((f) => f !== field)
        : [...prev.fields, field],
    }));
    if (errors.fields) {
      setErrors((prev) => ({ ...prev, fields: '' }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          logo: 'File size must be less than 5MB',
        }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          logo: 'Please upload an image file (JPG, PNG, GIF, etc.)',
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        logo: file,
      }));
      setErrors((prev) => ({
        ...prev,
        logo: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitMessage('');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('University data to save:', formData);

      // Show success message
      setSubmitMessage('Success!');

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          universityName: '',
          country: '',
          location: '',
          coordinates: '',
          type: '',
          yearFounded: '',
          numberOfStudents: '',
          ranking: '',
          strength: '',
          phone: '',
          email: '',
          website: 'https://',
          description: '',
          fields: [],
          other: '',
          logo: null,
        });
        setSubmitMessage('');
      }, 3000);
    } catch (error) {
      setSubmitMessage('Failed to create university. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex min-h-screen bg-gray-50'>
      {/* Sidebar */}
      <Sidebar
        activeTab='Create University'
        setActiveTab={() => {
          /* noop */
        }}
      />

      {/* Main content */}
      <main className='flex-grow max-w-4xl mx-auto p-6 bg-white my-8 rounded-md shadow'>
        {/* Back button */}
        <button
          type='button'
          onClick={() => navigate('/universities')}
          className='mb-6 inline-flex items-center px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm'
        >
          &larr; Back
        </button>

        <h1 className='text-2xl font-bold text-gray-900 mb-8'>Create University Information</h1>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* First row */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label
                htmlFor='universityName'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                University Name <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='universityName'
                name='universityName'
                value={formData.universityName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.universityName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter university name'
              />
              {errors.universityName && (
                <p className='mt-1 text-sm text-red-600'>{errors.universityName}</p>
              )}
            </div>

            <div>
              <label htmlFor='country' className='block text-sm font-medium text-gray-700 mb-2'>
                Country <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='country'
                name='country'
                value={formData.country}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.country ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter country'
              />
              {errors.country && <p className='mt-1 text-sm text-red-600'>{errors.country}</p>}
            </div>

            <div>
              <label htmlFor='logo-upload' className='block text-sm font-medium text-gray-700 mb-2'>
                Logo <span className='text-red-500'>*</span>
              </label>
              <div className='flex flex-col items-center'>
                <div className='w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2 bg-gray-50'>
                  {formData.logo ? (
                    <img
                      src={URL.createObjectURL(formData.logo)}
                      alt='Logo preview'
                      className='w-full h-full object-cover rounded-lg'
                    />
                  ) : (
                    <Upload className='w-8 h-8 text-gray-400' />
                  )}
                </div>
                <label
                  htmlFor='logo-upload'
                  className='cursor-pointer px-3 py-1 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition text-sm'
                >
                  Upload Logo
                  <input
                    id='logo-upload'
                    type='file'
                    accept='image/*'
                    onChange={handleLogoUpload}
                    className='hidden'
                  />
                </label>
                {errors.logo && <p className='mt-1 text-sm text-red-600'>{errors.logo}</p>}
              </div>
            </div>
          </div>

          {/* Second row */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label htmlFor='location' className='block text-sm font-medium text-gray-700 mb-2'>
                Location <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='location'
                name='location'
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter location'
              />
              {errors.location && <p className='mt-1 text-sm text-red-600'>{errors.location}</p>}
            </div>

            <div>
              <label htmlFor='coordinates' className='block text-sm font-medium text-gray-700 mb-2'>
                Coordinates
              </label>
              <input
                type='text'
                id='coordinates'
                name='coordinates'
                value={formData.coordinates}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.coordinates ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='e.g. 40.7128, -74.0060'
              />
              {errors.coordinates && (
                <p className='mt-1 text-sm text-red-600'>{errors.coordinates}</p>
              )}
            </div>

            <div>
              <label htmlFor='type' className='block text-sm font-medium text-gray-700 mb-2'>
                University Type <span className='text-red-500'>*</span>
              </label>
              <select
                id='type'
                name='type'
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value=''>Select university type</option>
                <option value='Public'>Public</option>
                <option value='Private'>Private</option>
                <option value='Academy'>Academy</option>
                <option value='International'>International</option>
              </select>
              {errors.type && <p className='mt-1 text-sm text-red-600'>{errors.type}</p>}
            </div>
          </div>

          {/* Third row - Number of Students, Ranking, Year Founded */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label
                htmlFor='numberOfStudents'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Number of Students
              </label>
              <input
                id='numberOfStudents'
                type='number'
                name='numberOfStudents'
                value={formData.numberOfStudents}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.numberOfStudents ? 'border-red-500' : 'border-gray-300'
                }`}
                min={0}
                placeholder='Enter number of students'
              />
              {errors.numberOfStudents && (
                <p className='mt-1 text-sm text-red-600'>{errors.numberOfStudents}</p>
              )}
            </div>

            <div>
              <label htmlFor='ranking' className='block text-sm font-medium text-gray-700 mb-2'>
                Ranking
              </label>
              <input
                type='number'
                id='ranking'
                name='ranking'
                value={formData.ranking}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.ranking ? 'border-red-500' : 'border-gray-300'
                }`}
                min={1}
                placeholder='Enter ranking'
              />
              {errors.ranking && <p className='mt-1 text-sm text-red-600'>{errors.ranking}</p>}
            </div>

            <div>
              <label htmlFor='yearFounded' className='block text-sm font-medium text-gray-700 mb-2'>
                Year Founded
              </label>
              <input
                type='number'
                id='yearFounded'
                name='yearFounded'
                value={formData.yearFounded}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.yearFounded ? 'border-red-500' : 'border-gray-300'
                }`}
                min={1000}
                max={new Date().getFullYear()}
                placeholder='Enter year founded'
              />
              {errors.yearFounded && (
                <p className='mt-1 text-sm text-red-600'>{errors.yearFounded}</p>
              )}
            </div>
          </div>

          {/* Fourth row - Strength, Phone, Email */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label htmlFor='strength' className='block text-sm font-medium text-gray-700 mb-2'>
                Strength
              </label>
              <input
                type='text'
                id='strength'
                name='strength'
                value={formData.strength}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.strength ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter university's main strengths"
              />
              {errors.strength && <p className='mt-1 text-sm text-red-600'>{errors.strength}</p>}
            </div>

            <div>
              <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-2'>
                Phone <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='phone'
                name='phone'
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter phone number'
              />
              {errors.phone && <p className='mt-1 text-sm text-red-600'>{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                Email <span className='text-red-500'>*</span>
              </label>
              <input
                id='email'
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter email'
              />
              {errors.email && <p className='mt-1 text-sm text-red-600'>{errors.email}</p>}
            </div>
          </div>

          {/* Website - single full row */}
          <div>
            <label htmlFor='website' className='block text-sm font-medium text-gray-700 mb-2'>
              Website <span className='text-red-500'>*</span>
            </label>
            <input
              id='website'
              type='text'
              name='website'
              value={formData.website}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.website ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='https://example.com'
            />
            {errors.website && <p className='mt-1 text-sm text-red-600'>{errors.website}</p>}
          </div>

          {/* Description text input */}
          <div>
            <label htmlFor='description' className='block text-sm font-medium text-gray-700 mb-2'>
              Description
            </label>
            <textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Enter description about the university'
            />
            {errors.description && (
              <p className='mt-1 text-sm text-red-600'>{errors.description}</p>
            )}
          </div>

          {/* Fields of Study multi-select dropdown */}
          <div ref={fieldsRef} className='relative w-full max-w-md'>
            <label
              className='block text-sm font-medium text-gray-700 mb-2'
              htmlFor='fields-dropdown-btn'
            >
              Fields of Study
            </label>
            <button
              id='fields-dropdown-btn'
              type='button'
              onClick={() => setFieldsOpen((open) => !open)}
              aria-haspopup='listbox'
              aria-expanded={fieldsOpen}
              aria-labelledby='fields-dropdown-btn'
              className={`w-full px-3 py-2 border rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-wrap gap-1 items-center ${
                errors.fields ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {formData.fields.length === 0 && (
                <span className='text-gray-400 select-none'>Select fields of study...</span>
              )}
              {formData.fields.map((option) => (
                <span
                  key={option}
                  className='bg-orange-100 px-2 py-0.5 rounded flex items-center gap-1'
                >
                  {option}
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFieldToggle(option);
                    }}
                    aria-label={`Remove ${option}`}
                    className='ml-1 hover:text-blue-500'
                  >
                    &times;
                  </button>
                </span>
              ))}
              <span className='ml-auto text-gray-500'>&#9662;</span>
            </button>

            {fieldsOpen && (
              <ul
                role='listbox'
                aria-multiselectable='true'
                className='absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto'
              >
                {fieldsOptions.map((option) => (
                  <li
                    key={option}
                    role='option'
                    aria-selected={formData.fields.includes(option)}
                    tabIndex={0}
                    className={`cursor-pointer select-none px-3 py-2 hover:bg-blue-100 flex items-center ${
                      formData.fields.includes(option) ? 'bg-blue-200 font-semibold' : ''
                    }`}
                    onClick={() => handleFieldToggle(option)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleFieldToggle(option);
                      }
                    }}
                  >
                    <input
                      type='checkbox'
                      readOnly
                      checked={formData.fields.includes(option)}
                      className='mr-2'
                      tabIndex={-1}
                    />
                    {option}
                  </li>
                ))}
              </ul>
            )}
            {errors.fields && <p className='mt-1 text-sm text-red-600'>{errors.fields}</p>}
          </div>

          {/* Other text */}
          <div>
            <label htmlFor='other' className='block text-sm font-medium text-gray-700 mb-2'>
              Other
            </label>
            <textarea
              id='other'
              name='other'
              value={formData.other}
              onChange={handleInputChange}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter other information'
            />
            {errors.other && <p className='mt-1 text-sm text-red-600'>{errors.other}</p>}
          </div>

          {/* Submit Button */}
          <div className='flex flex-col items-end'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='px-8 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 transition'
            >
              {isSubmitting ? 'Creating...' : 'Save'}
            </button>
            {submitMessage && (
              <p
                className={`mt-3 text-sm font-medium ${
                  submitMessage === 'Success!' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {submitMessage}
              </p>
            )}
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateUniversity;
