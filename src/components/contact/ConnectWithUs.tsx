import { Paperclip } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const ContactForm: React.FC = () => {
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
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error' | 'submitting'>('idle');
  const [countries, setCountries] = useState<string[]>([]);

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
      if (value === '' || /^\d*$/.test(value)) {
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

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmissionStatus('idle');
      return;
    }

    setErrors({});
    setSubmissionStatus('submitting');

    try {
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
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStatus('error');

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
    }
  };

  return (
    <div className='bg-orange-50 rounded-lg p-8 w-full max-w-6xl mx-auto shadow-sm relative'>
      {/* Success notification positioned at top right - exact match to image */}
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
            </div>

            <div className='mb-6'>
              <label htmlFor='universityName' className='block text-orange-600 font-medium mb-2'>
                University Name
              </label>
              <input
                type='text'
                id='universityName'
                name='universityName'
                value={formData.universityName}
                onChange={handleInputChange}
                className={`w-full border-b-2 ${
                  errors.universityName ? 'border-red-500' : 'border-orange-300'
                } bg-transparent py-2 px-0 focus:outline-none focus:border-orange-500 transition-colors`}
              />
              {errors.universityName && (
                <p className='text-red-500 text-sm mt-1'>{errors.universityName}</p>
              )}
            </div>

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
              <label
                htmlFor='representativeName'
                className='block text-orange-600 font-medium mb-2'
              >
                Representative Name
              </label>
              <input
                type='text'
                id='representativeName'
                name='representativeName'
                value={formData.representativeName}
                onChange={handleInputChange}
                className={`w-full border-b-2 ${
                  errors.representativeName ? 'border-red-500' : 'border-orange-300'
                } bg-transparent py-2 px-0 focus:outline-none focus:border-orange-500 transition-colors`}
              />
              {errors.representativeName && (
                <p className='text-red-500 text-sm mt-1'>{errors.representativeName}</p>
              )}
            </div>

            <div className='mb-6'>
              <label htmlFor='country' className='block text-orange-600 font-medium mb-2'>
                Country
              </label>
              <select
                id='country'
                name='country'
                value={formData.country}
                onChange={handleInputChange}
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
                Your message
              </label>
              <div className='relative'>
                <textarea
                  id='message'
                  name='message'
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className={`w-full border-2 ${
                    errors.message ? 'border-red-500' : 'border-orange-300'
                  } bg-transparent rounded-lg py-2 px-3 focus:outline-none focus:border-orange-500 transition-colors`}
                ></textarea>
                {errors.message && <p className='text-red-500 text-sm mt-1'>{errors.message}</p>}
                
                <input
                  type='file'
                  id='attachment'
                  name='attachment'
                  onChange={handleFileChange}
                  accept='.doc,.docx,.pdf,.jpg,.jpeg,.png,.gif'
                  multiple
                  className='hidden'
                />
                
                <label
                  htmlFor='attachment'
                  className='absolute bottom-3 right-3 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer'
                  title={`Attach files (max ${MAX_FRONTEND_FILES}, 5MB each)`}
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
            </div>

            <div className='text-right'>
              <button
                type='submit'
                className='bg-orange-500 text-white py-3 px-8 rounded-full hover:bg-orange-600 transition-colors font-medium mt-2 focus:outline-none focus:ring-0 focus:shadow-none active:outline-none'
                style={{ outline: 'none', boxShadow: 'none' }}
                disabled={submissionStatus === 'submitting'}
              >
                {submissionStatus === 'submitting' ? 'Sending...' : 'Send message'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;