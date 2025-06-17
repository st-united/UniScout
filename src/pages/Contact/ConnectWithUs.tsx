import axios from 'axios';
import { getNames } from 'country-list';
import { Paperclip } from 'lucide-react';
import React, { useState, useEffect } from 'react';
// Import the configured axios instance
// Assuming SuccessNotification componet exists and takes `show`, `type`, `message` props
// If you don't have this component, you'll need to define it or replace it with inline notification logic.
// For demonstration, I'll provide a simple mock if it's not defined elsewhere.

// Define the RequestTypeEnum to match your backend's enum
enum RequestTypeEnum {
  CHANGE_INFORMATION = 'Change Information',
  COOPERATION = 'Cooperation',
}

// Map frontend display values to backend enum values
const RequestTypeBackendMap: Record<string, string> = {
  'Change Information': 'CHANGE_INFORMATION',
  Cooperation: 'COOPERATION',
};

interface FormData {
  requestType: RequestTypeEnum; // Changed from 'purpose'
  universityName: string;
  representativeName: string;
  country: string;
  phoneNumber: string;
  email: string;
  message: string;
  attachment: File[]; // Changed to File[] for multiple attachments
}

interface FormErrors {
  requestType?: string; // Changed from 'purpose'
  universityName?: string;
  representativeName?: string;
  country?: string;
  phoneNumber?: string;
  email?: string;
  message?: string;
  attachment?: string;
  general?: string; // For general backend errors
}

