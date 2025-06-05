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
    <div className='bg-orange-50 rounded-lg p-8 w-full max-w-6xl mx-auto shadow-sm'>
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
                htmlFor='purpose-change-info'
                className='block text-orange-600 font-medium mb-2'
              >
                Select the purpose:
              </label>
              {errors.purpose && <p className='text-red-500 text-sm mt-1'>{errors.purpose}</p>}
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
              <label htmlFor='universityName" className="block text-orange-600 font-medium mb-2'>
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
              <label htmlFor='phoneNumber" className="block text-orange-600 font-medium mb-2'>
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
              <label htmlFor='email" className="block text-orange-600 font-medium mb-2'>
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
              {errors.country && <p className='text-red-500 text-sm mt-1'>{errors.country}</p>}
            </div>

            <div className='mb-6'>
              <label htmlFor='message" className="block text-orange-600 font-medium mb-2'>
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
                  accept='doc,.docx,.pdf'
                  className='hidden'
                />
                <label
                  htmlFor='attachment'
                  className='absolute bottom-3 right-3 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer'
                >
                  <Paperclip size={20} />
                </label>
              </div>
            </div>

            <div className='text-right'>
              <button
                type='submit'
                className='bg-orange-500 text-white py-3 px-8 rounded-full hover:bg-orange-600 transition-colors font-medium'
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
