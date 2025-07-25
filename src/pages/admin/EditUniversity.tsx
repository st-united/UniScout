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
  ConfigProvider,
  Spin,
} from 'antd';
import axios from 'axios';
import { Pencil } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import AdminHeader from '../../components/AdminHeader';
import LayoutWrapper from '../../components/LayoutWrapper';

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
  academicFields: string[];

  other?: string;
  logo?: File;
  logoUrl?: string;
  abbreviation?: string;
  year?: number;
  exchange?: boolean;
  subjects?: string[];
  strength?: string;
}
const fieldNamesOptions = [
  { value: 'agricultural_veterinary_sciences', label: 'Agricultural & Veterinary Sciences' },
  { value: 'arts_design', label: 'Arts & Design' },
  { value: 'business_management_law', label: 'Business, Management & Law' },
  { value: 'education_training', label: 'Education & Training' },
  { value: 'engineering_technology', label: 'Engineering & Technology' },
  { value: 'health_medicine', label: 'Health & Medicine' },
  { value: 'humanities_languages', label: 'Humanities & Languages' },
  { value: 'ict', label: 'Information & Communication Technology (ICT)' },
  { value: 'natural_sciences', label: 'Natural Sciences' },
  { value: 'social_behavioral_sciences', label: 'Social & Behavioral Sciences' },
  { value: 'services', label: 'Services' },
  { value: 'transport_safety_security_military', label: 'Transport, Safety, Security & Military' },
  { value: 'other', label: 'Other' },
];
const fieldSearchMapping: Record<string, string> = {
  agricultural_veterinary_sciences: 'agricultural',
  arts_design: 'art',
  business_management_law: 'business',
  education_training: 'education',
  engineering_technology: 'engineering',
  health_medicine: 'health',
  humanities_languages: 'humanities',
  ict: 'information tech',
  natural_sciences: 'natural',
  social_behavioral_sciences: 'social',
  services: 'services',
  transport_safety_security_military: 'transport',
  other: 'other',
};

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
  academicFields:
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
  strength: values.other,
  year: values.year,
  exchange: values.exchange ? 'Yes' : '-',
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
  const [fieldSubjectsMap, setFieldSubjectsMap] = useState<Record<string, string[]>>({});
  const [loadingSubjects, setLoadingSubjects] = useState<Record<string, boolean>>({});

  const handleAcademicFieldsChange = async (selectedFields: string[]) => {
    const updatedMap = { ...fieldSubjectsMap };
    const updatedLoading = { ...loadingSubjects };
    const existingSubjects = form.getFieldValue('subjects') || [];

    selectedFields.forEach((field) => {
      if (!updatedMap[field]) {
        updatedLoading[field] = true;
      }
    });

    setLoadingSubjects(updatedLoading);

    await Promise.all(
      selectedFields.map(async (field) => {
        if (updatedMap[field]) return;

        try {
          const res = await axios.get('/universities/subjects', {
            params: { search: fieldSearchMapping[field] || field },
          });

          const apiSubjects = res.data?.data || [];
          const apiNames = apiSubjects.map((s: any) => s.name || s.title || s.subject || s);

          const merged = Array.from(new Set([...apiNames, ...existingSubjects]));
          updatedMap[field] = merged;
        } catch (err) {
          message.error(`Failed to load subjects for ${field}`);
          updatedMap[field] = [];
        } finally {
          updatedLoading[field] = false;
        }
      }),
    );

    setFieldSubjectsMap(updatedMap);
    setLoadingSubjects(updatedLoading);
  };

  // Load initial university data
  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        const { data } = await axios.get(`/admin/universities/${id}`);

        const formData = mapApiToFormData(data);
        form.setFieldsValue(formData);

        const selectedFields = formData.academicFields || [];
        const subjectList = formData.subjects || [];

        const updatedSubjects: Record<string, string[]> = {};
        const updatedMap: Record<string, string[]> = {};
        const updatedLoading: Record<string, boolean> = {};

        await Promise.all(
          selectedFields.map(async (field) => {
            try {
              const res = await axios.get('/universities/subjects', {
                params: { search: fieldSearchMapping[field] || field },
              });

              const apiSubjects = res.data?.data || [];
              const apiNames = apiSubjects.map((s: any) => s.name || s.title || s.subject || s);

              updatedMap[field] = Array.from(new Set(apiNames));
              updatedSubjects[`subjects_${field}`] = subjectList.filter((s) =>
                updatedMap[field].includes(s),
              );
            } catch {
              updatedMap[field] = [];
              updatedSubjects[`subjects_${field}`] = [];
            } finally {
              updatedLoading[field] = false;
            }
          }),
        );

        setFieldSubjectsMap(updatedMap);
        setLoadingSubjects(updatedLoading);
        form.setFieldsValue(updatedSubjects);

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
  const excelUploadProps = {
    name: 'subjectsExcelFile',
    multiple: false,
    accept: '.xlsx,.xls,.csv',
    beforeUpload: (file: File) => {
      const isExcel =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        file.name.endsWith('.csv');

      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isExcel) {
        message.error('Only Excel or CSV files are allowed!');
        return false;
      }
      if (!isLt5M) {
        message.error('File must be smaller than 5MB!');
        return false;
      }

      return true; // Accept file
    },
    onRemove: () => {
      form.setFieldsValue({ subjectsExcelFile: undefined });
    },
  };

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
  const onFinish = async (values: UniversityData & Record<string, any>) => {
    setLoading(true);

    const dto = mapToUpdateDto(values);

    const formData = new FormData();

    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (logoFile) {
      formData.append('logo', logoFile);
    }

    const subjectsFile = form.getFieldValue('subjectsExcelFile');
    if (subjectsFile && subjectsFile.length > 0) {
      formData.append('subjectsExcel', subjectsFile[0].originFileObj);
    }

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

  // Loading state
  if (pageLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#ff7a00',
          colorLink: '#ff7a00',
          colorLinkHover: '#e96b00',
        },
      }}
    >
      <div className='p-6 bg-gray-100 min-h-screen'>
        <AdminHeader />
        <LayoutWrapper>
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
                      <Form.Item
                        label='Abbreviation'
                        name='abbreviation'
                        rules={[{ required: true }]}
                      >
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
                        label='Number of Students'
                        name='numberOfStudents'
                        rules={[{ required: true }]}
                      >
                        <InputNumber className='w-full rounded-md' disabled={!isEditable} />
                      </Form.Item>
                      <Form.Item label='Rank' name='rank'>
                        <InputNumber className='w-full rounded-md' disabled={!isEditable} />
                      </Form.Item>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <Form.Item
                        label='Email'
                        name='email'
                        rules={[{ required: true }, { type: 'email' }]}
                      >
                        <Input disabled={!isEditable} className='rounded-md' />
                      </Form.Item>

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
                    </div>

                    <Form.Item label='Website' name='website' rules={[{ required: true }]}>
                      <Input disabled={!isEditable} className='rounded-md' />
                    </Form.Item>

                    <Form.Item label='Description' name='description'>
                      <TextArea
                        rows={4}
                        maxLength={1000}
                        showCount
                        disabled={!isEditable}
                        className='rounded-md'
                      />
                    </Form.Item>
                    <Form.Item
                      label='Subjects'
                      name='subjectsExcelFile'
                      valuePropName='fileList'
                      getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                      rules={[{ required: true }]}
                    >
                      <Dragger {...excelUploadProps} disabled={!isEditable}>
                        <p className='ant-upload-drag-icon'>
                          <InboxOutlined />
                        </p>
                        <p>
                          Drag your Excel file or <span className='text-[#ff7a00]'>browse</span>
                        </p>
                        <p className='text-xs'>Accepted formats: .xlsx, .xls — Max 5 MB</p>
                      </Dragger>
                    </Form.Item>

                    {/* Buttons */}
                    <div className='flex justify-end space-x-4 mt-6'>
                      {!isEditable ? (
                        <Button
                          onClick={() => setIsEditable(true)}
                          className='bg-[#ff7a00] text-white px-5 py-2 border border-[#ff7a00] rounded-[5px] font-medium shadow hover:bg-[#e46b00] transition'
                        >
                          Edit
                        </Button>
                      ) : (
                        <>
                          <Button onClick={() => navigate('/universities')}>Cancel</Button>
                          <Button
                            htmlType='submit'
                            loading={loading}
                            icon={<SaveOutlined />}
                            className='bg-[#ff7a00] text-white'
                          >
                            {loading ? 'Updating...' : 'Save'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div className='flex flex-col items-center order-1 md:order-2'>
                    <Form.Item
                      label='Logo'
                      name='logo'
                      valuePropName='fileList'
                      getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                    >
                      <div className='flex flex-col items-center gap-3 justify-center'>
                        <Upload.Dragger
                          {...uploadProps}
                          showUploadList={false}
                          disabled={!isEditable}
                          className='w-40 h-40 bg-white border border-dashed border-gray-300 rounded-xl shadow-sm flex items-center justify-center hover:shadow-md transition duration-300'
                        >
                          {logoFile || existingLogoUrl ? (
                            <img
                              src={logoFile ? URL.createObjectURL(logoFile) : existingLogoUrl}
                              alt='University Logo'
                              className='w-full h-full object-contain '
                            />
                          ) : (
                            <div className='text-center text-gray-400'>
                              <InboxOutlined className='text-2xl mb-1' />
                              <p className='text-sm'>Upload Logo</p>
                              <p className='text-xs text-gray-300'>JPG, PNG – max 5MB</p>
                            </div>
                          )}
                        </Upload.Dragger>

                        {isEditable && (
                          <Button
                            icon={<Pencil size={16} />}
                            className='bg-[#ff7a00] text-white hover:bg-[#e46b00] px-4 rounded-md shadow'
                          >
                            Modify Logo
                          </Button>
                        )}
                      </div>
                    </Form.Item>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </LayoutWrapper>
      </div>
    </ConfigProvider>
  );
};

export default EditUniversity;