export default function ConnectWithUs() {
  const [formData, setFormData] = useState<FormData>({
    requestType: RequestTypeEnum.CHANGE_INFORMATION, // Changed from 'purpose'
    universityName: '',
    representativeName: '',
    country: '',
    phoneNumber: '',
    email: '',
    message: '',
    attachment: [], // Initial state for multiple files
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'success' | 'error' | 'submitting'
  >('idle'); // Added 'submitting' status
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | null>(null);
  const [countries, setCountries] = useState<string[]>([]);

  // Constants for file upload limits (matching backend)
  const MAX_FRONTEND_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_FRONTEND_FILES = 5;

  // Effect hook to populate the countries list on component mount (from Code 2)
  useEffect(() => {
    const countryNames = getNames();
    setCountries(countryNames);
  }, []);

  // Function to show notifications (from Code 2)
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setTimeout(() => {
      setNotificationMessage(null);
      setNotificationType(null);
    }, 5000); // Notification disappears after 5 seconds
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, // Added HTMLSelectElement
  ) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      // Allow empty string or numbers/plus sign
      if (value === '' || /^\+?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: 'Only numerical input and + is allowed.' }));
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

      // Clear previous attachment errors related to new selection
      newErrors.attachment = undefined;

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
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
            ? `${newErrors.attachment}; ${file.name}: File size exceeds ${
                MAX_FRONTEND_FILE_SIZE / (1024 * 1024)
              }MB.`
            : `${file.name}: File size cannot exceed ${MAX_FRONTEND_FILE_SIZE / (1024 * 1024)}MB.`;
          continue;
        }

        if (currentFileCount >= MAX_FRONTEND_FILES) {
          newErrors.attachment = newErrors.attachment
            ? `${newErrors.attachment}; Cannot add more than ${MAX_FRONTEND_FILES} files.`
            : `You can only attach a maximum of ${MAX_FRONTEND_FILES} files. For more files please email us.`;
          break; // Stop adding files if max limit reached
        }

        validFilesToAdd.push(file);
        currentFileCount++;
      }

      setFormData((prev) => ({
        ...prev,
        attachment: [...prev.attachment, ...validFilesToAdd], // Append new valid files
      }));
      setErrors(newErrors);

      // Clear the file input value to allow selecting the same file again if needed
      e.target.value = '';
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setFormData((prev) => ({
      ...prev,
      attachment: prev.attachment.filter((file) => file.name !== fileName),
    }));
    setErrors((prev) => ({ ...prev, attachment: undefined })); // Clear attachment errors if any files are removed
  };

  const handleRequestTypeChange = (type: RequestTypeEnum) => {
    // Changed from handlePurposeChange
    setFormData((prev) => ({ ...prev, requestType: type })); // Changed purpose to requestType
    setErrors({}); // Clear all errors when purpose changes (Code 1 behavior)
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.requestType) newErrors.requestType = 'Please select a purpose.';
    if (!formData.universityName) newErrors.universityName = 'University Name is required.';
    if (!formData.representativeName)
      newErrors.representativeName = 'Representative Name is required.';
    if (!formData.country) newErrors.country = 'Country is required.';
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone Number is required.';
    } else if (!/^\+?\d+$/.test(formData.phoneNumber)) {
      // More robust phone validation
      newErrors.phoneNumber = 'Only numerical input and + is allowed for phone number.';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.message) newErrors.message = 'Message is required.';

    // File validation (moved from handleFileChange to ensure full validation on submit)
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
              ? `${newErrors.attachment}; ${file.name}: File size cannot exceed ${
                  maxSize / (1024 * 1024)
                }MB.`
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
      setSubmissionStatus('idle'); // Reset status if validation fails
      return;
    }

    setErrors({}); // Clear errors before submission
    setSubmissionStatus('submitting');
    setNotificationMessage(null); // Clear any old notifications

    try {
      const dataToSend = new FormData();

      // Append text fields, mapping frontend to backend DTO
      dataToSend.append('requestType', RequestTypeBackendMap[formData.requestType]); // Map to backend enum
      dataToSend.append('universityName', formData.universityName);
      dataToSend.append('name', formData.representativeName); // Representative name → name
      dataToSend.append('country', formData.country);
      dataToSend.append('phoneNumber', formData.phoneNumber);
      dataToSend.append('email', formData.email);
      dataToSend.append('message', formData.message);

      // Append files
      formData.attachment.forEach((file) => {
        dataToSend.append('files', file); // 'files' is the expected field name on the backend
      });

      console.log('Sending data:', {
        requestType: RequestTypeBackendMap[formData.requestType],
        universityName: formData.universityName,
        name: formData.representativeName,
        country: formData.country,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        message: formData.message,
        attachmentNames: formData.attachment.map((f) => f.name).join(', '),
      });

      // Using relative path 'contact' assuming axios base URL is configured in a higher level (e.g., main.ts/index.tsx)
      // If not, you'll need the full path: 'http://localhost:6002/api/api/contact'
      const response = await axios.post('contact', dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      });

      console.log('Response:', response.data);

      if (response.status === 201 || response.status === 200) {
        setSubmissionStatus('success');
        showNotification('Message sent successfully.', 'success');
        // Clear form data after successful submission
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
        // Reset file input visually
        const fileInput = document.getElementById('attachment') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setSubmissionStatus('error');
        showNotification('Unexpected response from server. Please try again.', 'error');
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
            individualErrors.forEach((err) => {
              if (
                err.toLowerCase().includes('name cannot be empty') ||
                err.toLowerCase().includes('name cannot exceed')
              ) {
                parsedErrors.representativeName = err;
              } else if (err.toLowerCase().includes('email')) {
                parsedErrors.email = err;
              } else if (err.toLowerCase().includes('message')) {
                parsedErrors.message = err;
              } else if (err.toLowerCase().includes('country')) {
                parsedErrors.country = err;
              } else if (err.toLowerCase().includes('university name')) {
                parsedErrors.universityName = err;
              } else if (
                err.toLowerCase().includes('phone number') ||
                err.toLowerCase().includes('numerical input')
              ) {
                parsedErrors.phoneNumber = err;
              } else if (
                err.toLowerCase().includes('request type') ||
                err.toLowerCase().includes('purpose') ||
                err.toLowerCase().includes('invalid request type')
              ) {
                parsedErrors.requestType = err;
              } else if (err.toLowerCase().includes('file')) {
                parsedErrors.attachment = err;
              } else {
                parsedErrors.general = parsedErrors.general
                  ? `${parsedErrors.general}; ${err}`
                  : err;
              }
            });
          } else if (Array.isArray(backendErrorMessage)) {
            parsedErrors.general = backendErrorMessage.join('; ');
          }
          setErrors((prev) => ({ ...prev, ...parsedErrors }));
          showNotification(parsedErrors.general || 'Validation errors occurred.', 'error');
        } else if (error.code === 'ECONNREFUSED') {
          showNotification(
            'Cannot connect to server. Please check if the backend is running and accessible.',
            'error',
          );
        } else if (error.code === 'ECONNABORTED') {
          showNotification(
            'Request timed out. Please check your internet connection or try again later.',
            'error',
          );
        } else {
          showNotification(error.message || 'A network error occurred. Please try again.', 'error');
        }
      } else {
        showNotification('An unexpected error occurred during submission.', 'error');
      }
    }
  };

  return (
    <div className='bg-orange-50 rounded-lg p-8 w-full max-w-6xl mx-auto shadow-sm relative'>
      {/* Dynamic Notification */}
      {notificationMessage && notificationType && (
        <div
          className={`absolute top-4 right-4 z-10 p-3 rounded-xl shadow-lg flex items-center space-x-3 
                        ${
                          notificationType === 'success'
                            ? 'bg-green-100 border border-green-300 text-green-700'
                            : 'bg-red-100 border border-red-300 text-red-700'
                        }`}
        >
          <div className='flex-shrink-0'>
            {notificationType === 'success' ? (
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
            ) : (
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586l-1.293-1.293z'
                  clipRule='evenodd'
                />
              </svg>
            )}
          </div>
          <span className='text-base font-semibold'>{notificationMessage}</span>
        </div>
      )}

      <h1 className='mb-2 text-4xl font-bold text-center text-orange-600'>Connect with us</h1>
      <p className='mb-10 leading-relaxed text-center text-gray-500'>
        Your Gateway to University Insights and Support!
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-5'>
          {/* Left column for purpose buttons (Code 1 styling and layout) */}
          <div className='flex flex-col justify-start lg:col-span-1'>
            <span className='block mb-6 text-lg font-medium text-orange-600'>
              Select the purpose:
            </span>
            <div className='space-y-4'>
              <button
                type='button'
                className={`w-full rounded-full px-6 py-3 font-medium text-base transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                  formData.requestType === RequestTypeEnum.CHANGE_INFORMATION // Changed from purpose
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white border border-gray-300 text-gray-600 hover:border-[#E85A0C] hover:text-orange-600'
                }`}
                onClick={() => handleRequestTypeChange(RequestTypeEnum.CHANGE_INFORMATION)} // Changed from handlePurposeChange
              >
                {RequestTypeEnum.CHANGE_INFORMATION}
              </button>
              <button
                type='button'
                className={`w-full bg-tran rounded-full px-6 py-3 font-medium text-base transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                  formData.requestType === RequestTypeEnum.COOPERATION // Changed from purpose
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white border border-gray-300 text-gray-600 hover:border-[#E85A0C] hover:text-orange-600'
                }`}
                onClick={() => handleRequestTypeChange(RequestTypeEnum.COOPERATION)} // Changed from handlePurposeChange
              >
                {RequestTypeEnum.COOPERATION}
              </button>
            </div>
            {errors.requestType && (
              <p className='mt-2 text-sm text-red-500'>{errors.requestType}</p>
            )}{' '}
            {/* Changed from errors.purpose */}
          </div>

          {/* Right column for form inputs (Code 1 layout, Code 2 validation styles) */}
          <div className='grid grid-cols-1 lg:col-span-4 md:grid-cols-3 gap-x-6 gap-y-8'>
            <div>
              <label
                htmlFor='universityName'
                className='block mb-3 text-sm font-medium text-orange-600'
              >
                University Name
              </label>
              <input
                type='text'
                id='universityName'
                name='universityName'
                value={formData.universityName}
                onChange={handleInputChange}
                className={`w-full border-0 border-b-2 ${
                  errors.universityName ? 'border-red-500' : 'border-[#E85A0C]' // Dynamic error border
                } rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400`}
                placeholder='Enter university name'
              />
              {errors.universityName && (
                <p className='mt-2 text-sm text-red-500'>{errors.universityName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='representativeName'
                className='block mb-3 text-sm font-medium text-orange-600'
              >
                Representative Name
              </label>
              <input
                type='text'
                id='representativeName'
                name='representativeName'
                value={formData.representativeName}
                onChange={handleInputChange}
                className={`w-full border-0 border-b-2 ${
                  errors.representativeName ? 'border-red-500' : 'border-[#E85A0C]'
                } rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400`}
                placeholder='Enter representative name'
              />
              {errors.representativeName && (
                <p className='mt-2 text-sm text-red-500'>{errors.representativeName}</p>
              )}
            </div>

            <div>
              <label htmlFor='country' className='block mb-3 text-sm font-medium text-orange-600'>
                Country
              </label>
              {/* Country dropdown from Code 2, styled with Code 1 aesthetics */}
              <select
                id='country'
                name='country'
                value={formData.country}
                onChange={handleInputChange}
                className={`w-full border-0 border-b-2 ${
                  errors.country ? 'border-red-500' : 'border-[#E85A0C]'
                } rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors text-gray-700`}
              >
                <option value='' disabled>
                  Select your country
                </option>
                {countries.map((countryName) => (
                  <option key={countryName} value={countryName}>
                    {countryName}
                  </option>
                ))}
              </select>
              {errors.country && <p className='mt-2 text-sm text-red-500'>{errors.country}</p>}
            </div>

            <div>
              <label
                htmlFor='phoneNumber'
                className='block mb-3 text-sm font-medium text-orange-600'
              >
                Phone Number
              </label>
              <input
                type='text' // Keep as text to allow '+', validation handles numbers
                id='phoneNumber'
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={`w-full border-0 border-b-2 ${
                  errors.phoneNumber ? 'border-red-500' : 'border-[#E85A0C]'
                } rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400`}
                placeholder='Enter phone number'
              />
              {errors.phoneNumber && (
                <p className='mt-2 text-sm text-red-500'>{errors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor='email' className='block mb-3 text-sm font-medium text-orange-600'>
                Email
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full border-0 border-b-2 ${
                  errors.email ? 'border-red-500' : 'border-[#E85A0C]'
                } rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400`}
                placeholder='Enter email address'
              />
              {errors.email && <p className='mt-2 text-sm text-red-500'>{errors.email}</p>}
            </div>

            <div className='col-span-1 md:col-span-3'>
              <label htmlFor='message' className='block mb-3 text-sm font-medium text-orange-600'>
                Your message
              </label>
              <div className='relative'>
                <textarea
                  id='message'
                  name='message'
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`w-full bg-white border-2 ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  } rounded-xl py-4 px-4 pr-12 resize-y focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400 shadow-sm min-h-[120px] box-border`}
                  rows={4}
                  placeholder='Enter your message here...'
                />
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
                  className='absolute p-1 text-gray-400 transition-colors rounded-full cursor-pointer bottom-4 right-4 hover:text-orange-500 hover:bg-orange-50'
                  title={`Attach files (max ${MAX_FRONTEND_FILES}, ${
                    MAX_FRONTEND_FILE_SIZE / (1024 * 1024)
                  }MB each)`}
                >
                  <Paperclip size={20} />
                  {formData.attachment.length > 0 && (
                    <span className='ml-1 text-sm'>{formData.attachment.length}</span>
                  )}
                </label>
              </div>
              {errors.message && <p className='text-red-500 text-sm mt-1'>{errors.message}</p>}
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
                      className='ml-2 w-5 h-5 bg-white text-orange-600 hover:text-orange-900 focus:outline-none flex items-center justify-center text-lg rounded-full'
                      title={`Remove ${file.name}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              {errors.attachment && (
                <p className='mt-2 text-sm text-red-500'>{errors.attachment}</p>
              )}
            </div>

            <div className='flex justify-end col-span-1 md:col-span-3'>
              <button
                type='submit'
                className='px-10 py-3 font-medium text-white transition-all duration-200 transform rounded-full shadow-md bg-gradient-to-r from-orange-400 to-orange-600 hover:shadow-lg hover:scale-105 hover:from-orange-500 hover:to-orange-700'
                disabled={submissionStatus === 'submitting'} // Disable button during submission
              >
                {submissionStatus === 'submitting' ? 'Sending...' : 'Send message'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
