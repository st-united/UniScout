import { Upload } from 'lucide-react';
import React from 'react';

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
  [key: string]: string;
}

interface UniversityFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  handleSubmit: (e: React.FormEvent) => void;
  handleFieldToggle: (field: string) => void;
  isSubmitting: boolean;
  submitMessage: string;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fieldsOpen: boolean;
  setFieldsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fieldsRef: React.RefObject<HTMLDivElement>;
  isEdit?: boolean;
}

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

const UniversityForm: React.FC<UniversityFormProps> = ({
  formData,
  setFormData,
  errors,
  setErrors,
  handleSubmit,
  handleFieldToggle,
  isSubmitting,
  submitMessage,
  handleLogoUpload,
  fieldsOpen,
  setFieldsOpen,
  fieldsRef,
  isEdit = false,
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div>
          <label htmlFor='universityName' className='block mb-1'>
            University Name *
          </label>
          <input
            id='universityName'
            type='text'
            name='universityName'
            value={formData.universityName}
            onChange={handleInputChange}
            className={`w-full border rounded px-3 py-2 ${
              errors.universityName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.universityName && (
            <p className='text-red-500 text-sm mt-1'>{errors.universityName}</p>
          )}
        </div>
        <div>
          <label htmlFor='country' className='block mb-1'>
            Country *
          </label>
          <input
            id='country'
            type='text'
            name='country'
            value={formData.country}
            onChange={handleInputChange}
            className={`w-full border rounded px-3 py-2 ${
              errors.country ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.country && <p className='text-red-500 text-sm mt-1'>{errors.country}</p>}
        </div>
        <div>
          <label htmlFor='logo-upload' className='block mb-1'>
            Logo *
          </label>
          <div className='flex flex-col items-center'>
            <div className='w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50'>
              {formData.logo ? (
                <img
                  src={URL.createObjectURL(formData.logo)}
                  alt='Logo'
                  className='w-full h-full object-cover rounded-lg'
                />
              ) : (
                <Upload className='w-8 h-8 text-gray-400' />
              )}
            </div>
            <label
              htmlFor='logo-upload'
              className='mt-2 cursor-pointer bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600'
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
            {errors.logo && <p className='text-red-500 text-sm mt-1'>{errors.logo}</p>}
          </div>
        </div>
      </div>

      {/* Continue other rows as in CreateUniversity: location, coordinates, type, etc. */}

      <div ref={fieldsRef} className='relative max-w-md'>
        <label htmlFor='fields-dropdown' className='block text-sm font-medium text-gray-700 mb-2'>
          Fields of Study
        </label>
        <button
          id='fields-dropdown'
          type='button'
          onClick={() => setFieldsOpen((open) => !open)}
          aria-haspopup='listbox'
          aria-expanded={fieldsOpen}
          aria-controls='fields-options-list'
          className={`w-full px-3 py-2 border rounded-md text-left focus:outline-none flex flex-wrap gap-1 items-center ${
            errors.fields ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {formData.fields.length === 0 ? (
            <span className='text-gray-400'>Select fields of study...</span>
          ) : (
            formData.fields.map((option) => (
              <span
                key={option}
                className='bg-orange-100 px-2 py-0.5 rounded flex items-center gap-1'
              >
                {option}
                <button
                  type='button'
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFieldToggle(option);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFieldToggle(option);
                    }
                  }}
                  aria-label={`Remove ${option}`}
                  className='ml-1 focus:outline-none'
                >
                  &times;
                </button>
              </span>
            ))
          )}
          <span className='ml-auto text-gray-500'>&#9662;</span>
        </button>

        {fieldsOpen && (
          <ul
            id='fields-options-list'
            role='listbox'
            className='absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-auto'
          >
            {fieldsOptions.map((option) => (
              <li key={option} role='option' aria-selected={formData.fields.includes(option)}>
                <button
                  type='button'
                  onClick={() => handleFieldToggle(option)}
                  className={`w-full text-left px-3 py-2 hover:bg-blue-100 flex items-center ${
                    formData.fields.includes(option) ? 'bg-blue-200 font-semibold' : ''
                  }`}
                >
                  <input
                    type='checkbox'
                    readOnly
                    checked={formData.fields.includes(option)}
                    className='mr-2'
                  />
                  {option}
                </button>
              </li>
            ))}
          </ul>
        )}

        {errors.fields && <p className='text-red-500 text-sm mt-1'>{errors.fields}</p>}
      </div>

      <div className='flex justify-end'>
        <button
          type='submit'
          disabled={isSubmitting}
          className='px-8 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50'
        >
          {isSubmitting
            ? isEdit
              ? 'Saving...'
              : 'Creating...'
            : isEdit
            ? 'Save Changes'
            : 'Create'}
        </button>
        {submitMessage && (
          <p
            className={`text-sm mt-4 ${
              submitMessage.includes('success') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {submitMessage}
          </p>
        )}
      </div>
    </form>
  );
};

export default UniversityForm;
