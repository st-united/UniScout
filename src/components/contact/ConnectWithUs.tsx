import axios from 'axios';
import { Paperclip } from 'lucide-react';
import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import axios from 'axios';
=======

>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f
import SuccessNotification from './SuccessNotification';

// Define the RequestTypeEnum to match your backend's enum
enum RequestTypeEnum {
  CHANGE_INFORMATION = 'Change Information',
  COOPERATION = 'Cooperation',
}

// Map frontend display values to backend enum values
const RequestTypeBackendMap: Record<string, string> = {
  'Change Information': 'CHANGE_INFORMATION',
  'Cooperation': 'COOPERATION',
};

interface FormData {
  requestType: RequestTypeEnum;
  universityName: string;
  representativeName: string;
  country: string;
  phoneNumber: string;
  email: string;
  message: string;
  attachment: File[];
}

interface FormErrors {
  requestType?: string;
  universityName?: string;
  representativeName?: string;
  country?: string;
  phoneNumber?: string;
  email?: string;
  message?: string;
  attachment?: string;
  general?: string;
}

export default function ConnectWithUs() {
  const [formData, setFormData] = useState<FormData>({
    requestType: RequestTypeEnum.CHANGE_INFORMATION,
    universityName: '',
    representativeName: '',
    country: '',
    phoneNumber: '',
    email: '',
    message: '',
    attachment: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
<<<<<<< HEAD
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error' | 'submitting'>('idle');
  const [countries, setCountries] = useState<string[]>([]);
=======
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isPurposeButtonClicked, setIsPurposeButtonClicked] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Test API connection on component mount
  useEffect(() => {
    axios
      .post(
        'http://localhost:6002/api/api/contact',
        {
          representativeName: formData.representativeName,
          email: formData.email,
          message: formData.message,
          country: formData.country,
          universityName: formData.universityName,
          phoneNumber: formData.phoneNumber,
          purpose: formData.purpose,
          attachment: formData.attachment,
        },
        { timeout: 10000 },
      )
      .then(() => setApiStatus('connected'))
      .catch((err: unknown) => {
        console.error('API test failed:', err);
        setApiStatus('error');
      });
  }, []);
>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f

  // Constants for file upload limits (matching backend)
  const MAX_FRONTEND_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_FRONTEND_FILES = 5;

  // Effect hook to populate the countries list on component mount
  useEffect(() => {
    // Mock countries list - replace with actual country-list import
    setCountries(['Vietnam', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'South Korea', 'Singapore']);
  }, []);

  // Updated API URL
  const API_BASE_URL = 'http://localhost:6002/api/contact';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
<<<<<<< HEAD
      if (value === '' || /^\d*$/.test(value)) {
=======
      if (/[^0-9]/.test(value)) {
        setErrors((prev) => ({ ...prev, [name]: 'Only numerical input is allowed.' }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: 'Only numerical input is allowed.' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newErrors: FormErrors = { ...errors };

      newErrors.attachment = undefined;

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif',
      ];

      const validFilesToAdd: File[] = [];
      let currentFileCount = formData.attachment.length;

      for (const file of selectedFiles) {
        if (!allowedTypes.includes(file.type)) {
          newErrors.attachment = newErrors.attachment
            ? `${newErrors.attachment}; ${file.name}: Invalid file type.`
            : `${file.name}: Only PDF, Word documents, and image files are allowed.`;
          continue;
        }

        if (file.size > MAX_FRONTEND_FILE_SIZE) {
          newErrors.attachment = newErrors.attachment
            ? `${newErrors.attachment}; ${file.name}: File size exceeds ${MAX_FRONTEND_FILE_SIZE / (1024 * 1024)}MB.`
            : `${file.name}: File size cannot exceed ${MAX_FRONTEND_FILE_SIZE / (1024 * 1024)}MB.`;
          continue;
        }

        if (currentFileCount >= MAX_FRONTEND_FILES) {
          newErrors.attachment = newErrors.attachment
            ? `${newErrors.attachment}; Cannot add more than ${MAX_FRONTEND_FILES} files.`
            : `You can only attach a maximum of ${MAX_FRONTEND_FILES} files. For more files please email us.`;
          break;
        }

        validFilesToAdd.push(file);
        currentFileCount++;
      }

      setFormData((prev) => ({
        ...prev,
        attachment: [...prev.attachment, ...validFilesToAdd],
      }));
      setErrors(newErrors);

      e.target.value = '';
    }
  };

<<<<<<< HEAD
  const handleRemoveFile = (fileName: string) => {
    setFormData((prev) => ({
      ...prev,
      attachment: prev.attachment.filter((file) => file.name !== fileName),
    }));
    setErrors((prev) => ({ ...prev, attachment: undefined }));
  };

  const handleRequestTypeChange = (type: RequestTypeEnum) => {
    setFormData((prev) => ({ ...prev, requestType: type }));
    setErrors((prev) => ({ ...prev, requestType: undefined }));
=======
  const handlePurposeChange = (purpose: string) => {
    console.log('handlePurposeChange called with purpose:', purpose);
    console.log('Errors before clearing:', errors);
    setFormData((prev) => ({ ...prev, purpose }));
    setErrors({});
    setIsPurposeButtonClicked(true);
    console.log('Errors after clearing and purpose set:', {});
>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.requestType) newErrors.requestType = 'Please select a purpose.';
    if (!formData.universityName) newErrors.universityName = 'University Name is required.';
    if (!formData.representativeName) newErrors.representativeName = 'Representative Name is required.';
    if (!formData.country) newErrors.country = 'Country is required.';
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone Number is required.';
    } else if (!/^\d+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Only numerical input is allowed for phone number.';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.message) newErrors.message = 'Message is required.';

    if (formData.attachment.length > 0) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif',
      ];
      const maxSize = MAX_FRONTEND_FILE_SIZE;

      if (formData.attachment.length > MAX_FRONTEND_FILES) {
        newErrors.attachment = `You can only attach a maximum of ${MAX_FRONTEND_FILES} files.`;
      } else {
        for (const file of formData.attachment) {
          if (!allowedTypes.includes(file.type)) {
            newErrors.attachment = newErrors.attachment
              ? `${newErrors.attachment}; ${file.name}: Invalid file type.`
              : `${file.name}: Only PDF, Word documents, and image files are allowed.`;
          } else if (file.size > maxSize) {
            newErrors.attachment = newErrors.attachment
              ? `${newErrors.attachment}; ${file.name}: File size cannot exceed ${maxSize / (1024 * 1024)}MB.`
              : `${file.name}: File size cannot exceed ${maxSize / (1024 * 1024)}MB.`;
          }
        }
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called.');
    console.log('isPurposeButtonClicked in handleSubmit:', isPurposeButtonClicked);

    if (isPurposeButtonClicked) {
      setIsPurposeButtonClicked(false);
      console.log('Skipping validation due to purpose button click.');
      return;
    }

    const validationErrors = validateForm();
    console.log('Validation errors:', validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log('Setting errors:', validationErrors);
      setSubmissionStatus('idle');
      return;
    }

    setErrors({});
    setSubmissionStatus('submitting');

    // Create FormData and map frontend fields to backend DTO fields
    const data = new FormData();

    // Map frontend field names to backend DTO field names
    data.append('name', formData.representativeName); // representativeName → name
    data.append('email', formData.email);
    data.append('message', formData.message);
    data.append('country', formData.country);
    data.append('universityName', formData.universityName);
    data.append('phoneNumber', formData.phoneNumber);
    data.append('requestType', formData.purpose); // purpose → requestType

    // Handle file attachment - backend expects 'files' field name (array)
    if (formData.attachment) {
      data.append('files', formData.attachment);
    }

    try {
<<<<<<< HEAD
      const dataToSend = new FormData();
      
      console.log('Sending data:', {
        requestType: RequestTypeBackendMap[formData.requestType],
        universityName: formData.universityName,
        name: formData.representativeName,
        country: formData.country,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        message: formData.message,
        hasAttachment: formData.attachment.map(f => f.name).join(', ')
      });

      dataToSend.append('requestType', RequestTypeBackendMap[formData.requestType]);
      dataToSend.append('universityName', formData.universityName);
      dataToSend.append('name', formData.representativeName);
      dataToSend.append('country', formData.country);
      dataToSend.append('phoneNumber', formData.phoneNumber);
      dataToSend.append('email', formData.email);
      dataToSend.append('message', formData.message);

      formData.attachment.forEach((file) => {
        dataToSend.append('files', file);
      });

      const response = await axios.post(API_BASE_URL, dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      console.log('Response:', response.data);

      if (response.status === 201 || response.status === 200) {
=======
      const res = await axios.post('http://localhost:6002/api/api/contact', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000,
      });
      if (res.status === 200 || res.status === 201) {
>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f
        setSubmissionStatus('success');
        setFormData({
          requestType: RequestTypeEnum.CHANGE_INFORMATION,
          universityName: '',
          representativeName: '',
          country: '',
          phoneNumber: '',
          email: '',
          message: '',
          attachment: [],
        });
<<<<<<< HEAD
        
        const fileInput = document.getElementById('attachment') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        setTimeout(() => {
          setSubmissionStatus('idle');
        }, 5000);
      } else {
        setSubmissionStatus('error');
        setErrors({ general: 'Unexpected response from server.' });
        setTimeout(() => {
          setSubmissionStatus('idle');
        }, 5000);
=======
        // Reset file input
        const fileInput = document.getElementById('attachment') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        setSubmissionStatus('error');
>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f
      }
    } catch (err: unknown) {
      console.error(err);
      setSubmissionStatus('error');
<<<<<<< HEAD

      if (axios.isAxiosError(error)) {
        console.log('Error response:', error.response?.data);
        console.log('Error status:', error.response?.status);
        console.log('Error message:', error.message);

        if (error.response && error.response.data) {
          const backendErrorMessage = error.response.data.message;
          const parsedErrors: FormErrors = {};
          
          if (typeof backendErrorMessage === 'string') {
            const individualErrors = backendErrorMessage.split('; ');
            individualErrors.forEach(err => {
              if (err.toLowerCase().includes('name cannot be empty') || err.toLowerCase().includes('name cannot exceed')) {
                parsedErrors.representativeName = err;
              } else if (err.toLowerCase().includes('email')) {
                parsedErrors.email = err;
              } else if (err.toLowerCase().includes('message')) {
                parsedErrors.message = err;
              } else if (err.toLowerCase().includes('country')) {
                parsedErrors.country = err;
              } else if (err.toLowerCase().includes('university name')) {
                parsedErrors.universityName = err;
              } else if (err.toLowerCase().includes('phone number') || err.toLowerCase().includes('numerical input')) {
                parsedErrors.phoneNumber = err;
              } else if (err.toLowerCase().includes('request type') || err.toLowerCase().includes('purpose') || err.toLowerCase().includes('invalid request type')) {
                parsedErrors.requestType = err;
              } else if (err.toLowerCase().includes('file')) {
                parsedErrors.attachment = err;
              } else {
                parsedErrors.general = parsedErrors.general ? `${parsedErrors.general}; ${err}` : err;
              }
            });
          }
          setErrors((prev) => ({ ...prev, ...parsedErrors }));
        } else if (error.code === 'ECONNREFUSED') {
          setErrors({ general: 'Cannot connect to server. Please check if the backend is running.' });
        } else if (error.code === 'ECONNABORTED') {
          setErrors({ general: 'Request timeout. Please try again.' });
        } else {
          setErrors({ general: error.message || 'Network error occurred.' });
        }
      } else {
        setErrors({ general: 'An unexpected error occurred.' });
      }

      setTimeout(() => {
        setSubmissionStatus('idle');
      }, 5000);
=======
    } finally {
      setTimeout(() => setSubmissionStatus('idle'), 5000);
>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f
    }
  };

  return (
<<<<<<< HEAD
    <div className='bg-orange-50 rounded-lg p-8 w-full max-w-6xl mx-auto shadow-sm relative'>
      {/* Success notification positioned at top right - exact match to image */}
=======
    <div className='bg-[rgba(255,131,43,0.24)] rounded-3xl p-10 max-w-screen-xl mx-auto mt-10 shadow-lg'>
      {apiStatus === 'checking' && (
        <div className='mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg'>
          Testing API connection...
        </div>
      )}
      {apiStatus === 'error' && (
        <div className='mb-4 p-4 bg-red-100 text-red-800 rounded-lg'>
          Unable to connect to API. Please check your API URL and server status.
        </div>
      )}
      {apiStatus === 'connected' && (
        <div className='mb-4 p-4 bg-green-100 text-green-800 rounded-lg'>
          Successfully connected to API!
        </div>
      )}

>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f
      {submissionStatus === 'success' && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white border border-orange-300 text-orange-500 px-4 py-3 rounded-xl flex items-center space-x-3 shadow-lg">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <span className="text-base font-semibold">Send message successfully!</span>
          </div>
        </div>
      )}
      
      {/* Error notification */}
      {submissionStatus === 'error' && (
        <SuccessNotification
          show={true}
          type='error'
          message={errors.general || 'Your request could not be sent. Please try again later.'}
        />
      )}
<<<<<<< HEAD

      <h2 className='text-4xl font-bold text-orange-500 text-center mb-2'>Connect with us</h2>
      <p className='text-gray-500 text-center mb-8'>
        Your Gateway to University Insights and Support!
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Left Column */}
          <div className='lg:col-span-5'>
            <div className='mb-6'>
              <label
                htmlFor='requestType-change-info'
                className='block text-orange-600 font-medium mb-2'
              >
                Select the purpose:
              </label>
              {errors.requestType && <p className='text-red-500 text-sm mt-1'>{errors.requestType}</p>}
              <div className='space-x-4'>
                <button
                  type='button'
                  id='requestType-change-info'
                  className={`px-6 py-2 rounded-full ${
                    formData.requestType === RequestTypeEnum.CHANGE_INFORMATION
                      ? 'bg-orange-400 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  } transition-colors`}
                  onClick={() => handleRequestTypeChange(RequestTypeEnum.CHANGE_INFORMATION)}
                >
                  {RequestTypeEnum.CHANGE_INFORMATION}
                </button>
                <button
                  type='button'
                  className={`px-6 py-2 rounded-full ${
                    formData.requestType === RequestTypeEnum.COOPERATION
                      ? 'bg-orange-400 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  } transition-colors`}
                  onClick={() => handleRequestTypeChange(RequestTypeEnum.COOPERATION)}
                >
                  {RequestTypeEnum.COOPERATION}
                </button>
              </div>
=======
      <h1 className='text-4xl font-bold text-orange-600 text-center mb-2'>Connect with us</h1>
      <p className='text-center text-gray-500 mb-10 leading-relaxed'>
        Your Gateway to University Insights and Support!
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-8'>
          {/* Left column for purpose buttons */}
          <div className='lg:col-span-1 flex flex-col justify-start'>
            <span className='text-orange-600 font-medium text-lg block mb-6'>
              Select the purpose:
            </span>
            <div className='space-y-4'>
              <button
                type='button'
                className={`w-full rounded-full px-6 py-3 font-medium text-base transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                  formData.purpose === 'Change Information'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white border border-gray-300 text-gray-600 hover:border-[#E85A0C] hover:text-orange-600'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Change Information button clicked.');
                  handlePurposeChange('Change Information');
                }}
              >
                Change Information
              </button>
              <button
                type='button'
                className={`w-full bg-tran rounded-full px-6 py-3 font-medium text-base transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                  formData.purpose === 'Cooperation'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white border border-gray-300 text-gray-600 hover:border-[#E85A0C] hover:text-orange-600'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Cooperation button clicked.');
                  handlePurposeChange('Cooperation');
                }}
              >
                Cooperation
              </button>
>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f
            </div>
            {errors.purpose && <p className='text-red-500 text-sm mt-2'>{errors.purpose}</p>}
          </div>

<<<<<<< HEAD
            <div className='mb-6'>
              <label htmlFor='universityName' className='block text-orange-600 font-medium mb-2'>
=======
          {/* Right column for form inputs */}
          <div className='lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8'>
            <div>
              <label
                htmlFor='universityName'
                className='block text-orange-600 font-medium mb-3 text-sm'
              >
>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f
                University Name
              </label>
              <input
                type='text'
                id='universityName'
                name='universityName'
                value={formData.universityName}
                onChange={handleInputChange}
                className='w-full border-0 border-b-2 border-[#E85A0C] rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400'
                placeholder='Enter university name'
              />
              {errors.universityName && (
                <p className='text-red-500 text-sm mt-2'>{errors.universityName}</p>
              )}
            </div>

<<<<<<< HEAD
            <div className='mb-6'>
              <label htmlFor='phoneNumber' className='block text-orange-600 font-medium mb-2'>
                Phone Number
              </label>
              <input
                type='tel'
                id='phoneNumber'
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={`w-full border-b-2 ${
                  errors.phoneNumber ? 'border-red-500' : 'border-orange-300'
                } bg-transparent py-2 px-0 focus:outline-none focus:border-orange-500 transition-colors`}
              />
              {errors.phoneNumber && (
                <p className='text-red-500 text-sm mt-1'>{errors.phoneNumber}</p>
              )}
            </div>

            <div className='mb-6'>
              <label htmlFor='email' className='block text-orange-600 font-medium mb-2'>
                Email
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full border-b-2 ${
                  errors.email ? 'border-red-500' : 'border-orange-300'
                } bg-transparent py-2 px-0 focus:outline-none focus:border-orange-500 transition-colors`}
              />
              {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
            </div>
          </div>

          {/* Right Column */}
          <div className='lg:col-span-7'>
            <div className='mb-6'>
=======
            <div>
>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f
              <label
                htmlFor='representativeName'
                className='block text-orange-600 font-medium mb-3 text-sm'
              >
                Representative Name
              </label>
              <input
                type='text'
                id='representativeName'
                name='representativeName'
                value={formData.representativeName}
                onChange={handleInputChange}
                className='w-full border-0 border-b-2 border-[#E85A0C] rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400'
                placeholder='Enter representative name'
              />
              {errors.representativeName && (
                <p className='text-red-500 text-sm mt-2'>{errors.representativeName}</p>
              )}
            </div>

            <div>
              <label htmlFor='country' className='block text-orange-600 font-medium mb-3 text-sm'>
                Country
              </label>
              <select
                id='country'
                name='country'
                value={formData.country}
                onChange={handleInputChange}
<<<<<<< HEAD
                className={`w-full border-b-2 ${
                  errors.country ? 'border-red-500' : 'border-orange-300'
                } bg-transparent py-2 px-0 focus:outline-none focus:border-orange-500 transition-colors`}
              >
                <option value=''>Select your country</option>
                {countries.map((countryName) => (
                  <option key={countryName} value={countryName}>
                    {countryName}
                  </option>
                ))}
              </select>
              {errors.country && <p className='text-red-500 text-sm mt-1'>{errors.country}</p>}
            </div>
            
            <div className='mb-6'>
              <label htmlFor='message' className='block text-orange-600 font-medium mb-2'>
=======
                className='w-full border-0 border-b-2 border-[#E85A0C] rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400'
                placeholder='Enter country'
              />
              {errors.country && <p className='text-red-500 text-sm mt-2'>{errors.country}</p>}
            </div>

            <div>
              <label
                htmlFor='phoneNumber'
                className='block text-orange-600 font-medium mb-3 text-sm'
              >
                Phone Number
              </label>
              <input
                type='text'
                id='phoneNumber'
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className='w-full border-0 border-b-2 border-[#E85A0C] rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400'
                placeholder='Enter phone number'
              />
              {errors.phoneNumber && (
                <p className='text-red-500 text-sm mt-2'>{errors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor='email' className='block text-orange-600 font-medium mb-3 text-sm'>
                Email
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                className='w-full border-0 border-b-2 border-[#E85A0C] rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400'
                placeholder='Enter email address'
              />
              {errors.email && <p className='text-red-500 text-sm mt-2'>{errors.email}</p>}
            </div>

            <div className='col-span-1 md:col-span-3'>
              <label htmlFor='message' className='block text-orange-600 font-medium mb-3 text-sm'>
>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f
                Your message
              </label>
              <div className='relative'>
                <textarea
                  id='message'
                  name='message'
                  value={formData.message}
                  onChange={handleInputChange}
<<<<<<< HEAD
                  rows={5}
                  className={`w-full border-2 ${
                    errors.message ? 'border-red-500' : 'border-orange-300'
                  } bg-transparent rounded-lg py-2 px-3 focus:outline-none focus:border-orange-500 transition-colors`}
                ></textarea>
                {errors.message && <p className='text-red-500 text-sm mt-1'>{errors.message}</p>}
                
=======
                  className='w-full bg-white border-2 border-[#6e6c6c87] rounded-xl py-4 px-4 pr-12 resize-none focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400 shadow-sm'
                  rows={4}
                  placeholder='Enter your message here...'
                />
                {errors.message && <p className='text-red-500 text-sm mt-2'>{errors.message}</p>}
>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f
                <input
                  type='file'
                  id='attachment'
                  name='attachment'
                  onChange={handleFileChange}
                  accept='.doc,.docx,.pdf,.jpg,.jpeg,.png,.gif'
<<<<<<< HEAD
                  multiple
=======
>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f
                  className='hidden'
                />
                
                <label
                  htmlFor='attachment'
<<<<<<< HEAD
                  className='absolute bottom-3 right-3 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer'
                  title={`Attach files (max ${MAX_FRONTEND_FILES}, 5MB each)`}
=======
                  className='absolute bottom-4 right-4 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer p-1 rounded-full hover:bg-orange-50'
                  title={
                    formData.attachment ? `Selected: ${formData.attachment.name}` : 'Attach file'
                  }
>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f
                >
                  <Paperclip size={20} />
                  {formData.attachment.length > 0 && (
                    <span className='ml-1 text-sm'>{formData.attachment.length}</span>
                  )}
                </label>

                <div className='mt-2 flex flex-wrap gap-2 text-sm'>
                  {formData.attachment.map((file, index) => (
                    <span
                      key={file.name + index}
                      className='bg-orange-100 text-orange-800 px-2 py-1 rounded-full flex items-center'
                    >
                      {file.name}
                      <button
                        type='button'
                        onClick={() => handleRemoveFile(file.name)}
                        className='ml-1 text-orange-600 hover:text-orange-900 focus:outline-none'
                        title={`Remove ${file.name}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                {errors.attachment && (
                  <p className='text-red-500 text-sm mt-1'>{errors.attachment}</p>
                )}
              </div>
              {formData.attachment && (
                <p className='text-sm text-gray-600 mt-2'>
                  Selected file: {formData.attachment.name}
                </p>
              )}
            </div>

            <div className='col-span-1 md:col-span-3 flex justify-end'>
              <button
                type='submit'
<<<<<<< HEAD
                className='bg-orange-500 text-white py-3 px-8 rounded-full hover:bg-orange-600 transition-colors font-medium mt-2 focus:outline-none focus:ring-0 focus:shadow-none active:outline-none'
                style={{ outline: 'none', boxShadow: 'none' }}
                disabled={submissionStatus === 'submitting'}
=======
                className='bg-gradient-to-r from-orange-400 to-orange-600 text-white px-10 py-3 rounded-full shadow-md hover:shadow-lg font-medium transition-all duration-200 transform hover:scale-105 hover:from-orange-500 hover:to-orange-700'
>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f
              >
                {submissionStatus === 'submitting' ? 'Sending...' : 'Send message'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
<<<<<<< HEAD
};

export default ContactForm;
=======
}
>>>>>>> 71ac5dfc4e408bb60e4a963f739887752b6eb77f
