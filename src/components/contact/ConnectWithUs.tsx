import { Paperclip } from 'lucide-react';
import React, { useState } from 'react';

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

const ContactForm: React.FC = () => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      // Check if the value contains any non-digit characters
      if (/[^0-9]/.test(value)) {
        // If non-digits are present, set an error and do not update formData with invalid chars
        setErrors((prev) => ({ ...prev, [name]: 'Only numerical input is allowed.' }));
      } else {
        // If only digits, clear the error and update formData
        setErrors((prev) => ({ ...prev, [name]: undefined }));
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      // For other fields, update formData and clear error as before
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
    setFormData((prev) => ({ ...prev, purpose }));
    setErrors((prev) => ({ ...prev, purpose: undefined }));
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

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmissionStatus('idle');
      return;
    }

    setErrors({});
    setSubmissionStatus('idle');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const success = true;

      if (success) {
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
        setTimeout(() => {
          setSubmissionStatus('idle');
        }, 5000);
      } else {
        setSubmissionStatus('error');
        setTimeout(() => {
          setSubmissionStatus('idle');
        }, 5000);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStatus('error');
      setTimeout(() => {
        setSubmissionStatus('idle');
      }, 5000);
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
      <h2 className='mb-2 text-4xl font-bold text-center text-orange-500'>Connect with us</h2>
      <p className='mb-8 text-center text-gray-500'>
        Your Gateway to University Insights and Support!
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
          {/* Left Column */}
          <div className='lg:col-span-5'>
            <div className='mb-6'>
              <label
                htmlFor='purpose-change-info'
                className='block mb-2 font-medium text-orange-600'
              >
                Select the purpose:
              </label>
              {errors.purpose && <p className='mt-1 text-sm text-red-500'>{errors.purpose}</p>}
              <div className='space-x-4'>
                <button
                  type='button'
                  id='purpose-change-info'
                  className={`px-6 py-2 rounded-full ${
                    formData.purpose === 'Change Information'
                      ? 'bg-orange-400 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  } transition-colors`}
                  onClick={() => handlePurposeChange('Change Information')}
                >
                  Change Information
                </button>
                <button
                  type='button'
                  className={`px-6 py-2 rounded-full ${
                    formData.purpose === 'Cooperation'
                      ? 'bg-orange-400 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  } transition-colors`}
                  onClick={() => handlePurposeChange('Cooperation')}
                >
                  Cooperation
                </button>
              </div>
            </div>

            <div className='mb-6'>
              <label htmlFor='universityName" className="block mb-2 font-medium text-orange-600'>
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
                <p className='mt-1 text-sm text-red-500'>{errors.universityName}</p>
              )}
            </div>

            <div className='mb-6'>
              <label htmlFor='phoneNumber" className="block mb-2 font-medium text-orange-600'>
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
                <p className='mt-1 text-sm text-red-500'>{errors.phoneNumber}</p>
              )}
            </div>

            <div className='mb-6'>
              <label htmlFor='email" className="block mb-2 font-medium text-orange-600'>
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
              {errors.email && <p className='mt-1 text-sm text-red-500'>{errors.email}</p>}
            </div>
          </div>

          {/* Right Column */}
          <div className='lg:col-span-7'>
            <div className='mb-6'>
              <label
                htmlFor='representativeName'
                className='block mb-2 font-medium text-orange-600'
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
                <p className='mt-1 text-sm text-red-500'>{errors.representativeName}</p>
              )}
            </div>

            <div className='mb-6'>
              <label htmlFor='country' className='block mb-2 font-medium text-orange-600'>
                Country
              </label>
              <input
                type='text'
                id='country'
                name='country'
                value={formData.country}
                onChange={handleInputChange}
                className={`w-full border-b-2 ${
                  errors.country ? 'border-red-500' : 'border-orange-300'
                } bg-transparent py-2 px-0 focus:outline-none focus:border-orange-500 transition-colors`}
              />
              {errors.country && <p className='mt-1 text-sm text-red-500'>{errors.country}</p>}
            </div>

            <div className='mb-6'>
              <label htmlFor='message" className="block mb-2 font-medium text-orange-600'>
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
                {errors.message && <p className='mt-1 text-sm text-red-500'>{errors.message}</p>}
                <input
                  type='file'
                  id='attachment'
                  name='attachment'
                  onChange={handleFileChange}
                  accept='doc,.docx,.pdf'
                  className='hidden'
                />
                <label
                  htmlFor='attachment'
                  className='absolute text-gray-400 transition-colors cursor-pointer bottom-3 right-3 hover:text-orange-500'
                >
                  <Paperclip size={20} />
                </label>
              </div>
            </div>

            <div className='text-right'>
              <button
                type='submit'
                className='px-8 py-3 font-medium text-white transition-colors bg-orange-500 rounded-full hover:bg-orange-600'
              >
                Send message
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
