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
} from 'antd';
import axios from 'axios';
import React, { useState } from 'react';

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
}

const CreateUniversity = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showOtherField, setShowOtherField] = useState(false);

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
      backgroundColor: '#ff8c00',
      borderColor: '#ff8c00',
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

  // Handle fields selection change
  const handleFieldsChange = (selectedFields: string[]) => {
    const hasOther = selectedFields.includes('Other');
    setShowOtherField(hasOther);

    // Clear the other field if "Other" is not selected
    if (!hasOther) {
      form.setFieldsValue({ other: undefined });
    }
  };

  // Custom validation for unique values (this would typically be done on the server)
  const validateUniqueness = (fieldName: string, value: string) => {
    // This is a placeholder for uniqueness validation
    // In a real application, you would make an API call to check uniqueness
    return new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        // Mock validation - in real app, this would be an actual API call
        const mockExistingValues = {
          universityName: ['Harvard University', 'MIT', 'Stanford University'],
          phone: ['+1-617-495-1000', '+1-650-723-2300'],
          email: ['info@harvard.edu', 'info@mit.edu'],
          website: ['https://harvard.edu', 'https://mit.edu'],
        };

        if (mockExistingValues[fieldName as keyof typeof mockExistingValues]?.includes(value)) {
          reject(
            new Error(
              `This ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()} is already taken`,
            ),
          );
        } else {
          resolve(true);
        }
      }, 500);
    });
  };

  const onFinish = async (values: UniversityData) => {
    setLoading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Append all form fields to FormData
      Object.keys(values).forEach((key) => {
        if (key === 'fields') {
          // Handle array fields
          values.fields.forEach((field) => {
            formData.append('fields[]', field);
          });
        } else if (
          values[key as keyof UniversityData] !== undefined &&
          values[key as keyof UniversityData] !== null
        ) {
          formData.append(key, values[key as keyof UniversityData] as string);
        }
      });

      // Append logo file if exists
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      // Make API call to your backend
      const response = await axios.post('/api/universities', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success('University created successfully!');
      form.resetFields();
      setLogoFile(null);
      setShowOtherField(false);

      // Optional: Handle success response
      console.log('University created:', response.data);
    } catch (error: any) {
      console.error('Error creating university:', error);

      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Failed to create university';
        message.error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        message.error('Network error. Please check your connection.');
      } else {
        // Something else happened
        message.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setLogoFile(null);
    setShowOtherField(false);
  };

  return (
    <div
      style={{
        padding: '12px 16px 24px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
            style={buttonStyles.back}
            size='middle'
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, buttonStyles.backHover);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, buttonStyles.back);
            }}
          >
            Back
          </Button>
          <Title
            level={2}
            style={{
              marginBottom: '8px',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              lineHeight: '1.2',
            }}
          >
            Create University Information
          </Title>
        </div>

        {/* Create University Form */}
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
              fields: [],
            }}
            scrollToFirstError
          >
            {/* University Name, Country, Logo */}
            <Row gutter={[12, 16]}>
              <Col xs={24} sm={24} md={8} lg={8}>
                <Form.Item
                  label='University Name'
                  name='universityName'
                  rules={[
                    { required: true, message: 'Please enter university name' },
                    { min: 2, message: 'University name must be at least 2 characters' },
                    {
                      validator: async (_, value) => {
                        if (value && value.length >= 2) {
                          try {
                            await validateUniqueness('universityName', value);
                          } catch (error: any) {
                            throw new Error(error.message);
                          }
                        }
                      },
                    },
                  ]}
                  hasFeedback
                >
                  <Input placeholder='Enter university name' size='large' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8}>
                <Form.Item
                  label='Country'
                  name='country'
                  rules={[{ required: true, message: 'Please enter country' }]}
                >
                  <Input placeholder='Enter country' size='large' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8}>
                <Form.Item
                  label='Logo'
                  name='logo'
                  rules={[{ required: true, message: 'Please upload a logo' }]}
                >
                  <Dragger
                    {...uploadProps}
                    style={{
                      height: '100px',
                      borderColor: '#ff8c00',
                      backgroundColor: '#fff7e6',
                    }}
                  >
                    <p className='ant-upload-drag-icon'>
                      <InboxOutlined style={{ color: '#ff8c00', fontSize: '32px' }} />
                    </p>
                    <p className='ant-upload-text' style={{ fontSize: '14px', color: '#ff8c00' }}>
                      Click or drag file to upload
                    </p>
                    <p className='ant-upload-hint' style={{ fontSize: '12px', color: '#ff8c00' }}>
                      Support for single image upload. Max 5MB.
                    </p>
                  </Dragger>
                </Form.Item>
              </Col>
            </Row>

            {/* Location */}
            <Row gutter={[12, 16]}>
              <Col xs={24}>
                <Form.Item
                  label='Location'
                  name='location'
                  rules={[{ required: true, message: 'Please enter location' }]}
                >
                  <Input placeholder='Enter complete address/location' size='large' />
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
                      pattern: /^-?([1-8]?[0-9]\.{1}\d{1,6}$|90\.{1}0{1,6}$)/,
                      message: 'Please enter valid latitude',
                    },
                  ]}
                >
                  <Input placeholder='e.g. 40.7128' size='large' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label='Longitude'
                  name='longitude'
                  rules={[
                    {
                      pattern: /^-?([1]?[0-7][0-9]\.{1}\d{1,6}$|180\.{1}0{1,6}$)/,
                      message: 'Please enter valid longitude',
                    },
                  ]}
                >
                  <Input placeholder='e.g. -74.0060' size='large' />
                </Form.Item>
              </Col>
            </Row>

            {/* Type, Students, Rank */}
            <Row gutter={[12, 16]}>
              <Col xs={24} sm={24} md={8} lg={8}>
                <Form.Item
                  label='University Type'
                  name='type'
                  rules={[{ required: true, message: 'Please select university type' }]}
                >
                  <Select placeholder='Select university type' size='large'>
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
                  name='numberOfStudents'
                  rules={[
                    {
                      type: 'number',
                      min: 1,
                      message: 'Number of students must be a positive number',
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    style={{ width: '100%' }}
                    placeholder='Enter number of students'
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    size='large'
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={8}>
                <Form.Item
                  label='Ranking'
                  name='rank'
                  rules={[
                    {
                      type: 'number',
                      min: 1,
                      message: 'Ranking must be a positive number',
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    style={{ width: '100%' }}
                    placeholder='Enter ranking'
                    size='large'
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Phone, Email */}
            <Row gutter={[12, 16]}>
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label='Phone'
                  name='phone'
                  rules={[
                    { required: true, message: 'Please enter phone number' },
                    {
                      pattern: /^\+?[1-9][\d\-()\s]{7,15}$/,
                      message: 'Please enter valid phone number',
                    },
                    {
                      validator: async (_, value) => {
                        if (value && /^\+?[1-9][\d\-()\s]{7,15}$/.test(value)) {
                          try {
                            await validateUniqueness('phone', value);
                          } catch (error: any) {
                            throw new Error(error.message);
                          }
                        }
                      },
                    },
                  ]}
                  hasFeedback
                >
                  <Input placeholder='Enter phone number' size='large' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label='Email'
                  name='email'
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter valid email' },
                    {
                      validator: async (_, value) => {
                        if (value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                          try {
                            await validateUniqueness('email', value);
                          } catch (error: any) {
                            throw new Error(error.message);
                          }
                        }
                      },
                    },
                  ]}
                  hasFeedback
                >
                  <Input placeholder='Enter email address' size='large' />
                </Form.Item>
              </Col>
            </Row>

            {/* Website */}
            <Row gutter={[12, 16]}>
              <Col xs={24}>
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
                      validator: async (_, value) => {
                        if (value && /^https?:\/\/.+/.test(value)) {
                          try {
                            await validateUniqueness('website', value);
                          } catch (error: any) {
                            throw new Error(error.message);
                          }
                        }
                      },
                    },
                  ]}
                  hasFeedback
                >
                  <Input placeholder='https://example.com' size='large' />
                </Form.Item>
              </Col>
            </Row>

            {/* Description */}
            <Row gutter={[12, 16]}>
              <Col xs={24}>
                <Form.Item label='Description' name='description'>
                  <TextArea
                    rows={4}
                    placeholder='Enter description about the university'
                    showCount
                    maxLength={1000}
                    style={{ fontSize: '16px' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Fields */}
            <Row gutter={[12, 16]}>
              <Col xs={24}>
                <Form.Item
                  label='Field of Study'
                  name='fields'
                  rules={[{ required: true, message: 'Please select at least one field of study' }]}
                >
                  <Select
                    mode='multiple'
                    placeholder='Select academic fields'
                    style={{ width: '100%' }}
                    size='large'
                    maxTagCount='responsive'
                    onChange={handleFieldsChange}
                  >
                    {fieldsOptions.map((field) => (
                      <Option key={field} value={field}>
                        {field}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Other - Conditional Field */}
            {showOtherField && (
              <Row gutter={[12, 16]}>
                <Col xs={24}>
                  <Form.Item
                    label='Other Field of Study'
                    name='other'
                    rules={[
                      {
                        required: showOtherField,
                        message: 'Please specify the other academic field',
                      },
                      { min: 2, message: 'Academic field must be at least 2 characters' },
                    ]}
                  >
                    <Input
                      placeholder='Enter specific academic field'
                      size='large'
                      style={{ fontSize: '16px' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}

            {/* Submit Button */}
            <Row gutter={[8, 16]}>
              <Col xs={24} sm={12} md={12} lg={12}>
                <Button
                  onClick={handleReset}
                  style={buttonStyles.reset}
                  size='large'
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, {
                      ...buttonStyles.reset,
                      ...buttonStyles.resetHover,
                    });
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, buttonStyles.reset);
                  }}
                >
                  Reset
                </Button>
              </Col>
              <Col xs={24} sm={12} md={12} lg={12}>
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
      </div>
    </div>
  );
};

export default CreateUniversity;
