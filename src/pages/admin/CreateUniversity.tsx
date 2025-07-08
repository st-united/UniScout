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
  Switch,
} from 'antd';
import axios from 'axios';
import React, { useState } from 'react';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { Dragger } = Upload;

interface UniversityData {
  university: string;
  abbreviation?: string;
  latitude?: number;
  longitude?: number;
  rank?: number;
  logo?: string;
  type: 'public' | 'private';
  country: string;
  location: string;
  studentPopulation?: number;
  year?: number;
  contact?: string;
  email: string;
  website: string;
  strength?: string;
  description?: string;
  exchange?: boolean;
  academicFields: string[];
  subjects?: string[];
}

const CreateUniversity = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showOtherField, setShowOtherField] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [showSubjectsField, setShowSubjectsField] = useState(false);

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

  // Updated academic fields to match API enum
  const academicFieldsOptions = [
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
    {
      value: 'transport_safety_security_military',
      label: 'Transport, Safety, Security & Military',
    },
    { value: 'other', label: 'Other' },
  ];

  // Valid subjects for each academic field
  const academicFieldSubjects: { [key: string]: string[] } = {
    agricultural_veterinary_sciences: [
      'Agriculture',
      'Agricultural Biotechnology',
      'Animal Science',
      'Plant Protection',
      'Livestock Management',
      'Horticultural Science',
      'Veterinary Medicine',
      'Agricultural Engineering',
      'Forestry',
      'Aquaculture',
    ],
    arts_design: [
      'Fine Art',
      'Performing Art',
      'Visual Art',
      'Industrial Design',
      'Graphic Design',
      'Photography',
      'Music',
      'Design',
      'Film and Television',
      'Theatre and Film',
    ],
    business_management_law: [
      'Business Administration',
      'Management',
      'Marketing',
      'Accounting',
      'Finance',
      'Economics',
      'International Business',
      'Commerce',
      'Operations Management',
      'Law',
      'Tax Law',
      'Corporate Law',
      'Criminal Law',
      'Civil Law',
    ],
    education_training: [
      'Teacher Training',
      'Primary Education',
      'Early Childhood Education',
      'Educational Psychology',
      'Educational Science',
      'Educational Leadership',
      'Special Education',
      'Adult Education',
      'Curriculum Development',
      'Elementary Education',
      'Secondary Education',
    ],
    engineering_technology: [
      'Mechanical Engineering',
      'Civil Engineering',
      'Electrical Engineering',
      'Chemical Engineering',
      'Computer Engineering',
      'Environmental Engineering',
      'Aerospace Engineering',
      'Architectural Engineering',
      'Industrial Engineering',
      'Materials Science and Engineering',
      'Mechatronics Engineering',
      'Software Engineering',
      'Telecommunications Engineering',
      'Structural Engineering',
      'Mining Engineering',
      'Precision Engineering',
      'Energy Systems Engineering',
      'Energy Science and Engineering',
      'Supercomputer Education and Research Centre',
    ],
    health_medicine: [
      'Medicine',
      'Dentistry',
      'Pharmacy',
      'Nursing',
      'Public Health',
      'Physiotherapy',
      'Occupational Therapy',
      'Speech Pathology',
      'Medical Imaging',
      'Radiology',
      'Nutrition',
      'Health Science',
      'Biomedical Engineering',
      'Paramedicine',
      'Psychology',
    ],
    humanities_languages: [
      'Liberal Art',
      'History',
      'Philosophy',
      'Literature',
      'Linguistics',
      'Other Languages and Literatures',
      'Urdu',
      'Persian',
      'Hindi',
      'Sanskrit',
      'Art and Archaeology',
      'Religious Studies',
    ],
    ict: [
      'Information Technology',
      'Computer Science',
      'Software Engineering',
      'Cybersecurity',
      'Information and Communication Engineering',
      'Electrical and Computer Systems Engineering',
      'Web Development',
      'Data Science',
      'Mobile App Development',
      'Computer Systems Engineering',
      'Computer Science and Automation',
      'Information Engineering',
      'Network Administration',
      'Artificial Intelligence',
      'Machine Learning',
      'Business Information Systems',
    ],
    natural_sciences: [
      'Physics',
      'Chemistry',
      'Biology',
      'Mathematics',
      'Statistics',
      'Applied Physics',
      'Applied Chemistry',
      'Genetics',
      'Botany',
      'Zoology',
      'Oceanography',
      'Meteorology',
      'Geology',
      'Astronomy',
      'Biochemistry',
      'Environmental Chemistry',
      'Health Science',
      'Microbiology',
    ],
    social_behavioral_sciences: [
      'Anthropology',
      'Sociology',
      'Political Science',
      'International Relations',
      'Criminology',
      'Psychology',
      'Geography',
      'Educational Psychology',
      'Social and Human Science',
      'Urban Planning',
      'Public Administration',
      'Gender Studies',
      'Management Studies',
    ],
    transport_safety_security_military: [
      'Aeronautics and Astronautics',
      'Nuclear and Quantum Engineering',
      'Systems and Control Engineering',
      'Robotics',
    ],
    other: [], // any custom subject user types manually
  };
  //

  const universityTypes = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
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

  // Handle academic fields selection change
  const handleAcademicFieldsChange = (selectedFields: string[]) => {
    const hasOther = selectedFields.includes('other');
    setShowOtherField(hasOther);
    setShowSubjectsField(selectedFields.length > 0);

    // Clear the other field if "Other" is not selected
    if (!hasOther) {
      form.setFieldsValue({ otherField: undefined });
    }

    // Clear subjects
    form.setFieldsValue({ subjects: [] });

    // Compute available subjects based on all selected academic fields
    const allSubjects = selectedFields.flatMap((field) => academicFieldSubjects[field] || []);
    const uniqueSubjects = Array.from(new Set(allSubjects));
    setAvailableSubjects(uniqueSubjects);
  };

  // Validate subjects belong to selected academic fields
  const validateSubjects = (subjects: string[]) => {
    const selectedFields = form.getFieldValue('academicFields') || [];

    if (selectedFields.includes('other')) {
      return true; // Any subject is valid when 'other' is selected
    }

    const invalidSubjects = subjects.filter((subject) => !availableSubjects.includes(subject));
    return invalidSubjects.length === 0;
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
          university: ['Harvard University', 'MIT', 'Stanford University'],
          contact: ['+1-617-495-1000', '+1-650-723-2300'],
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

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Append form fields
      formData.append('university', values.university);
      if (values.abbreviation) formData.append('abbreviation', values.abbreviation);
      if (values.latitude) formData.append('latitude', values.latitude);
      if (values.longitude) formData.append('longitude', values.longitude);
      if (values.rank) formData.append('rank', values.rank);
      formData.append('type', values.type);
      formData.append('country', values.country);
      formData.append('location', values.location);
      if (values.studentPopulation) formData.append('studentPopulation', values.studentPopulation);
      if (values.year) formData.append('year', values.year);
      if (values.contact) formData.append('contact', values.contact);
      formData.append('email', values.email);
      formData.append('website', values.website);
      if (values.strength) formData.append('strength', values.strength);
      if (values.description) formData.append('description', values.description);
      formData.append('exchange', values.exchange ? 'true' : 'false');

      // Append logo file
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      // Append academic fields and subjects
      values.academicFields.forEach((field: string) => {
        formData.append('academicFields[]', field);
      });

      if (values.subjects && values.subjects.length > 0) {
        values.subjects.forEach((subject: string) => {
          formData.append('subjects[]', subject);
        });
      }

      // Submit with multipart/form-data
      const response = await axios.post('/admin/universities', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success('University created successfully!');
      form.resetFields();
      setLogoFile(null);
      setShowOtherField(false);
      console.log('University created:', response.data);
    } catch (error: any) {
      console.error('Error creating university:', error);

      if (error.response) {
        const errorMessage = error.response.data?.message || 'Failed to create university';
        message.error(errorMessage);

        if (error.response.data?.errors) {
          const fieldErrors = error.response.data.errors;
          Object.keys(fieldErrors).forEach((fieldName) => {
            form.setFields([
              {
                name: fieldName,
                errors: Array.isArray(fieldErrors[fieldName])
                  ? fieldErrors[fieldName]
                  : [fieldErrors[fieldName]],
              },
            ]);
          });
        }
      } else if (error.request) {
        message.error('Network error. Please check your connection.');
      } else {
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
              academicFields: [],
              exchange: false,
            }}
            scrollToFirstError
          >
            {/* University Name, Abbreviation, Logo */}
            <Row gutter={[12, 16]}>
              <Col xs={24} sm={24} md={8} lg={8}>
                <Form.Item
                  label='University Name'
                  name='university'
                  rules={[
                    { required: true, message: 'Please enter university name' },
                    { min: 2, message: 'University name must be at least 2 characters' },
                    {
                      validator: async (_, value) => {
                        if (value && value.length >= 2) {
                          try {
                            await validateUniqueness('university', value);
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
                  label='Abbreviation'
                  name='abbreviation'
                  rules={[{ required: true, message: 'Please enter abbreviation' }]}
                >
                  <Input placeholder='Enter abbreviation (e.g., MIT)' size='large' />
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

            {/* Country, Location */}
            <Row gutter={[12, 16]}>
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label='Country'
                  name='country'
                  rules={[{ required: true, message: 'Please enter country' }]}
                >
                  <Input placeholder='Enter country' size='large' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12}>
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
                      required: true,
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
                      required: true,
                    },
                  ]}
                >
                  <Input placeholder='e.g. -74.0060' size='large' />
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
                  label='Student Population'
                  name='studentPopulation'
                  rules={[
                    { required: true, message: 'Student population is required' },
                    {
                      type: 'integer',
                      min: 1,
                      message: 'Student population must be a positive integer',
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    precision={0}
                    style={{ width: '100%' }}
                    placeholder='Enter student population'
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

            {/* Year, Contact */}
            <Row gutter={[12, 16]}>
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label='Year Established'
                  name='year'
                  rules={[
                    { required: true, message: 'Year is required' },
                    {
                      type: 'integer',
                      min: 1000,
                      max: new Date().getFullYear(),
                      message: 'Year must be a valid integer and cannot be in the future',
                    },
                  ]}
                >
                  <InputNumber
                    min={1000}
                    max={new Date().getFullYear()}
                    precision={0}
                    style={{ width: '100%' }}
                    placeholder='Enter year established'
                    size='large'
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label='Contact Phone'
                  name='contact'
                  rules={[
                    { required: true, message: 'Contact is required' },
                    {
                      pattern: /^[1-9]\d{0,2}\d{6,14}$/,
                      message:
                        'Invalid contact format. Must start with a country code (1-3 digits), followed by contact number (e.g., 84123456789)',
                    },
                    {
                      validator: async (_, value) => {
                        if (value && /^[1-9]\d{0,2}\d{6,14}$/.test(value)) {
                          // Ensure it's treated as string
                          if (typeof value !== 'string') {
                            throw new Error('Contact must be a string');
                          }
                          try {
                            await validateUniqueness('contact', value);
                          } catch (error: any) {
                            throw new Error(error.message);
                          }
                        }
                      },
                    },
                  ]}
                  hasFeedback
                >
                  <Input placeholder='Enter phone number (e.g., 84123456789)' size='large' />
                </Form.Item>
              </Col>
            </Row>

            {/* Email, Website */}
            <Row gutter={[12, 16]}>
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
              <Col xs={24} sm={12} md={12}>
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

            {/* Strength, Exchange */}
            <Row gutter={[12, 16]}>
              <Col xs={24} sm={20} md={20}>
                <Form.Item label='University Strength' name='strength'>
                  <Input placeholder='Enter university strength/specialty' size='large' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={4} md={4}>
                <Form.Item
                  label='Exchange Program'
                  name='exchange'
                  valuePropName='checked'
                  labelCol={{ span: 24 }}
                  style={{ textAlign: 'center' }}
                >
                  <Switch
                    checkedChildren='Yes'
                    unCheckedChildren='No'
                    style={{ marginTop: 4, marginLeft: -20 }}
                  />
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

            {/* Academic Fields */}
            <Row gutter={[12, 16]}>
              <Col xs={24}>
                <Form.Item
                  label='Academic Fields'
                  name='academicFields'
                  rules={[{ required: true, message: 'Please select at least one academic field' }]}
                >
                  <Select
                    mode='multiple'
                    placeholder='Select academic fields'
                    style={{ width: '100%' }}
                    size='large'
                    maxTagCount='responsive'
                    onChange={handleAcademicFieldsChange}
                  >
                    {academicFieldsOptions.map((field) => (
                      <Option key={field.value} value={field.value}>
                        {field.label}
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
                    label='Other Academic Field'
                    name='otherField'
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

            {/* Subjects */}
            <Row gutter={[12, 16]}>
              <Col xs={24}>
                <Form.Item
                  label='Subjects'
                  name='subjects'
                  rules={[
                    {
                      validator: (_, value) => {
                        if (!value || value.length === 0) {
                          return Promise.resolve();
                        }

                        const selectedFields = form.getFieldValue('academicFields') || [];
                        if (selectedFields.length === 0) {
                          return Promise.reject(new Error('Please select academic fields first'));
                        }

                        if (!validateSubjects(value)) {
                          return Promise.reject(
                            new Error(
                              'One or more subjects are invalid or do not belong to the selected academic fields',
                            ),
                          );
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                  dependencies={['academicFields']}
                >
                  <Select
                    mode='multiple'
                    placeholder='Select subjects based on your academic fields'
                    style={{ width: '100%' }}
                    size='large'
                    maxTagCount='responsive'
                    options={availableSubjects.map((subject) => ({
                      label: subject,
                      value: subject,
                    }))}
                    disabled={!form.getFieldValue('academicFields')?.length}
                    notFoundContent={
                      !form.getFieldValue('academicFields')?.length
                        ? 'Please select academic fields first'
                        : 'No subjects available'
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

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
