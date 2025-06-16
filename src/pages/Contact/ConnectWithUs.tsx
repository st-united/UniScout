import axios from 'axios';
import { Paperclip } from 'lucide-react';
import React, { useState, useEffect } from 'react';

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
  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'success' | 'error' | 'submitting'
  >('idle');
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | null>(null);
  const [countries, setCountries] = useState<string[]>([]);

  // Constants for file upload limits (matching backend)
  const MAX_FRONTEND_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_FRONTEND_FILES = 5;

  // Effect hook to populate the countries list on component mount
  useEffect(() => {
    // Mock countries list - replace with actual country-list import or API call
    setCountries([
      'Vietnam',
      'United States',
      'United Kingdom',
      'Canada',
      'Australia',
      'Germany',
      'France',
      'Japan',
      'South Korea',
      'Singapore',
    ]);
  }, []);

  // Function to show notifications
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setTimeout(() => {
      setNotificationMessage(null);
      setNotificationType(null);
    }, 5000); // Notification disappears after 5 seconds
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
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
        attachment: [...prev.attachment, ...validFilesToAdd],
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
    setFormData((prev) => ({ ...prev, requestType: type }));
    setErrors((prev) => ({ ...prev, requestType: undefined }));
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
      newErrors.phoneNumber = 'Only numerical input and + is allowed for phone number.';
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
      setSubmissionStatus('idle');
      return;
    }

    setErrors({});
    setSubmissionStatus('submitting');

    try {
      const dataToSend = new FormData();

      // Append text fields
      dataToSend.append('requestType', RequestTypeBackendMap[formData.requestType]);
      dataToSend.append('universityName', formData.universityName);
      dataToSend.append('name', formData.representativeName); // Representative name maps to 'name' on backend
      dataToSend.append('country', formData.country);
      dataToSend.append('phoneNumber', formData.phoneNumber);
      dataToSend.append('email', formData.email);
      dataToSend.append('message', formData.message);

      // Append files
      formData.attachment.forEach((file) => {
        dataToSend.append('files', file); // 'files' is the expected field name on the backend
      });

      // Log data being sent (for debugging)
      console.log('Sending data:', {
        requestType: RequestTypeBackendMap[formData.requestType],
        universityName: formData.universityName,
        name: formData.representativeName,
        country: formData.country,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        message: formData.message,
        attachmentNames: formData.attachment.map((f) => f.name).join(', '), // Log names for attachments
      });

      const response = await axios.post('contact', dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data', // Axios automatically sets boundary
        },
        timeout: 30000, // 30 seconds timeout
      });

      console.log('Response:', response.data);

      if (response.status === 201 || response.status === 200) {
        setSubmissionStatus('success');
        showNotification('Send message successfully!', 'success');
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

        // Clear file input visually
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
                // Generic file error
                parsedErrors.attachment = err;
              } else {
                parsedErrors.general = parsedErrors.general
                  ? `${parsedErrors.general}; ${err}`
                  : err;
              }
            });
          } else if (Array.isArray(backendErrorMessage)) {
            // If backend returns an array of messages
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

      <h2 className='text-4xl font-bold text-orange-500 text-center mb-2'>Connect with us</h2>
      <p className='text-gray-500 text-center mb-8'>
        Your Gateway to University Insights and Support!
      </p>
      <form onSubmit={handleSubmit} noValidate>
        {/* Purpose selection buttons - always full width */}
        <div className='mb-6'>
          <label
            htmlFor='requestType-change-info'
            className='block text-orange-600 font-medium mb-2'
          >
            Select the purpose:
          </label>
          {errors.requestType && <p className='text-red-500 text-sm mt-1'>{errors.requestType}</p>}
          <div className='flex flex-wrap gap-4'>
            {' '}
            {/* Use flex for button spacing */}
            <button
              type='button'
              id='requestType-change-info'
              className={`px-6 py-2 rounded-full shadow-sm ${
                formData.requestType === RequestTypeEnum.CHANGE_INFORMATION
                  ? 'bg-orange-400 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-400'
              } transition-colors focus:outline-none`}
              onClick={() => handleRequestTypeChange(RequestTypeEnum.CHANGE_INFORMATION)}
            >
              {RequestTypeEnum.CHANGE_INFORMATION}
            </button>
            <button
              type='button'
              className={`px-6 py-2 rounded-full shadow-sm ${
                formData.requestType === RequestTypeEnum.COOPERATION
                  ? 'bg-orange-400 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-400'
              } transition-colors focus:outline-none`}
              onClick={() => handleRequestTypeChange(RequestTypeEnum.COOPERATION)}
            >
              {RequestTypeEnum.COOPERATION}
            </button>
          </div>
        </div>

        {/* Main form fields arranged in a two-column grid on medium and larger screens */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'>
          {/* University Name */}
          <div>
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
              placeholder='Enter your university name'
            />
            {errors.universityName && (
              <p className='text-red-500 text-sm mt-1'>{errors.universityName}</p>
            )}
          </div>

          {/* Representative Name */}
          <div>
            <label htmlFor='representativeName' className='block text-orange-600 font-medium mb-2'>
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
              placeholder='Enter your representative name'
            />
            {errors.representativeName && (
              <p className='text-red-500 text-sm mt-1'>{errors.representativeName}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
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
              placeholder='Enter your phone number'
            />
            {errors.phoneNumber && (
              <p className='text-red-500 text-sm mt-1'>{errors.phoneNumber}</p>
            )}
          </div>

          {/* Country Dropdown */}
          <div>
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

          {/* Email */}
          <div>
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
              placeholder='Enter your email'
            />
            {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
          </div>

          {/* Your message + Attachment */}
          <div className='md:col-span-2'>
            {' '}
            {/* This div should span both columns */}
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
                } bg-transparent rounded-lg py-2 pl-3 pr-20 focus:outline-none focus:border-orange-500 transition-colors resize-y`}
                placeholder='Type your message here...'
              ></textarea>

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
                className='absolute bottom-3 right-5 flex items-center text-gray-400 hover:text-orange-500 transition-colors cursor-pointer'
                title={`Attach files (max ${MAX_FRONTEND_FILES}, 5MB each)`}
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
            {errors.attachment && <p className='text-red-500 text-sm mt-1'>{errors.attachment}</p>}
          </div>
        </div>

        {/* Submit Button - spans two columns and aligns right */}
        <div className='text-right mt-8 md:col-span-2'>
          {' '}
          {/* md:col-span-2 ensures it moves below both columns */}
          <button
            type='submit'
            className='bg-orange-500 text-white py-3 px-8 rounded-full hover:bg-orange-600 font-medium focus:outline-none'
            disabled={submissionStatus === 'submitting'}
          >
            {submissionStatus === 'submitting' ? 'Sending...' : 'Send message'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
