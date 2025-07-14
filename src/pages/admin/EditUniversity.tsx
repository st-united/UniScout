import { InboxOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Form,
  Input,
  Switch,
  Select,
  Button,
  Upload,
  message,
  Typography,
  InputNumber,
  Spin,
} from 'antd';
import axios from 'axios';
import { Pencil } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { Dragger } = Upload;

// Types
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
  logoUrl?: string;
  abbreviation?: string;
  year?: number;
  exchange?: boolean;
  subjects?: string[];
  strength?: string;
}

// Mapping helpers
const mapApiToFormData = (data: any): UniversityData => ({
  universityName: data.name || data.university || '',
  abbreviation: data.abbreviation || '',
  country: data.country || '',
  location: data.location || '',
  latitude: data.latitude?.toString() || '',
  longitude: data.longitude?.toString() || '',
  type: data.type || '',
  numberOfStudents: data.studentPopulation || undefined,
  rank: data.rank || data.ranking || undefined,
  phone: data.contact || '',
  email: data.email || '',
  website: data.website || 'https://',
  description: data.description || '',
  fields:
    typeof data.academicFieldsCommaSeparated === 'string'
      ? data.academicFieldsCommaSeparated.split(',').map((f: string) => f.trim())
      : [],
  other: data.other || data.strength || '',
  logoUrl: data.logoUrl || data.logo || '',
  year: data.year || undefined,
  exchange: data.exchange?.toLowerCase() === 'yes',
  strength: data.strength || '',
  subjects: data.subjectsList ? data.subjectsList.split(',').map((s: string) => s.trim()) : [],
});

const mapToUpdateDto = (values: UniversityData) => ({
  university: values.universityName,
  abbreviation: values.abbreviation,
  country: values.country,
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
  year: values.year,
  exchange: values.exchange ? 'Yes' : '-',
  subjects: values.subjects || [],
});

