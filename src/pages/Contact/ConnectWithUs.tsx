import { VerticalAlignBottomOutlined, CloudUploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getNames } from 'country-list';
import { Paperclip } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
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

// Enums and constants for dropdowns
const universityTypes = [
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
  { label: 'Academy', value: 'academy' },
  { label: 'College', value: 'college' },
  { label: 'International', value: 'international' },
];
const fieldsOfStudy = [
  { label: 'Natural Sciences', value: 'natural_sciences', id: '9' },
  { label: 'Engineering & Technology', value: 'engineering_technology', id: '5' },
  { label: 'Information & Communication Technologies', value: 'ict', id: '8' },
  { label: 'Business Managment & Law', value: 'business_management_law', id: '3' },
  { label: 'Social & Behavioral Sciences', value: 'social_behavioral_sciences', id: '10' },
  { label: 'Humanities & Languages', value: 'humanities_languages', id: '7' },
  { label: 'Education & Training', value: 'education_training', id: '4' },
  { label: 'Arts & Design', value: 'arts_design', id: '2' },
  { label: 'Health & Medicine', value: 'health_medicine', id: '6' },
  {
    label: 'Agriculture & Veterinary Sciences',
    value: 'agricultural_veterinary_sciences',
    id: '1',
  },
  { label: 'Services', value: 'services', id: '11' },
  {
    label: 'Transport, Safety & Security, Military',
    value: 'transport_safety_security_military',
    id: '12',
  },
];

