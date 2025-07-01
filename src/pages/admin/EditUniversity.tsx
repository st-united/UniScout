import { InboxOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  Card,
  Row,
  Col,
  message,
  Typography,
  InputNumber,
  Spin,
} from 'antd';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { Dragger } = Upload;

interface UniversityData {
  universityName: string;
  country: string;
  location: string;
  latitude?: string;
  longitude?: string;
  type: string;
  numberOfStudents?: number;
  rank?: number;
  phone: string;
  email: string;
  website: string;
  description?: string;
  fields: string[];
  other?: string;
  logo?: File;
  logoUrl?: string; // For displaying existing logo
}

const EditUniversity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string>('');
  const [isEditable, setIsEditable] = useState(false);

  const fieldsOptions = [
    'Science & Engineering',
    'Economics, Business & Management',
    'Social Sciences & Humanities',
    'Medicine, Pharmacy & Health Sciences',
    'Arts & Design',
    'Law & Political Science',
    'Agriculture & Food Science',
    'Sports & Physical Education',
    'Emerging Technologies & Interdisciplinary Studies',
    'Other',
  ];

  const universityTypes = [
    { value: 'Public', label: 'Public' },
    { value: 'Private', label: 'Private' },
    { value: 'Academy', label: 'Academy' },
    { value: 'International', label: 'International' },
  ];

  // Fetch university data on component mount
  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        setPageLoading(true);
        const response = await axios.get(`/universities/${id}`);
        const universityData = response.data;
        if (!universityData) {
          message.error('University not found');
          navigate('/admin/universities'); // Redirect if not found
          return;
        }
        // Map the data to match the form structure
        const formData = {
          universityName:
            universityData.name || universityData.universityName || universityData.university || '',
          country: universityData.country || '',
          location: universityData.location || '',
          latitude: universityData.latitude || '',
          longitude: universityData.longitude || '',
          type: universityData.type || '',
          numberOfStudents:
            universityData.studentPopulation || universityData.numberOfStudents || undefined,
          rank: universityData.rank || universityData.ranking || undefined,
          phone: universityData.contact || universityData.phone || '',
          email: universityData.email || '',
          website: universityData.website || 'https://',
          description: universityData.description || '',
          fields: universityData.academicFields || [],
          other: universityData.other || '',
        };

        // Set form values
        form.setFieldsValue(formData);

        // Set existing logo URL if available
        if (universityData.logoUrl || universityData.logo) {
          setExistingLogoUrl(universityData.logoUrl || universityData.logo);
        }
      } catch (error) {
        message.error('Failed to load university data');
        navigate('/admin/universities'); // Redirect back if fetch fails
      } finally {
        setPageLoading(false);
      }
    };

    if (id) {
      fetchUniversity();
    }
  }, [id, form, navigate]);

  const uploadProps = {
    name: 'logo',
    multiple: false,
    accept: 'image/*',
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return false;
      }

      setLogoFile(file);
      form.setFieldsValue({ logo: file.name });
      message.success(`${file.name} selected successfully`);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setLogoFile(null);
      form.setFieldsValue({ logo: undefined });
    },
  };

  // Handle form submission
  const onFinish = async (values: UniversityData) => {
    setLoading(true);

    const dto = mapToUpdateDto(values);
    const formData = new FormData();

    // Append form values to FormData
    Object.entries(dto).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(`${key}[]`, v != null ? String(v) : ''));
      } else if (value !== undefined && value !== null) {
        formData.append(key, typeof value === 'number' ? String(value) : value);
      }
    });
    // Append logo file if it exists
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    // Append university ID
    try {
      const response = await axios.patch(`/universities/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      message.success('University updated successfully!');
      navigate('/admin/universities');
    } catch (error: any) {
      console.error('Error updating university:', error);
      if (error.response?.data?.message) {
        message.error(
          Array.isArray(error.response.data.message)
            ? error.response.data.message.join(', ')
            : error.response.data.message,
        );
      } else {
        message.error('Failed to update university');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Reset form to original values by refetching data
    const fetchUniversityForReset = async () => {
      try {
        const response = await axios.get(`/universities/${id}`);
        const universityData = response.data;

        const formData = {
          universityName: universityData.name || universityData.universityName || '',
          country: universityData.country || '',
          location: universityData.location || '',
          latitude: universityData.latitude || '',
          longitude: universityData.longitude || '',
          type: universityData.type || '',
          numberOfStudents: universityData.numberOfStudents || undefined,
          rank: universityData.rank || universityData.ranking || undefined,
          phone: universityData.phone || '',
          email: universityData.email || '',
          website: universityData.website || 'https://',
          description: universityData.description || '',
          fields: universityData.fields || [],
          other: universityData.other || '',
        };

        form.setFieldsValue(formData);
        setLogoFile(null);
        message.info('Form reset to original values');
      } catch (error) {
        message.error('Failed to reset form');
      }
    };

    fetchUniversityForReset();
  };

  // Show loading spinner while fetching data
  if (pageLoading) {
    return (
      <div
        style={{
          padding: '24px',
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spin size='large' />
      </div>
    );
  }
  // Map form values to DTO structure
  const mapToUpdateDto = (values: UniversityData) => {
    return {
      university: values.universityName,
      country: Array.isArray(values.country) ? values.country : [values.country],
      location: values.location,
      latitude: values.latitude ? Number(values.latitude) : undefined,
      longitude: values.longitude ? Number(values.longitude) : undefined,
      type: values.type?.toLowerCase(),
      studentPopulation: values.numberOfStudents,
      rank: values.rank,
      contact: values.phone,
      email: values.email,
      website: values.website.startsWith('http') ? values.website : `https://${values.website}`,
      description: values.description,
      academicFields: values.fields || [],
      strength: values.other,
    };
  };

  return (
    <div className='p-6 bg-gray-100 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6'>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/universities')}
            className='mb-4'
          >
            Back to Universities
          </Button>
          <Title level={2}>Edit University</Title>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <Form
            form={form}
            layout='vertical'
            onFinish={onFinish}
            initialValues={{ website: 'https://', fields: [] }}
          >
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {/* Col 1 */}
              <div className='md:col-span-2'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Form.Item
                    label='University Name'
                    name='universityName'
                    aria-label='universityName'
                    rules={[{ required: true }]}
                  >
                    <Input disabled={!isEditable} />
                  </Form.Item>
                  <Form.Item
                    label='Country'
                    name='country'
                    aria-label='country'
                    rules={[{ required: true }]}
                  >
                    <Input disabled={!isEditable} />
                  </Form.Item>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <Form.Item
                    label='Location'
                    name='location'
                    aria-label='location'
                    rules={[{ required: true }]}
                  >
                    <Input disabled={!isEditable} />
                  </Form.Item>
                  <Form.Item label='Latitude' name='latitude' aria-label='latitude'>
                    <Input disabled={!isEditable} />
                  </Form.Item>
                  <Form.Item label='Longitude' name='longitude' aria-label='longitude'>
                    <Input disabled={!isEditable} />
                  </Form.Item>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4' aria-label='universityType'>
                  <Form.Item label='University Type' name='type' rules={[{ required: true }]}>
                    <Select disabled={!isEditable}>
                      {universityTypes.map((type) => (
                        <Option key={type.value} value={type.value}>
                          {type.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label='Number of Students'
                    name='numberOfStudents'
                    rules={[{ required: true, message: 'Please enter the number of students' }]}
                  >
                    <InputNumber
                      className='w-full'
                      disabled={!isEditable}
                      formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                  <Form.Item label='Ranking' name='rank'>
                    <InputNumber className='w-full' disabled={!isEditable} />
                  </Form.Item>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Form.Item
                    label='Phone'
                    name='phone'
                    rules={[
                      { required: true, message: 'Please enter a phone number' },
                      { pattern: /^\+?[1-9]\d{1,14}$/, message: 'Invalid phone number' },
                    ]}
                  >
                    <Input disabled={!isEditable} />
                  </Form.Item>
                  <Form.Item
                    label='Email'
                    name='email'
                    aria-label='email'
                    rules={[
                      { required: true, message: 'Please enter an email' },
                      { type: 'email', message: 'Invalid email address' },
                    ]}
                  >
                    <Input disabled={!isEditable} />
                  </Form.Item>
                </div>

                <Form.Item label='Website' name='website' rules={[{ required: true }]}>
                  <Input disabled={!isEditable} />
                </Form.Item>

                <Form.Item label='Description' name='description'>
                  <TextArea rows={4} showCount maxLength={1000} disabled={!isEditable} />
                </Form.Item>

                <Form.Item label='Academic Fields' name='fields'>
                  <Select mode='multiple' disabled={!isEditable} className='w-full'>
                    {fieldsOptions.map((field) => (
                      <Option key={field} value={field}>
                        {field}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label='Other Information' name='other'>
                  <TextArea rows={4} showCount maxLength={500} disabled={!isEditable} />
                </Form.Item>
                {/* Action Buttons */}
                <div className='flex justify-end space-x-4 mt-6'>
                  {!isEditable ? (
                    <Button
                      onClick={() => setIsEditable(true)}
                      typeof='button'
                      className='bg-[#ff7a00] border-[#ff7a00] text-white 
                      hover:!bg-[#ff7a00] hover:!border-[#ff7a00] hover:!text-white
                      focus:!shadow-none focus:!bg-[#ff7a00] focus:!border-[#ff7a00] focus:!text-white rounded-md'
                    >
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleReset}
                        className='bg-gray-200 border-gray-300 text-gray-800'
                      >
                        Reset
                      </Button>
                      <Button
                        htmlType='submit'
                        loading={loading}
                        icon={<SaveOutlined />}
                        className='bg-[#ff7a00] border-[#ff7a00] text-white 
                          hover:!bg-[#ff7a00] hover:!border-[#ff7a00] hover:!text-white
                          focus:!shadow-none focus:!bg-[#ff7a00] focus:!border-[#ff7a00] focus:!text-white'
                      >
                        {loading ? 'Updating...' : 'Update University'}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Col 2: Logo Upload */}
              <div className='flex flex-col items-center'>
                <Form.Item label='Logo' name='logo'>
                  <Dragger {...uploadProps} disabled={!isEditable}>
                    <p className='ant-upload-drag-icon'>
                      <InboxOutlined />
                    </p>
                    <p className='ant-upload-text'>Click or drag file to upload</p>
                    <p className='ant-upload-hint'>Upload new logo (optional)</p>
                  </Dragger>
                </Form.Item>

                {existingLogoUrl && !logoFile && (
                  <div className='mt-4 text-center'>
                    <img
                      src={existingLogoUrl}
                      alt='Current logo'
                      className='h-16 object-contain mx-auto'
                    />
                    <div className='text-xs text-gray-500 mt-1'>Current logo</div>
                  </div>
                )}
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EditUniversity;
