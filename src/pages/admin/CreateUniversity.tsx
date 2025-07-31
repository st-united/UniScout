import { SaveOutlined, PictureOutlined, InboxOutlined } from '@ant-design/icons';
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
  Avatar,
} from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminHeader from '../../components/AdminHeader';
import LayoutWrapper from '../../components/LayoutWrapper';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { Dragger } = Upload; // Import Dragger

const CreateUniversity = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [subjectsExcelFile, setSubjectsExcelFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);

  useEffect(() => {
    fetchCountries();
  }, []);

  // Button styles with hover effects
  const buttonStyles = {
    back: {
      marginBottom: '12px',
      width: '100%',
      maxWidth: '120px',
      backgroundColor: 'white',
      borderColor: '#d9d9d9',
      color: 'rgba(0, 0, 0, 0.88)',
      transition: 'all 0.3s ease',
    },
    backHover: {
      backgroundColor: '#D3D3D3',
      borderColor: '#D3D3D3',
      color: 'white',
    },
    reset: {
      width: '100%',
      backgroundColor: '#ff8c00',
      borderColor: '#ff8c00',
      color: 'white',
      transition: 'all 0.3s ease',
    },
    resetHover: {
      backgroundColor: '#e67e00',
      borderColor: '#e67e00',
    },
    save: {
      width: '100%',
      backgroundColor: '#ff8c00',
      borderColor: '#ff8c00',
      transition: 'all 0.3s ease',
    },
    saveHover: {
      backgroundColor: '#e67e00',
      borderColor: '#e67e00',
    },
  };

  const fetchCountries = async (searchTerm = '') => {
    try {
      const response = await axios.get('/universities/countries', {
        params: { search: searchTerm },
      });

      const countries = response.data?.data || response.data || [];
      setAvailableCountries(countries);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      setAvailableCountries([]);
    }
  };

  const universityTypes = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'college', label: 'College' },
    { value: 'academy', label: 'Academy' },
    { value: 'international', label: 'International' },
  ];

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
      setLogoPreviewUrl(URL.createObjectURL(file));
      message.success(`${file.name} selected successfully`);
      return false;
    },

    onRemove: () => {
      setLogoFile(null);
      setLogoPreviewUrl(null);
    },
  };

  // Props for Subjects Excel Upload
  const subjectsExcelUploadProps = {
    name: 'subjectsExcel',
    multiple: false,
    accept: '.xlsx,.xls', // Only accept Excel files
    beforeUpload: (file: File) => {
      const isExcel =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel';
      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isExcel) {
        message.error('You can only upload Excel files (.xlsx, .xls)!');
        return false;
      }
      if (!isLt5M) {
        message.error('Excel file must be smaller than 5MB!');
        return false;
      }

      setSubjectsExcelFile(file);
      message.success(`${file.name} selected successfully`);
      return false; // Prevent automatic upload
    },
    onRemove: () => {
      setSubjectsExcelFile(null);
    },
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('university', values.university);
      formData.append('abbreviation', values.abbreviation || '');
      formData.append('latitude', String(values.latitude));
      formData.append('longitude', String(values.longitude));

      // Rank field: Only append if it has a value other than 0 (which maps to null on backend)
      if (values.rank !== null && values.rank !== undefined && values.rank !== 0) {
        formData.append('rank', String(values.rank));
      }

      // Logo field: Only append if a file is selected
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      formData.append('type', values.type);
      formData.append('country', values.country);
      formData.append('location', values.location);
      formData.append('studentPopulation', String(values.studentPopulation));
      formData.append('year', String(2000)); // Hardcoded year to 2000
      formData.append('contact', values.contact);
      formData.append('email', values.email);
      formData.append('website', values.website);
      formData.append('strength', '');
      formData.append('description', values.description || '');
      formData.append('exchange', String(values.exchange ?? false));
      if (subjectsExcelFile) {
        formData.append('subjectsExcel', subjectsExcelFile); // Append the actual Excel file
      }

      const response = await axios.post('/admin/universities', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });

      message.success('University created successfully!');
      form.resetFields();
      setLogoFile(null);
      setLogoPreviewUrl(null);
      setSubjectsExcelFile(null); // Reset Excel file state
      console.log('University created:', response.data);
    } catch (error: any) {
      console.error('Failed to create university:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to create university. Please try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className='create-university-form'
      style={{
        padding: '12px 16px 24px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        fontFamily: '"Segoe UI"',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <AdminHeader />
        <LayoutWrapper>
          {/* Header */}
          <div style={{ marginBottom: '16px' }}>
            <Title
              level={2}
              style={{
                marginBottom: '8px',
                lineHeight: '1.2',
                fontSize: '1rem',
              }}
            >
              Create University Information
            </Title>
          </div>

          {/* Main Content Row - Form Left, Logo Right */}
          <Row gutter={[16, 16]}>
            {/* Form Section - Left Side */}
            <Col xs={24} lg={18}>
              <Card
                style={{
                  marginBottom: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                bodyStyle={{
                  padding: '16px',
                }}
              >
                <Form
                  form={form}
                  layout='vertical'
                  onFinish={onFinish}
                  initialValues={{
                    website: 'https://',
                    exchange: false,
                    studentPopulation: 0,
                    year: 2000,
                  }}
                  scrollToFirstError
                >
                  {/* University Name, Abbreviation */}
                  <Row gutter={[12, 16]}>
                    <Col xs={24} sm={24} md={12} lg={12}>
                      <Form.Item
                        label='University Name'
                        name='university'
                        rules={[{ required: true, message: 'Please enter university name' }]}
                      >
                        <Input placeholder='Enter your university name' size='large' />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12}>
                      <Form.Item
                        label='Abbreviation'
                        name='abbreviation'
                        rules={[{ required: true, message: 'Please enter abbreviation' }]}
                      >
                        <Input placeholder='Enter your abbreviation' size='large' />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Country, Location */}
                  <Row gutter={[12, 16]}>
                    <Col xs={24} sm={12} md={12}>
                      <Form.Item
                        label='Country'
                        name='country'
                        rules={[{ required: true, message: 'Please enter country' }]}
                      >
                        <Select placeholder='Select your country' size='large'>
                          {availableCountries.map((country) => (
                            <Option key={country} value={country}>
                              {country}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                      <Form.Item
                        label='Location'
                        name='location'
                        rules={[{ required: true, message: 'Please enter location' }]}
                      >
                        <Input placeholder='Enter city or province' size='large' />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Latitude, Longitude */}
                  <Row gutter={[12, 16]}>
                    <Col xs={24} sm={12} md={12}>
                      <Form.Item
                        label='Latitude'
                        name='latitude'
                        rules={[
                          {
                            required: true,
                            message: 'Please enter latitude',
                          },
                          {
                            validator: async (_, value) => {
                              if (value === null || value === undefined || value === '') {
                                return Promise.resolve();
                              }
                              // Allow integer or float, including 0
                              if (!/^-?\d+(\.\d+)?$/.test(String(value))) {
                                return Promise.reject('Please enter a valid number for latitude');
                              }
                              const numValue = parseFloat(value);
                              if (numValue < -90 || numValue > 90) {
                                return Promise.reject('Latitude must be between -90 and 90');
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input placeholder=' Enter your latitude e.g. 40.7128' size='large' />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                      <Form.Item
                        label='Longitude'
                        name='longitude'
                        rules={[
                          {
                            required: true,
                            message: 'Please enter longitude',
                          },
                          {
                            validator: async (_, value) => {
                              if (value === null || value === undefined || value === '') {
                                return Promise.resolve();
                              }
                              // Allow integer or float, including 0
                              if (!/^-?\d+(\.\d+)?$/.test(String(value))) {
                                return Promise.reject('Please enter a valid number for longitude');
                              }
                              const numValue = parseFloat(value);
                              if (numValue < -180 || numValue > 180) {
                                return Promise.reject('Longitude must be between -180 and 180');
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input placeholder='Enter your longtitude e.g. -74.0060' size='large' />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Type, Student Population, Rank */}
                  <Row gutter={[12, 16]}>
                    <Col xs={24} sm={24} md={8} lg={8}>
                      <Form.Item
                        label='University Type'
                        name='type'
                        rules={[{ required: true, message: 'Please select university type' }]}
                      >
                        <Select placeholder='Select your university type' size='large'>
                          {universityTypes.map((type) => (
                            <Option key={type.value} value={type.value}>
                              {type.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8}>
                      <Form.Item
                        label='Number of Students'
                        name='studentPopulation'
                        rules={[
                          { required: true, message: 'Student population is required' },
                          {
                            type: 'integer',
                            min: 0, // Changed min to 0
                            message: 'Student population must be a non-negative integer',
                          },
                        ]}
                      >
                        <InputNumber
                          min={0}
                          precision={0}
                          style={{ width: '100%' }}
                          placeholder='Enter your number of students'
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          size='large'
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8}>
                      <Form.Item
                        label='Rank'
                        name='rank'
                        rules={[
                          {
                            type: 'number',
                            min: 0, // Allow 0, which will be transformed to null on the backend
                            message: 'Ranking must be a non-negative number',
                          },
                        ]}
                      >
                        <InputNumber
                          min={0}
                          style={{ width: '100%' }}
                          placeholder='Enter your rank (0 for unranked)'
                          size='large'
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Contact, Email */}
                  <Row gutter={[12, 16]}>
                    {/* Removed Year Founded */}
                    <Col xs={24} sm={12} md={12} lg={12}>
                      <Form.Item
                        label='Email'
                        name='email'
                        rules={[
                          { required: true, message: 'Please enter email' },
                          { type: 'email', message: 'Please enter valid email' },
                          {
                            validator: async (_, value) => {
                              value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                            },
                          },
                        ]}
                      >
                        <Input placeholder='Enter your email' size='large' />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12}>
                      <Form.Item
                        label='Phone'
                        name='contact'
                        rules={[
                          { required: true, message: 'Contact is required' },
                          {
                            validator: async (_, value) => {
                              if (value) {
                                // Regex updated to match backend: ^\d{1,3}\d{6,14}$
                                if (!/^\d{1,3}\d{6,14}$/.test(value)) {
                                  throw new Error(
                                    'Phone number must contain no more than 15 digits and start with 1-3 digits country code',
                                  );
                                }
                              }
                            },
                          },
                        ]}
                      >
                        <Input placeholder='Enter your phone (e.g., 84123456789)' size='large' />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Website */}
                  <Row gutter={[12, 16]}>
                    <Col span={24}>
                      <Form.Item
                        label='Website'
                        name='website'
                        rules={[
                          { required: true, message: 'Please enter website URL' },
                          {
                            pattern: /^https?:\/\/.+/,
                            message: 'Website URL must start with http:// or https://',
                          },
                          {
                            validator: async (_, value: string) => {
                              if (!value) return Promise.resolve(); // Let the 'required' rule handle this

                              // Skip if it already fails the pattern rule (starts with http:// or https://)
                              if (!/^https?:\/\/.+/.test(value)) {
                                return Promise.resolve();
                              }

                              try {
                                const url = new URL(value);
                                const domain = url.hostname;

                                if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
                                  return Promise.reject(
                                    'Website must contain a valid domain like example.com',
                                  );
                                }

                                if (/^[-.]/.test(domain) || /[-.]$/.test(domain)) {
                                  return Promise.reject(
                                    'Website must not start or end with a hyphen or dot',
                                  );
                                }

                                if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
                                  return Promise.reject('Website contains invalid characters');
                                }

                                if (/(\.\.|--)/.test(domain)) {
                                  return Promise.reject(
                                    'Website must not contain consecutive dots or hyphens',
                                  );
                                }

                                return Promise.resolve();
                              } catch {
                                return Promise.reject(
                                  'Invalid URL format. Must start with http:// or https://',
                                );
                              }
                            },
                          },
                        ]}
                      >
                        <Input
                          placeholder='Enter your website e.g. https://example.com'
                          size='large'
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Removed Strength (Optional) */}

                  {/* Description */}
                  <Row gutter={[12, 16]}>
                    <Col xs={24}>
                      <Form.Item label='Description' name='description'>
                        <TextArea
                          rows={4}
                          placeholder='Enter description about the university'
                          showCount
                          style={{ fontSize: '16px' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Subjects Excel Upload */}
                  <Row gutter={[12, 16]}>
                    <Col xs={24}>
                      <Form.Item
                        label='Subjects'
                        name='subjectsExcelUpload' // Use a different name as this isn't directly bound to the payload field
                      >
                        <Dragger {...subjectsExcelUploadProps}>
                          <p className='ant-upload-drag-icon'>
                            <InboxOutlined style={{ color: 'orange' }} />
                          </p>
                          <p className='ant-upload-text' style={{ fontSize: '14px' }}>
                            Drag your Excel file or browse
                          </p>
                          <p className='ant-upload-hint' style={{ fontSize: '14px' }}>
                            Support for a single Excel file upload (.xlsx, .xls). This field is
                            optional.
                          </p>
                          {subjectsExcelFile && (
                            <p style={{ marginTop: 8, fontSize: '12px' }}>
                              Selected file: <strong>{subjectsExcelFile.name}</strong>
                            </p>
                          )}
                        </Dragger>
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Submit Buttons Aligned Right and Smaller */}
                  <Row justify='end' gutter={[8, 16]}>
                    <Col>
                      <Button
                        onClick={() => navigate('/universities')}
                        style={buttonStyles.back}
                        size='large'
                        onMouseEnter={(e) => {
                          Object.assign(e.currentTarget.style, buttonStyles.backHover);
                        }}
                        onMouseLeave={(e) => {
                          Object.assign(e.currentTarget.style, buttonStyles.back);
                        }}
                      >
                        Cancel
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        type='primary'
                        htmlType='submit'
                        loading={loading}
                        icon={<SaveOutlined />}
                        size='large'
                        style={buttonStyles.save}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            Object.assign(e.currentTarget.style, {
                              ...buttonStyles.save,
                              ...buttonStyles.saveHover,
                            });
                          }
                        }}
                        onMouseLeave={(e) => {
                          Object.assign(e.currentTarget.style, buttonStyles.save);
                        }}
                      >
                        {loading ? 'Creating...' : 'Save'}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>

            {/* Logo Section - Right Side */}
            <Col xs={24} lg={6}>
              <Card
                style={{
                  marginBottom: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  height: 'fit-content',
                  position: 'sticky',
                  top: '20px',
                }}
                bodyStyle={{
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <Title
                  level={4}
                  style={{
                    margin: '0 0 16px 0',
                    fontSize: '16px',
                    textAlign: 'left',
                    color: '#555555',
                  }}
                >
                  Logo
                </Title>
                <Form.Item name='logo' style={{ marginBottom: '16px' }}>
                  <Upload {...uploadProps} showUploadList={false}>
                    <Avatar
                      shape='square'
                      size={150}
                      style={{
                        backgroundColor: '#E5E5E5',
                        border: '2px dashed #A9A9A9',
                        color: '#000000',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '12px',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        padding: '4px',
                      }}
                    >
                      {logoPreviewUrl ? (
                        <img
                          src={logoPreviewUrl}
                          alt='Logo Preview'
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 0,
                          }}
                        />
                      ) : (
                        <>
                          <span>
                            <PictureOutlined style={{ fontSize: 32 }} />
                            <br />
                            <br />
                          </span>
                          <span>+ Click to Upload</span>
                        </>
                      )}
                    </Avatar>
                  </Upload>
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </LayoutWrapper>
      </div>
    </div>
  );
};

export default CreateUniversity;
