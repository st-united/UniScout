import { InboxOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import {
  Form,
  Input,
  Select,
  Button,
  message,
  Typography,
  Spin,
  InputNumber,
  Upload,
  Card,
  Row,
  Col,
  ConfigProvider,
  Grid,
} from 'antd';
import axios from 'axios';
import { Pencil, GraduationCap } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import excelLogo from '../../assets/images/excel-logo.png';
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
  logo?: File;
  logoUrl?: string;
  abbreviation?: string;
  subjectsList?: string;
}

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
  logoUrl: data.logoUrl || data.logo || '',
  subjectsList: data.subjectsList || '',
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
  const fileInputRef = useRef<any>(null);

  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const initialFormDataRef = useRef<UniversityData | null>(null);

  // Breakpoints + expanded state
  const screens = Grid.useBreakpoint();
  const [showAllSubjects, setShowAllSubjects] = useState(false);

  // Watch subjectsList (CSV string)
  const subjectsListString = Form.useWatch('subjectsList', form);

  // Normalize subjects list (robust to commas/semicolons/newlines)
  const subjects: string[] = React.useMemo(() => {
    const raw = subjectsListString ?? form.getFieldValue('subjectsList') ?? '';
    return String(raw)
      .split(/[,;\n]+/)
      .map((s: string) => s.trim())
      .filter(Boolean);
  }, [subjectsListString, form]);

  // Responsive grid math
  const itemsPerRow = screens.lg ? 4 : screens.md ? 3 : screens.sm ? 2 : 1;
  const MAX_ROWS = 3;
  const visibleCount = itemsPerRow * MAX_ROWS;
  const shouldShowToggle = subjects.length > visibleCount;
  const displayedSubjects = showAllSubjects ? subjects : subjects.slice(0, visibleCount);
  const hiddenCount = Math.max(subjects.length - visibleCount, 0);

  // Load initial university data
  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        const { data } = await axios.get(`/admin/universities/${id}`);

        const formData = mapApiToFormData(data);
        form.setFieldsValue(formData);
        initialFormDataRef.current = formData;
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

      return true;
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
      setShowAllSubjects(false);
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
      <div className='p-6 min-h-screen'>
        <AdminHeader />
        <LayoutWrapper>
          {/* centered container */}
          <div className='mx-auto w-full max-w-5xl px-8 md:px-8'>
            <Form
              key={id}
              form={form}
              layout='vertical'
              onFinish={onFinish}
              initialValues={{ website: 'https://', fields: [] }}
            >
              {/* Register subjectsList so useWatch receives the initial setFieldsValue */}
              <Form.Item name='subjectsList' hidden>
                <Input />
              </Form.Item>

              {/* Desktop: grid with two columns and explicit rows so the logo starts on the same row as the first input.
                 Mobile: stacked with Title (1) -> Logo (2) -> Fields (3). */}
              <div className='flex flex-col md:grid md:[grid-template-columns:minmax(0,1fr)_auto] md:auto-rows-min gap-y-6 md:gap-x-6'>
                {/* Title (row 1, left column) */}
                <div className='order-1 md:order-none md:col-start-1 md:row-start-1'>
                  <Title level={3}>
                    {isEditable ? 'Edit University' : 'University Information'}
                  </Title>
                  <span className='block h-[1px] bg-[#eee] my-4'></span>
                </div>

                {/* Fields (row 2, left column) */}
                <div className='order-3 md:order-none md:col-start-1 md:row-start-2'>
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
                    <TextArea rows={4} showCount disabled={!isEditable} className='rounded-md' />
                  </Form.Item>

                  {/* Download Template Button - Only show when in edit mode */}
                  {isEditable && (
                    <div style={{ marginBottom: '16px' }}>
                      <Typography.Text
                        style={{
                          fontSize: '14px',
                          color: '#333',
                          display: 'block',
                          marginBottom: '12px',
                        }}
                      >
                        Please download this Excel file to fill in the subjects, then upload the
                        completed file. This sample file is intended for first-time entries only. If
                        you have an existing file, please upload the updated version instead!
                      </Typography.Text>
                      <div
                        role='button'
                        tabIndex={0}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 16px',
                          border: '1px solid #e8e8e8',
                          borderRadius: '8px',
                          backgroundColor: '#fafafa',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        }}
                        onClick={async () => {
                          try {
                            const response = await axios.get(
                              '/contact/template/Subjects_Template.xlsx',
                              {
                                responseType: 'blob',
                              },
                            );
                            const blob = new Blob([response.data]);
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'Subjects_Template.xlsx';
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                            message.success('Template downloaded successfully');
                          } catch (error) {
                            message.error('Failed to download template. Please try again later.');
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            // Trigger the same download function
                            (async () => {
                              try {
                                const response = await axios.get(
                                  '/contact/template/Subjects_Template.xlsx',
                                  {
                                    responseType: 'blob',
                                  },
                                );
                                const blob = new Blob([response.data]);
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'Subjects_Template.xlsx';
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                window.URL.revokeObjectURL(url);
                                message.success('Template downloaded successfully');
                              } catch (error) {
                                message.error(
                                  'Failed to download template. Please try again later.',
                                );
                              }
                            })();
                          }
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f0f0';
                          e.currentTarget.style.borderColor = '#ff7a00';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#fafafa';
                          e.currentTarget.style.borderColor = '#e8e8e8';
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px',
                          }}
                        >
                          <img
                            src={excelLogo}
                            alt='Excel'
                            style={{
                              width: '32px',
                              height: '32px',
                              objectFit: 'contain',
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Typography.Text strong style={{ fontSize: '14px', color: '#333' }}>
                            Subjects_Template.xlsx
                          </Typography.Text>
                        </div>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg
                            width='20'
                            height='20'
                            viewBox='0 0 24 24'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              d='M12 16L12 8M12 8L8 12M12 8L16 12'
                              stroke='#ff7a00'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                            <path
                              d='M3 15V16C3 18.8284 3 20.2426 3.87868 21.1213C4.75736 22 6.17157 22 9 22H15C17.8284 22 19.2426 22 20.1213 21.1213C21 20.2426 21 18.8284 21 16V15'
                              stroke='#ff7a00'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  <Form.Item
                    label='Subjects'
                    name='subjectsExcelFile'
                    valuePropName='fileList'
                    getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                  >
                    {!isEditable ? (
                      <div>
                        {subjects.length ? (
                          <>
                            <Row gutter={[16, 16]}>
                              {displayedSubjects.map((subject, index) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={`${subject}-${index}`}>
                                  <Card
                                    size='small'
                                    style={{
                                      border: '1px solid #e8e8e8',
                                      borderRadius: '4px',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                      backgroundColor: '#fafafa',
                                      height: 50,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                    bodyStyle={{
                                      padding: 2,
                                      height: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <div style={{ textAlign: 'center' }}>
                                      <Typography.Text style={{ fontSize: 14, color: '#B8B8B8' }}>
                                        {subject}
                                      </Typography.Text>
                                    </div>
                                  </Card>
                                </Col>
                              ))}
                            </Row>

                            {shouldShowToggle && (
                              <div className='flex justify-center mt-3'>
                                <Button
                                  type='link'
                                  onClick={() => setShowAllSubjects((v) => !v)}
                                  aria-expanded={showAllSubjects}
                                >
                                  {showAllSubjects
                                    ? 'View less'
                                    : `View more${hiddenCount ? ` (${hiddenCount})` : ''}`}
                                </Button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div
                            style={{
                              border: '1px solid #e8e8e8',
                              borderRadius: 8,
                              padding: '32px 16px',
                              textAlign: 'center',
                              backgroundColor: '#fafafa',
                            }}
                          >
                            <Typography.Text type='secondary'>
                              No subjects available
                            </Typography.Text>
                          </div>
                        )}
                      </div>
                    ) : (
                      // keep your Dragger as-is
                      <Dragger {...excelUploadProps} disabled={!isEditable}>
                        <p className='ant-upload-drag-icon'>
                          <InboxOutlined />
                        </p>
                        <p>
                          Drag your Excel file or <span className='text-[#ff7a00]'>browse</span>
                        </p>
                        <p className='text-xs'>Accepted formats: .xlsx, .xls — Max 5 MB</p>
                      </Dragger>
                    )}
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
                        <Button
                          onClick={() => {
                            form.setFieldsValue(initialFormDataRef.current || {});
                            setIsEditable(false);
                            setLogoFile(null);
                            setShowAllSubjects(false);
                          }}
                        >
                          Cancel
                        </Button>

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

                {/* Logo (row 2, right column on desktop; directly under title on mobile) */}
                <div className='order-2 md:order-none md:col-start-2 md:row-start-2 md:pl-6'>
                  <Form.Item
                    label='Logo'
                    name='logo'
                    valuePropName='fileList'
                    getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                  >
                    <div className='flex flex-col items-center gap-3 justify-center w-44'>
                      <Upload
                        {...uploadProps}
                        showUploadList={false}
                        disabled={!isEditable}
                        className='w-40 h-40 bg-white border border-dashed border-gray-300 rounded-xl shadow-sm flex items-center justify-center hover:shadow-md transition duration-300'
                        ref={fileInputRef}
                      >
                        <span
                          role='button'
                          tabIndex={0}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                            }
                          }}
                        >
                          {logoFile || existingLogoUrl ? (
                            <img
                              src={logoFile ? URL.createObjectURL(logoFile) : existingLogoUrl}
                              alt='University Logo'
                              className='w-full h-full object-contain'
                            />
                          ) : (
                            <div className='text-center text-gray-400'>
                              <InboxOutlined className='text-2xl mb-1' />
                              <p className='text-sm'>Upload Logo</p>
                              <p className='text-xs text-gray-300'>JPG, PNG – max 5MB</p>
                            </div>
                          )}
                        </span>
                      </Upload>

                      {isEditable && (
                        <Button
                          icon={<Pencil size={16} />}
                          className='bg-[#ff7a00] text-white hover:bg-[#e46b00] px-4 rounded-md shadow'
                          onClick={() => {
                            const input = document.querySelector(
                              'input[type="file"]',
                            ) as HTMLElement;
                            input?.click();
                          }}
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
        </LayoutWrapper>
      </div>
    </ConfigProvider>
  );
};

export default EditUniversity;
