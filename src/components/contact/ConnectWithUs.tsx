import axios from 'axios';
import { Paperclip } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import SuccessNotification from './SuccessNotification';

interface FormData {
  purpose: string;
  universityName: string;
  representativeName: string;
  country: string;
  phoneNumber: string;
  email: string;
  message: string;
  attachment?: File | null;
}

interface FormErrors {
  purpose?: string;
  universityName?: string;
  representativeName?: string;
  country?: string;
  phoneNumber?: string;
  email?: string;
  message?: string;
}

export default function ConnectWithUs() {
  const [formData, setFormData] = useState<FormData>({
    purpose: 'Change Information',
    universityName: '',
    representativeName: '',
    country: '',
    phoneNumber: '',
    email: '',
    message: '',
    attachment: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isPurposeButtonClicked, setIsPurposeButtonClicked] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Test API connection on component mount
  // useEffect(() => {
  //   axios
  //     .post(
  //       'http://localhost:6002/api/api/contact',
  //       {
  //         representativeName: formData.representativeName,
  //         email: formData.email,
  //         message: formData.message,
  //         country: formData.country,
  //         universityName: formData.universityName,
  //         phoneNumber: formData.phoneNumber,
  //         purpose: formData.purpose,
  //         attachment: formData.attachment,
  //       },
  //       { timeout: 10000 },
  //     )
  //     .then(() => setApiStatus('connected'))
  //     .catch((err: unknown) => {
  //       console.error('API test failed:', err);
  //       setApiStatus('error');
  //     });
  // }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      if (/[^0-9]/.test(value)) {
        setErrors((prev) => ({ ...prev, [name]: 'Only numerical input is allowed.' }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, attachment: file }));
    }
  };

  const handlePurposeChange = (purpose: string) => {
    console.log('handlePurposeChange called with purpose:', purpose);
    console.log('Errors before clearing:', errors);
    setFormData((prev) => ({ ...prev, purpose }));
    setErrors({});
    setIsPurposeButtonClicked(true);
    console.log('Errors after clearing and purpose set:', {});
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.purpose) newErrors.purpose = 'Please select a purpose.';
    if (!formData.universityName) newErrors.universityName = 'University Name is required.';
    if (!formData.representativeName)
      newErrors.representativeName = 'Representative Name is required.';
    if (!formData.country) newErrors.country = 'Country is required.';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone Number is required.';
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.message) newErrors.message = 'Message is required.';

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
    setSubmissionStatus('idle');

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
      const res = await axios.post('/api/contact', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000,
      });
      if (res.status === 200 || res.status === 201) {
        setSubmissionStatus('success');
        setFormData({
          purpose: 'Change Information',
          universityName: '',
          representativeName: '',
          country: '',
          phoneNumber: '',
          email: '',
          message: '',
          attachment: null,
        });
        // Reset file input
        const fileInput = document.getElementById('attachment') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        setSubmissionStatus('error');
      }
    } catch (err: unknown) {
      console.error(err);
      setSubmissionStatus('error');
    } finally {
      setTimeout(() => setSubmissionStatus('idle'), 5000);
    }
  };

  return (
    <div className='w-full max-w-6xl p-8 mx-auto mt-10 rounded-lg shadow-sm bg-orange-50'>
      {submissionStatus === 'success' && (
        <SuccessNotification
          show={true}
          type='success'
          message='Your request has been submitted successfully.'
        />
      )}
      {submissionStatus === 'error' && (
        <SuccessNotification
          show={true}
          type='error'
          message='Your request could not be sent. Please try again later.'
        />
      )}
      <h1 className='mb-2 text-4xl font-bold text-center text-orange-600'>Connect with us</h1>
      <p className='mb-10 leading-relaxed text-center text-gray-500'>
        Your Gateway to University Insights and Support!
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-5'>
          {/* Left column for purpose buttons */}
          <div className='flex flex-col justify-start lg:col-span-1'>
            <span className='block mb-6 text-lg font-medium text-orange-600'>
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
            </div>
            {errors.purpose && <p className='mt-2 text-sm text-red-500'>{errors.purpose}</p>}
          </div>

          {/* Right column for form inputs */}
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
                className='w-full border-0 border-b-2 border-[#E85A0C] rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400'
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
                className='w-full border-0 border-b-2 border-[#E85A0C] rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400'
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
              <input
                type='text'
                id='country'
                name='country'
                value={formData.country}
                onChange={handleInputChange}
                className='w-full border-0 border-b-2 border-[#E85A0C] rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400'
                placeholder='Enter country'
              />
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
                type='text'
                id='phoneNumber'
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className='w-full border-0 border-b-2 border-[#E85A0C] rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400'
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
                className='w-full border-0 border-b-2 border-[#E85A0C] rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400'
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
                  className='w-full bg-white border-2 border-[#6e6c6c87] rounded-xl py-4 px-4 pr-12 resize-none focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400 shadow-sm'
                  rows={4}
                  placeholder='Enter your message here...'
                />
                {errors.message && <p className='mt-2 text-sm text-red-500'>{errors.message}</p>}
                <input
                  type='file'
                  id='attachment'
                  name='attachment'
                  onChange={handleFileChange}
                  accept='.doc,.docx,.pdf,.jpg,.jpeg,.png,.gif'
                  className='hidden'
                />
                <label
                  htmlFor='attachment'
                  className='absolute p-1 text-gray-400 transition-colors rounded-full cursor-pointer bottom-4 right-4 hover:text-orange-500 hover:bg-orange-50'
                  title={
                    formData.attachment ? `Selected: ${formData.attachment.name}` : 'Attach file'
                  }
                >
                  <Paperclip size={20} />
                </label>
              </div>
              {formData.attachment && (
                <p className='mt-2 text-sm text-gray-600'>
                  Selected file: {formData.attachment.name}
                </p>
              )}
            </div>

            <div className='flex justify-end col-span-1 md:col-span-3'>
              <button
                type='submit'
                className='px-10 py-3 font-medium text-white transition-all duration-200 transform rounded-full shadow-md bg-gradient-to-r from-orange-400 to-orange-600 hover:shadow-lg hover:scale-105 hover:from-orange-500 hover:to-orange-700'
              >
                Send message
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