export default function ConnectWithUs() {
  const [fieldOfStudyOptions, setFieldOfStudyOptions] = useState<string[]>([]);

  const MAX_FRONTEND_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_FRONTEND_FILES = 5;

  // Tab state
  const [activeTab, setActiveTab] = useState<'new' | 'update'>('new');

  // --- New University Form State ---
  const [newUniData, setNewUniData] = useState({
    universityName: '',
    abbreviation: '', // Added abbreviation
    location: '',
    website: '',
    type: '',
    numberOfStudents: '',
    description: '',
    country: '',
    email: '',
    phone: '',
    subjectsFile: null as File | null, // For file upload
  });
  const [newUniErrors, setNewUniErrors] = useState<any>({});

  // --- Update Information Form State ---
  const [updateData, setUpdateData] = useState({
    representativeName: '',
    universityName: '',
    email: '',
    phone: '',
    message: '',
    attachment: [] as File[],
  });
  const [updateErrors, setUpdateErrors] = useState<any>({});

  // --- Shared State ---
  const [countries, setCountries] = useState<string[]>([]);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'success' | 'error' | 'submitting'
  >('idle');

  // Add state for drag-and-drop
  const [isDragging, setIsDragging] = useState(false);

  // Add ref for subjects file input
  const subjectsFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCountries(getNames());
  }, []);

  // --- Notification ---
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setTimeout(() => {
      setNotificationMessage(null);
      setNotificationType(null);
    }, 5000);
  };

  // --- Handlers for New University ---
  const handleNewUniChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewUniData((prev) => ({ ...prev, [name]: value }));
    setNewUniErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };

  const validateNewUni = () => {
    const errors: any = {};
    if (!newUniData.universityName) errors.universityName = 'Required.';
    if (!newUniData.location) errors.location = 'Required.';
    if (!newUniData.type) errors.type = 'Required.';
    if (!newUniData.country) errors.country = 'Required.';
    if (!newUniData.website) errors.website = 'Required.';
    if (!newUniData.email) errors.email = 'Required.';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(newUniData.email))
      errors.email = 'Invalid email.';
    if (!newUniData.phone) errors.phone = 'Required.';
    else if (!/^\+?\d+$/.test(newUniData.phone)) errors.phone = 'Only numbers and +.';
    // description is now optional, so no validation here
    return errors;
  };

  const handleNewUniSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateNewUni();
    if (Object.keys(errors).length > 0) {
      setNewUniErrors(errors);
      return;
    }
    setSubmissionStatus('submitting');
    try {
      const formData = new FormData();
      formData.append('representativeNumber', newUniData.phone); // university phone
      formData.append('representativeName', ''); // not collected, send empty
      formData.append('requestType', 'New University');
      formData.append('universityEmail', newUniData.email);
      formData.append('abbreviation', newUniData.abbreviation);
      if (newUniData.subjectsFile) {
        formData.append('subjectsExcel', newUniData.subjectsFile);
      }
      formData.append('location', newUniData.location);
      formData.append('country', newUniData.country);
      formData.append('files', 'string'); // as in curl
      formData.append('universityNumber', newUniData.phone); // university phone again
      formData.append('numberOfStudents', newUniData.numberOfStudents);
      formData.append('universityName', newUniData.universityName);
      formData.append('type', newUniData.type.toLowerCase());
      formData.append('website', newUniData.website);
      formData.append('description', newUniData.description);
      formData.append('representativeEmail', newUniData.email);

      // Debug: Log all FormData entries before sending
      for (const pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      await axios.post('https://api.uniscout.dev.stunited.vn/api/contact', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmissionStatus('success');
      showNotification('University submitted successfully.', 'success');
      setNewUniData({
        universityName: '',
        abbreviation: '',
        location: '',
        website: '',
        type: '',
        numberOfStudents: '',
        description: '',
        country: '',
        email: '',
        phone: '',
        subjectsFile: null,
      });
    } catch (err: any) {
      setSubmissionStatus('error');
      if (err.response) {
        console.error('API error:', err.response.data);
        showNotification(
          `Submission failed: ${err.response.data.message || 'Unknown error'}`,
          'error',
        );
      } else {
        showNotification('Submission failed.', 'error');
      }
    }
  };

  // Fetch subjects when broad field changes
  // useEffect(() => {
  //   const selectedBroadField = fieldsOfStudy.find((f) => f.value === newUniData.fieldsOfStudy);
  //   if (selectedBroadField) {
  //     axios
  //       .get(
  //         `https://api.uniscout.dev.stunited.vn/api/universities/subjects?academicFieldId=${selectedBroadField.id}`,
  //       )
  //       .then((res) => {
  //         setFieldOfStudyOptions(res.data.data.map((subject: any) => subject.name));
  //       });
  //     setNewUniData((prev) => ({ ...prev, FieldofStudy: '' })); // Clear specific field when broad changes
  //   } else {
  //     setFieldOfStudyOptions([]);
  //     setNewUniData((prev) => ({ ...prev, FieldofStudy: '' }));
  //   }
  // }, [newUniData.fieldsOfStudy]);

  const handleSubjectsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewUniData((prev) => ({ ...prev, subjectsFile: e.target.files![0] }));
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(
        'https://api.uniscout.dev.stunited.vn/api/contact/template/Sample.xlsx',
      );
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Example.xls'; // or 'Sample.xlsx' if you want the original name
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download template. Please try again later.');
    }
  };

  // --- Handlers for Update Information ---
  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUpdateData((prev) => ({ ...prev, [name]: value }));
    setUpdateErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };

  const handleUpdateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newErrors: any = { ...updateErrors };
      let currentFileCount = updateData.attachment.length;
      const validFilesToAdd: File[] = [];
      for (const file of selectedFiles) {
        if (file.size > MAX_FRONTEND_FILE_SIZE) {
          newErrors.attachment = `${file.name}: File size > 5MB.`;
          continue;
        }
        if (currentFileCount >= MAX_FRONTEND_FILES) {
          newErrors.attachment = `Max ${MAX_FRONTEND_FILES} files allowed.`;
          break;
        }
        validFilesToAdd.push(file);
        currentFileCount++;
      }
      setUpdateData((prev) => ({ ...prev, attachment: [...prev.attachment, ...validFilesToAdd] }));
      setUpdateErrors(newErrors);
      e.target.value = '';
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setUpdateData((prev) => ({
      ...prev,
      attachment: prev.attachment.filter((file) => file.name !== fileName),
    }));
    setUpdateErrors((prev: any) => ({ ...prev, attachment: undefined }));
  };

  const validateUpdate = () => {
    const errors: any = {};
    if (!updateData.representativeName) errors.representativeName = 'Required.';
    if (!updateData.universityName) errors.universityName = 'Required.';
    if (!updateData.email) errors.email = 'Required.';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(updateData.email))
      errors.email = 'Invalid email.';
    if (!updateData.phone) errors.phone = 'Required.';
    else if (!/^\+?\d+$/.test(updateData.phone)) errors.phone = 'Only numbers and +.';
    if (!updateData.message) errors.message = 'Required.';
    if (updateData.attachment.length > MAX_FRONTEND_FILES)
      errors.attachment = `Max ${MAX_FRONTEND_FILES} files allowed.`;
    for (const file of updateData.attachment) {
      if (file.size > MAX_FRONTEND_FILE_SIZE) errors.attachment = `${file.name}: File size > 5MB.`;
    }
    return errors;
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateUpdate();
    if (Object.keys(errors).length > 0) {
      setUpdateErrors(errors);
      return;
    }
    setSubmissionStatus('submitting');
    try {
      const formData = new FormData();
      formData.append('representativeNumber', updateData.phone || '');
      formData.append('message', updateData.message || '');
      formData.append('representativeName', updateData.representativeName || '');
      formData.append('requestType', 'Update Information');
      formData.append('universityEmail', '');
      formData.append('abbreviation', '');
      formData.append('subjectsExcel', '');
      formData.append('location', '');
      formData.append('country', '');
      formData.append('files', '');
      formData.append('universityNumber', '');
      formData.append('numberOfStudents', '');
      formData.append('universityName', updateData.universityName || '');
      formData.append('type', '');
      formData.append('website', '');
      formData.append('description', '');
      formData.append('representativeEmail', updateData.email || '');

      // Debug: Log all FormData entries before sending
      for (const pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      await axios.post('https://api.uniscout.dev.stunited.vn/api/contact', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmissionStatus('success');
      showNotification('Information updated successfully.', 'success');
      setUpdateData({
        representativeName: '',
        universityName: '',
        email: '',
        phone: '',
        message: '',
        attachment: [],
      });
      const fileInput = document.getElementById('attachment') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setSubmissionStatus('error');
      showNotification('Submission failed.', 'error');
    }
  };

  // Add drag-and-drop handlers for subjects file
  const handleSubjectsDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleSubjectsDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleSubjectsDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setNewUniData((prev) => ({ ...prev, subjectsFile: e.dataTransfer.files[0] }));
    }
  };

  // --- UI ---
  return (
    <div className='bg-orange-50 rounded-lg p-8 w-full max-w-6xl mx-auto shadow-sm relative'>
      {/* Notification */}
      {notificationMessage && notificationType && (
        <div
          className={`absolute top-4 right-4 z-10 p-3 rounded-xl shadow-lg flex items-center space-x-3 ${
            notificationType === 'success'
              ? 'bg-green-100 border border-green-300 text-green-700'
              : 'bg-red-100 border border-red-300 text-red-700'
          }`}
        >
          <span className='text-base font-semibold'>{notificationMessage}</span>
        </div>
      )}
      <h1 className='mb-2 text-4xl font-bold text-center text-orange-600'>Connect with us</h1>
      <p className='mb-10 leading-relaxed text-center text-gray-500'>
        Your Gateway to University Insights and Support!
      </p>
      {/* Tab Switcher with label */}
      <div className='flex flex-col md:flex-row md:items-center mb-8 gap-4 md:gap-6'>
        <span className='text-lg font-medium text-orange-600 whitespace-nowrap'>
          Select the purpose:
        </span>

        <div className='flex flex-wrap md:flex-nowrap w-full md:w-full shadow rounded-full bg-transparent'>
          <button
            type='button'
            className={`flex-1 h-10 min-w-[140px] md:min-w-[180px] rounded-l-full md:rounded-l-full md:rounded-r-none font-medium text-sm md:text-base transition-all duration-200 shadow-none border-none outline-none ${
              activeTab === 'new' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}
            onClick={() => {
              setActiveTab('new');
              setUpdateErrors({});
              setSubmissionStatus('idle');
            }}
          >
            New University
          </button>

          <button
            type='button'
            className={`flex-1 h-10 min-w-[140px] md:min-w-[180px] rounded-r-full md:rounded-r-full md:rounded-l-none font-medium text-sm md:text-base transition-all duration-200 shadow-none border-none outline-none ${
              activeTab === 'update' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}
            onClick={() => {
              setActiveTab('update');
              setNewUniErrors({});
              setSubmissionStatus('idle');
            }}
          >
            Update Information
          </button>
        </div>
      </div>

      {/* Form Section */}
      {activeTab === 'new' ? (
        <form onSubmit={handleNewUniSubmit} noValidate>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'>
            <div>
              <label
                htmlFor='new-universityName'
                className='block mb-2 text-sm font-medium text-orange-600'
              >
                University Name
              </label>
              <input
                id='new-universityName'
                type='text'
                name='universityName'
                value={newUniData.universityName}
                onChange={handleNewUniChange}
                className={`w-full border-0 border-b-2 ${
                  newUniErrors.universityName ? 'border-red-500' : 'border-[#E85A0C]'
                } rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400`}
                placeholder='Enter your university name'
              />
              {newUniErrors.universityName && (
                <p className='text-red-500 text-sm mt-1'>{newUniErrors.universityName}</p>
              )}
            </div>
            <div>
              <label
                htmlFor='new-abbreviation'
                className='block mb-2 text-sm font-medium text-orange-600'
              >
                Abbreviation
              </label>
              <input
                id='new-abbreviation'
                type='text'
                name='abbreviation'
                value={newUniData.abbreviation}
                onChange={handleNewUniChange}
                className='w-full border-0 border-b-2 border-[#E85A0C] rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400'
                placeholder='Enter your abbreviation'
              />
            </div>
            <div>
              <label
                htmlFor='new-country'
                className='block mb-2 text-sm font-medium text-orange-600'
              >
                Country
              </label>
              <select
                id='new-country'
                name='country'
                value={newUniData.country}
                onChange={handleNewUniChange}
                className={`!text-[#6B7280] w-full border-0 border-b-2 ${
                  newUniErrors.country ? 'border-red-500' : 'border-[#E85A0C]'
                } rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors text-gray-700`}
              >
                <option value='' disabled>
                  Select your country
                </option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              {newUniErrors.country && (
                <p className='text-red-500 text-sm mt-1'>{newUniErrors.country}</p>
              )}
            </div>
            <div>
              <label
                htmlFor='new-location'
                className='block mb-2 text-sm font-medium text-orange-600'
              >
                Location
              </label>
              <input
                id='new-location'
                type='text'
                name='location'
                value={newUniData.location}
                onChange={handleNewUniChange}
                className={`w-full border-0 border-b-2 ${
                  newUniErrors.location ? 'border-red-500' : 'border-[#E85A0C]'
                } rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400`}
                placeholder='Enter your location'
              />
              {newUniErrors.location && (
                <p className='text-red-500 text-sm mt-1'>{newUniErrors.location}</p>
              )}
            </div>
            <div>
              <label htmlFor='new-email' className='block mb-2 text-sm font-medium text-orange-600'>
                Email
              </label>
              <input
                id='new-email'
                type='email'
                name='email'
                value={newUniData.email}
                onChange={handleNewUniChange}
                className={`w-full border-0 border-b-2 ${
                  newUniErrors.email ? 'border-red-500' : 'border-[#E85A0C]'
                } rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400`}
                placeholder='Enter your email'
              />
              {newUniErrors.email && (
                <p className='text-red-500 text-sm mt-1'>{newUniErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor='new-phone' className='block mb-2 text-sm font-medium text-orange-600'>
                Phone
              </label>
              <input
                id='new-phone'
                type='text'
                name='phone'
                value={newUniData.phone}
                onChange={handleNewUniChange}
                className={`w-full border-0 border-b-2 ${
                  newUniErrors.phone ? 'border-red-500' : 'border-[#E85A0C]'
                } rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400`}
                placeholder='Enter your phone'
              />
              {newUniErrors.phone && (
                <p className='text-red-500 text-sm mt-1'>{newUniErrors.phone}</p>
              )}
            </div>
            <div>
              <label
                htmlFor='new-website'
                className='block mb-2 text-sm font-medium text-orange-600'
              >
                Website
              </label>
              <input
                id='new-website'
                type='text'
                name='website'
                value={newUniData.website}
                onChange={handleNewUniChange}
                className='w-full border-0 border-b-2 border-[#E85A0C] rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400'
                placeholder='Enter your website'
              />
              {newUniErrors.website && (
                <p className='text-red-500 text-sm mt-1'>{newUniErrors.website}</p>
              )}
            </div>
            <div>
              <label htmlFor='new-type' className='block mb-2 text-sm font-medium text-orange-600'>
                Type
              </label>
              <select
                id='new-type'
                name='type'
                value={newUniData.type}
                onChange={handleNewUniChange}
                className={`!text-[#6B7280] w-full border-0 border-b-2 ${
                  newUniErrors.type ? 'border-red-500' : 'border-[#E85A0C]'
                } rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors text-gray-700`}
              >
                <option value='' disabled>
                  Select your type
                </option>
                {universityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {newUniErrors.type && (
                <p className='text-red-500 text-sm mt-1'>{newUniErrors.type}</p>
              )}
            </div>
            <div>
              <label
                htmlFor='new-numberOfStudents'
                className='block mb-2 text-sm font-medium text-orange-600'
              >
                Number of students
              </label>
              <input
                id='new-numberOfStudents'
                type='number'
                name='numberOfStudents'
                value={newUniData.numberOfStudents}
                onChange={handleNewUniChange}
                onKeyDown={(e) => {
                  if (e.key === 'e' || e.key === 'E') {
                    e.preventDefault();
                  }
                }}
                className='w-full border-0 border-b-2 border-[#E85A0C] rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400'
                placeholder='Enter number of students'
                min={0}
              />
            </div>
            <div className='md:col-span-2'>
              <label
                htmlFor='new-description'
                className='block mb-2 text-sm font-medium text-orange-600'
              >
                Description
              </label>
              <textarea
                id='new-description'
                name='description'
                value={newUniData.description}
                onChange={handleNewUniChange}
                className={`w-full border-2 ${
                  newUniErrors.description ? 'border-red-500' : 'border-[#E85A0C]'
                } rounded-xl py-4 px-4 resize-y focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400 shadow-sm min-h-[80px]`}
                placeholder='Enter description about your university'
              />
              {newUniErrors.description && (
                <p className='text-red-500 text-sm mt-1'>{newUniErrors.description}</p>
              )}
            </div>
          </div>
          {/* Subjects Section */}
          <div className='mt-8'>
            <div className='text-lg font-semibold text-orange-600 mb-2'>Subjects</div>
            <div className='text-sm text-gray-500 mb-2'>
              Please download this Excel file to fill in the subjects, then upload the completed
              file.
            </div>
            <div className='flex items-center gap-4 mb-4'>
              <div className='flex items-center border border-gray-200 rounded-lg px-14 py-2 bg-white shadow-sm'>
                <img
                  src='./src/assets/images/excel-logo.png'
                  alt='Excel'
                  className='w-11 h-11 mr-3'
                />
                <span className='font-medium text-gray-700 text-l mr-28'>Example.xls</span>
                <span
                  onClick={handleDownloadTemplate}
                  className='text-orange-600 hover:text-orange-800 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer'
                  title='Download Example.xls'
                  style={{ border: 'none', background: 'none', boxShadow: 'none' }}
                  role='button'
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleDownloadTemplate();
                    }
                  }}
                >
                  <VerticalAlignBottomOutlined style={{ fontSize: 36 }} />
                </span>
              </div>
            </div>
            <div className='mb-2 text-sm text-gray-500'>
              Please upload your completed file below:
            </div>
            <div
              className={`border-2 border-dashed border-orange-300 rounded-xl p-6 flex flex-col items-center justify-center bg-orange-50 mb-4 ${
                isDragging ? 'bg-orange-100' : ''
              }`}
              onDragOver={handleSubjectsDragOver}
              onDragLeave={handleSubjectsDragLeave}
              onDrop={handleSubjectsDrop}
            >
              <input
                type='file'
                id='subjectsFile'
                name='subjectsFile'
                accept='.xls,.xlsx'
                onChange={handleSubjectsFileChange}
                className='hidden'
                ref={subjectsFileInputRef}
              />
              {!newUniData.subjectsFile && (
                <label htmlFor='subjectsFile' className='flex flex-col items-center cursor-pointer'>
                  <CloudUploadOutlined
                    style={{ fontSize: 40, color: '#f97316', marginBottom: '0.5rem' }}
                  />
                  <span className='text-gray-500'>
                    Drag your file or <span className='text-orange-500 underline'>browse</span>
                  </span>
                  <span className='text-xs text-gray-400 mt-1'>Max 5 MB files are allowed</span>
                </label>
              )}
              {newUniData.subjectsFile && (
                <div className='mt-2 flex items-center justify-center gap-2'>
                  <span className='text-base text-gray-800 font-medium bg-orange-100 px-3 py-1 rounded-full flex items-center'>
                    {newUniData.subjectsFile.name}
                    <button
                      type='button'
                      onClick={() => {
                        setNewUniData((prev) => ({ ...prev, subjectsFile: null }));
                        if (subjectsFileInputRef.current) {
                          subjectsFileInputRef.current.value = '';
                        }
                      }}
                      className='ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-white border border-orange-300 text-orange-600 hover:bg-orange-100 hover:text-orange-800 transition-colors'
                      title='Remove file'
                    >
                      &times;
                    </button>
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className='flex justify-end mt-8'>
            <button
              type='submit'
              className='px-10 py-3 font-medium text-white transition-all duration-200 transform rounded-full shadow-md bg-gradient-to-r from-orange-400 to-orange-600 hover:shadow-lg hover:scale-105 hover:from-orange-500 hover:to-orange-700 text-lg'
              disabled={submissionStatus === 'submitting'}
            >
              {submissionStatus === 'submitting' ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleUpdateSubmit} noValidate>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'>
            <div>
              <label
                htmlFor='update-representativeName'
                className='block mb-2 text-sm font-medium text-orange-600'
              >
                Representative Name
              </label>
              <input
                id='update-representativeName'
                type='text'
                name='representativeName'
                value={updateData.representativeName}
                onChange={handleUpdateChange}
                className={`w-full border-0 border-b-2 ${
                  updateErrors.representativeName ? 'border-red-500' : 'border-[#E85A0C]'
                } rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400`}
                placeholder='Enter your representative name'
              />
              {updateErrors.representativeName && (
                <p className='text-red-500 text-sm mt-1'>{updateErrors.representativeName}</p>
              )}
            </div>
            <div>
              <label
                htmlFor='update-universityName'
                className='block mb-2 text-sm font-medium text-orange-600'
              >
                University Name
              </label>
              <input
                id='update-universityName'
                type='text'
                name='universityName'
                value={updateData.universityName}
                onChange={handleUpdateChange}
                className={`w-full border-0 border-b-2 ${
                  updateErrors.universityName ? 'border-red-500' : 'border-[#E85A0C]'
                } rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400`}
                placeholder='Enter your university name'
              />
              {updateErrors.universityName && (
                <p className='text-red-500 text-sm mt-1'>{updateErrors.universityName}</p>
              )}
            </div>
            <div>
              <label
                htmlFor='update-email'
                className='block mb-2 text-sm font-medium text-orange-600'
              >
                Email
              </label>
              <input
                id='update-email'
                type='email'
                name='email'
                value={updateData.email}
                onChange={handleUpdateChange}
                className={`w-full border-0 border-b-2 ${
                  updateErrors.email ? 'border-red-500' : 'border-[#E85A0C]'
                } rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400`}
                placeholder='Enter your email'
              />
              {updateErrors.email && (
                <p className='text-red-500 text-sm mt-1'>{updateErrors.email}</p>
              )}
            </div>
            <div>
              <label
                htmlFor='update-phone'
                className='block mb-2 text-sm font-medium text-orange-600'
              >
                Phone
              </label>
              <input
                id='update-phone'
                type='text'
                name='phone'
                value={updateData.phone}
                onChange={handleUpdateChange}
                className={`w-full border-0 border-b-2 ${
                  updateErrors.phone ? 'border-red-500' : 'border-[#E85A0C]'
                } rounded-none bg-transparent py-3 px-0 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400`}
                placeholder='Enter your phone'
              />
              {updateErrors.phone && (
                <p className='text-red-500 text-sm mt-1'>{updateErrors.phone}</p>
              )}
            </div>
            <div className='md:col-span-2'>
              <label
                htmlFor='update-message'
                className='block mb-2 text-sm font-medium text-orange-600'
              >
                Your message
              </label>
              <div className='relative'>
                <textarea
                  id='update-message'
                  name='message'
                  value={updateData.message}
                  onChange={handleUpdateChange}
                  className={`w-full border-2 ${
                    newUniErrors.description ? 'border-red-500' : 'border-[#E85A0C]'
                  } rounded-xl py-4 px-4 resize-y focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400 shadow-sm min-h-[90px]`}
                />
                <input
                  type='file'
                  id='attachment'
                  name='attachment'
                  onChange={handleUpdateFileChange}
                  accept='.doc,.docx,.pdf,.jpg,.jpeg,.png,.gif'
                  multiple
                  className='hidden'
                />
              </div>
              {updateErrors.message && (
                <p className='text-red-500 text-sm mt-1'>{updateErrors.message}</p>
              )}
              <div className='mt-2 flex flex-wrap gap-2 text-sm'>
                {updateData.attachment.map((file, index) => (
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
              {updateErrors.attachment && (
                <p className='mt-2 text-sm text-red-500'>{updateErrors.attachment}</p>
              )}
            </div>
            <div className='md:col-span-2 flex justify-end'>
              <button
                type='submit'
                className='px-10 py-3 font-medium text-white transition-all duration-200 transform rounded-full shadow-md bg-gradient-to-r from-orange-400 to-orange-600 hover:shadow-lg hover:scale-105 hover:from-orange-500 hover:to-orange-700'
                disabled={submissionStatus === 'submitting'}
              >
                {submissionStatus === 'submitting' ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
