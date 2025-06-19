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

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
            style={{ marginBottom: '16px' }}
          >
            Back
          </Button>
          <Title level={2}>Create New University</Title>
        </div>

        {/* Create University Form */}
        <Card title='University Information' style={{ marginBottom: '24px' }}>
          <Form
            form={form}
            layout='vertical'
            onFinish={onFinish}
            initialValues={{
              website: 'https://',
              fields: [],
            }}
          >
            <Row gutter={[16, 16]}>
              {/* University Name, Country, Logo */}
              <Col xs={24} md={8}>
                <Form.Item
                  label='University Name'
                  name='universityName'
                  rules={[
                    { required: true, message: 'Please enter university name' },
                    { min: 2, message: 'University name must be at least 2 characters' },
                  ]}
                >
                  <Input placeholder='Enter university name' />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label='Country'
                  name='country'
                  rules={[{ required: true, message: 'Please enter country' }]}
                >
                  <Input placeholder='Enter country' />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label='Logo'
                  name='logo'
                  rules={[{ required: true, message: 'Please upload a logo' }]}
                >
                  <Dragger {...uploadProps} style={{ height: '120px' }}>
                    <p className='ant-upload-drag-icon'>
                      <InboxOutlined />
                    </p>
                    <p className='ant-upload-text'>Click or drag file to upload</p>
                    <p className='ant-upload-hint'>Support for single image upload. Max 5MB.</p>
                  </Dragger>
                </Form.Item>
              </Col>
            </Row>

            {/* Location */}
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item
                  label='Location'
                  name='location'
                  rules={[{ required: true, message: 'Please enter location' }]}
                >
                  <Input placeholder='Enter complete address/location' />
                </Form.Item>
              </Col>
            </Row>

            {/* Latitude, Longitude */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
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
                  <Input placeholder='e.g. 40.7128' />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
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
                  <Input placeholder='e.g. -74.0060' />
                </Form.Item>
              </Col>
            </Row>

            {/* Type, Students, Rank */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Form.Item
                  label='University Type'
                  name='type'
                  rules={[{ required: true, message: 'Please select university type' }]}
                >
                  <Select placeholder='Select university type'>
                    {universityTypes.map((type) => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label='Number of Students' name='numberOfStudents'>
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    placeholder='Enter number of students'
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label='Ranking' name='rank'>
                  <InputNumber min={1} style={{ width: '100%' }} placeholder='Enter ranking' />
                </Form.Item>
              </Col>
            </Row>

            {/* Phone, Email */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label='Phone'
                  name='phone'
                  rules={[
                    { required: true, message: 'Please enter phone number' },
                    {
                      pattern: /^\+?[1-9][\d\-()\s]{7,15}$/,
                      message: 'Please enter valid phone number',
                    },
                  ]}
                >
                  <Input placeholder='Enter phone number' />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label='Email'
                  name='email'
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter valid email' },
                  ]}
                >
                  <Input placeholder='Enter email address' />
                </Form.Item>
              </Col>
            </Row>

            {/* Website */}
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item
                  label='Website'
                  name='website'
                  rules={[
                    { required: true, message: 'Please enter website URL' },
                    { type: 'url', message: 'Please enter valid website URL' },
                  ]}
                >
                  <Input placeholder='https://example.com' />
                </Form.Item>
              </Col>
            </Row>

            {/* Description */}
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item label='Description' name='description'>
                  <TextArea
                    rows={4}
                    placeholder='Enter description about the university'
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Fields */}
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item label='Academic Fields' name='fields'>
                  <Select
                    mode='multiple'
                    placeholder='Select academic fields'
                    style={{ width: '100%' }}
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

            {/* Other */}
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item label='Other Information' name='other'>
                  <TextArea
                    rows={4}
                    placeholder='Enter other relevant information'
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Submit Button */}
            <Row>
              <Col xs={24} style={{ textAlign: 'right' }}>
                <Button
                  onClick={() => {
                    form.resetFields();
                    setLogoFile(null);
                  }}
                  style={{ marginRight: '8px' }}
                >
                  Reset
                </Button>
                <Button
                  type='primary'
                  htmlType='submit'
                  loading={loading}
                  icon={<SaveOutlined />}
                  size='large'
                >
                  {loading ? 'Creating...' : 'Create University'}
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