const EditUniversity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string>('');
  const [isEditable, setIsEditable] = useState(false);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // Load initial university data
  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        setPageLoading(true);
        const { data } = await axios.get(`/admin/universities/${id}`);
        const formData = mapApiToFormData(data);
        form.setFieldsValue(formData);
        if (formData.logoUrl) setExistingLogoUrl(formData.logoUrl);
      } catch (err) {
        message.error('Failed to load university data');
        navigate('/universities');
      } finally {
        setPageLoading(false);
      }
    };

    if (id) fetchUniversity();
  }, [id, form, navigate]);
  // Load subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get('/universities/subjects');
        setAvailableSubjects(res.data?.data || []);
      } catch {
        message.error('Failed to load subjects');
      }
    };

    fetchSubjects();
  }, []);

  // Load meta (types, fields)
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [fieldsRes, typesRes] = await Promise.all([
          axios.get('/universities/academic-fields'),
          axios.get('/universities/types'),
        ]);
        setAvailableFields(fieldsRes.data?.data || []);
        setAvailableTypes(typesRes.data?.data || []);
      } catch {
        message.error('Failed to load metadata');
      }
    };
    fetchMeta();
  }, []);

  // Upload config
  const uploadProps = {
    name: 'logo',
    multiple: false,
    accept: 'image/*',
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isImage) {
        message.error('Only image files allowed!');
        return false;
      }
      if (!isLt5M) {
        message.error('Image must be < 5MB!');
        return false;
      }
      setLogoFile(file);
      form.setFieldsValue({ logo: file.name });
      return false;
    },
    onRemove: () => {
      setLogoFile(null);
      form.setFieldsValue({ logo: undefined });
    },
  };

  // Submit form
  const onFinish = async (values: UniversityData) => {
    setLoading(true);
    const dto = mapToUpdateDto(values);
    const formData = new FormData();

    Object.entries(dto).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(`${key}[]`, v ?? ''));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (logoFile) formData.append('logo', logoFile);

    try {
      await axios.patch(`/admin/universities/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('University updated successfully!');
      setIsEditable(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      message.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = async () => {
    try {
      const { data } = await axios.get(`/universities/${id}`);
      form.setFieldsValue(mapApiToFormData(data));
      setLogoFile(null);
      message.info('Form reset');
    } catch {
      message.error('Reset failed');
    }
  };

  // Loading state
  if (pageLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div className='p-6 bg-gray-100 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6'>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/universities')}
            className='mb-4'
          >
            Back
          </Button>
          <Title level={3}>{isEditable ? 'Edit University' : 'University Information'}</Title>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <Form
            form={form}
            layout='vertical'
            onFinish={onFinish}
            initialValues={{ website: 'https://', fields: [] }}
          >
            <div className='flex flex-col md:grid md:grid-cols-3 gap-6'>
              {/* Form Fields */}
              <div className='md:col-span-2 order-2 md:order-1'>
                <Form.Item
                  label='University Name'
                  name='universityName'
                  rules={[{ required: true }]}
                >
                  <Input disabled={!isEditable} className='rounded-md' />
                </Form.Item>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Form.Item label='Abbreviation' name='abbreviation' rules={[{ required: true }]}>
                    <Input disabled={!isEditable} className='rounded-md' />
                  </Form.Item>
                  <Form.Item label='Country' name='country' rules={[{ required: true }]}>
                    <Input disabled={!isEditable} className='rounded-md' />
                  </Form.Item>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <Form.Item label='Location' name='location' rules={[{ required: true }]}>
                    <Input disabled={!isEditable} className='rounded-md' />
                  </Form.Item>
                  <Form.Item label='Latitude' name='latitude'>
                    <Input disabled={!isEditable} className='rounded-md' />
                  </Form.Item>
                  <Form.Item label='Longitude' name='longitude'>
                    <Input disabled={!isEditable} className='rounded-md' />
                  </Form.Item>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <Form.Item label='University Type' name='type' rules={[{ required: true }]}>
                    <Select disabled={!isEditable} className='rounded-md'>
                      {availableTypes.map((type) => (
                        <Option key={type} value={type}>
                          {type
                            .split(' ')
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label='Student Population'
                    name='numberOfStudents'
                    rules={[{ required: true }]}
                  >
                    <InputNumber className='w-full rounded-md' disabled={!isEditable} />
                  </Form.Item>
                  <Form.Item label='Ranking' name='rank'>
                    <InputNumber className='w-full rounded-md' disabled={!isEditable} />
                  </Form.Item>
                  <Form.Item label='Year Established' name='year'>
                    <InputNumber
                      className='w-full rounded-md'
                      disabled={!isEditable}
                      min={1000}
                      max={new Date().getFullYear()}
                    />
                  </Form.Item>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Form.Item
                    label='Phone'
                    name='phone'
                    rules={[
                      { required: true },
                      { pattern: /^\+?[1-9]\d{1,14}$/, message: 'Invalid phone number' },
                    ]}
                  >
                    <Input disabled={!isEditable} className='rounded-md' />
                  </Form.Item>
                  <Form.Item
                    label='Email'
                    name='email'
                    rules={[{ required: true }, { type: 'email' }]}
                  >
                    <Input disabled={!isEditable} className='rounded-md' />
                  </Form.Item>
                </div>

                <Form.Item label='Website' name='website' rules={[{ required: true }]}>
                  <Input disabled={!isEditable} className='rounded-md' />
                </Form.Item>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Form.Item label='University Strength' name='strength'>
                    <Input disabled={!isEditable} className='rounded-md' />
                  </Form.Item>
                  <Form.Item label='Exchange Program' name='exchange' valuePropName='checked'>
                    <Switch disabled={!isEditable} />
                  </Form.Item>
                </div>
                <Form.Item label='Description' name='description'>
                  <TextArea
                    rows={4}
                    maxLength={1000}
                    showCount
                    disabled={!isEditable}
                    className='rounded-md'
                  />
                </Form.Item>

                <Form.Item label='Academic Fields' name='fields'>
                  <Select mode='multiple' disabled={!isEditable} className='w-full rounded-md'>
                    {availableFields.map((field) => (
                      <Option key={field} value={field}>
                        {field}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {form.getFieldValue('other') && form.getFieldValue('other') !== '-' && (
                  <Form.Item label='Other Information' name='other'>
                    <TextArea
                      rows={4}
                      maxLength={500}
                      showCount
                      disabled={!isEditable}
                      className='rounded-md'
                    />
                  </Form.Item>
                )}

                <Form.Item label='Subjects' name='subjects'>
                  <Select
                    mode='multiple'
                    disabled={!isEditable}
                    className='w-full rounded-md'
                    placeholder='Select subjects'
                  >
                    {availableSubjects.map((subject) => (
                      <Option key={subject} value={subject}>
                        {subject}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Buttons */}
                <div className='flex justify-end space-x-4 mt-6'>
                  {!isEditable ? (
                    <Button onClick={() => setIsEditable(true)} className='bg-[#ff7a00] text-white'>
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleReset}>Cancel</Button>
                      <Button
                        htmlType='submit'
                        loading={loading}
                        icon={<SaveOutlined />}
                        className='bg-[#ff7a00] text-white'
                      >
                        {loading ? 'Updating...' : 'Save Changes'}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Logo Upload */}
              <div className='flex flex-col items-center order-1 md:order-2'>
                <Form.Item name='logo'>
                  <div className='relative w-32 h-32'>
                    <Upload.Dragger
                      {...uploadProps}
                      showUploadList={false}
                      disabled={!isEditable}
                      className='absolute inset-0 z-10 opacity-0'
                    >
                      <div />
                    </Upload.Dragger>

                    <div className='relative w-full h-full group border border-gray-300 rounded-md overflow-hidden order-1 '>
                      <img
                        src={logoFile ? URL.createObjectURL(logoFile) : existingLogoUrl}
                        alt='University Logo'
                        className='w-full h-full object-contain'
                      />
                      {isEditable && (
                        <div className='absolute bottom-1 right-1 bg-[#ff7a00] rounded-full p-2 flex items-center justify-center'>
                          <Pencil size={20} color='white' />
                        </div>
                      )}
                    </div>
                  </div>
                </Form.Item>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EditUniversity;
