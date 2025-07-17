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
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminHeader from '../../components/AdminHeader';
import LayoutWrapper from '../../components/LayoutWrapper';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { Dragger } = Upload;

const CreateUniversity = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showSubjectsField, setShowSubjectsField] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [fieldSubjectsMap, setFieldSubjectsMap] = useState<Record<string, string[]>>({});
  const [loadingSubjects, setLoadingSubjects] = useState<Record<string, boolean>>({});

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

  // Updated academic fields to match API enum
  const fieldNamesOptions = [
    { value: 'agricultural', label: 'Agricultural & Veterinary Sciences' },
    { value: 'art', label: 'Arts & Design' },
    { value: 'business', label: 'Business, Management & Law' },
    { value: 'education', label: 'Education & Training' },
    { value: 'engineering', label: 'Engineering & Technology' },
    { value: 'health', label: 'Health & Medicine' },
    { value: 'humanities', label: 'Humanities & Languages' },
    { value: 'information tech', label: 'Information & Communication Technology (ICT)' },
    { value: 'natural', label: 'Natural Sciences' },
    { value: 'social', label: 'Social & Behavioral Sciences' },
    { value: 'services', label: 'Services' },
    {
      value: 'transport',
      label: 'Transport, Safety, Security & Military',
    },
    { value: 'other', label: 'Other' },
  ];

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
      form.setFieldsValue({ logo: file.name });
      setLogoPreviewUrl(URL.createObjectURL(file));
      message.success(`${file.name} selected successfully`);
      return false;
    },

    onRemove: () => {
      setLogoFile(null);
      setLogoPreviewUrl(null);
      form.setFieldsValue({ logo: undefined });
    },
  };

  // Handle academic fields selection change - FIXED VERSION
  const handleAcademicFieldsChange = async (selectedFields: string[]) => {
    setShowSubjectsField(selectedFields.length > 0);

    if (selectedFields.length === 0) {
      setFieldSubjectsMap({});
      setLoadingSubjects({});
      return;
    }

    const updatedMap: Record<string, string[]> = { ...fieldSubjectsMap };
    const updatedLoadingState: Record<string, boolean> = { ...loadingSubjects };

    // Set loading state for new fields
    selectedFields.forEach((field) => {
      if (!updatedMap[field]) {
        updatedLoadingState[field] = true;
      }
    });
    setLoadingSubjects(updatedLoadingState);

    // Fetch subjects for each field
    await Promise.all(
      selectedFields.map(async (field) => {
        // Skip if we already have subjects for this field
        if (updatedMap[field] && updatedMap[field].length > 0) {
          return;
        }

        try {
          console.log(`Fetching subjects for field: ${field}`);

          const response = await axios.get('/universities/subjects', {
            params: {
              search: field, // ✅ correct
            },
          });

          console.log(`Response for ${field}:`, response.data);

          // Handle different response formats
          let subjects: string[] = [];
          if (response.data?.data) {
            subjects = Array.isArray(response.data.data)
              ? response.data.data.map((s: any) => s.name || s.title || s.subject || s)
              : [];
          } else if (Array.isArray(response.data)) {
            subjects = response.data.map((s: any) => s.name || s.title || s.subject || s);
          } else {
            subjects = [];
          }

          updatedMap[field] = subjects;
          console.log(`Subjects for ${field}:`, subjects);
        } catch (err) {
          console.error(`Failed to fetch subjects for ${field}:`, err);
          updatedMap[field] = [];

          // Show error message to user
          message.error(`Failed to load subjects for ${field}`);
        } finally {
          updatedLoadingState[field] = false;
        }
      }),
    );

    setFieldSubjectsMap(updatedMap);
    setLoadingSubjects(updatedLoadingState);

    // Reset subject selections for fields that are no longer selected
    const currentFields = form.getFieldValue('academicFields') || [];
    Object.keys(fieldSubjectsMap).forEach((field) => {
      if (!selectedFields.includes(field)) {
        form.setFieldValue(`subjects_${field}`, []);
      }
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

      // Flatten subjects from each broad field
      const subjects: string[] = [];
      for (const field of values.academicFields) {
        const fieldSubjects = values[`subjects_${field}`];
        if (Array.isArray(fieldSubjects)) {
          subjects.push(...fieldSubjects);
        }
      }

      subjects.forEach((subject) => {
        formData.append('subjects[]', subject);
      });

      // Submit with multipart/form-data
      const response = await axios.post('/admin/universities', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success('University created successfully!');
      form.resetFields();
      setLogoFile(null);
      setFieldSubjectsMap({});
      setLoadingSubjects({});
      console.log('University created:', response.data);
    } catch (error: any) {
      console.error('Error creating university:', error);

      if (error.response) {
        const errorMessage = error.response.data?.message || 'Failed to create university';
        console.error('Backend error details:', error.response.data);
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
    setFieldSubjectsMap({});
    setLoadingSubjects({});
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
        <AdminHeader />
        <LayoutWrapper>
          {/* Header */}
          <div style={{ marginBottom: '16px' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/universities')}
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
                    rules={[{ required: true, message: 'Please enter university name' }]}
                  >
                    <Input placeholder='Enter your university name' size='large' />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={8} lg={8}>
                  <Form.Item
                    label='Abbreviation'
                    name='abbreviation'
                    rules={[{ required: true, message: 'Please enter abbreviation' }]}
                  >
                    <Input placeholder='Enter your abbreviation' size='large' />
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
                      fileList={logoFile ? [logoFile as any] : []}
                      style={{
                        height: '150px',
                        borderColor: '#ff8c00',
                        backgroundColor: '#fff7e6',
                        textAlign: 'center',
                      }}
                      itemRender={() => null}
                    >
                      {logoPreviewUrl ? (
                        <img
                          src={logoPreviewUrl}
                          alt='Logo Preview'
                          style={{
                            width: '120px',
                            height: '120px',
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto',
                          }}
                        />
                      ) : (
                        <>
                          <p className='ant-upload-drag-icon'>
                            <InboxOutlined style={{ color: '#ff8c00', fontSize: '32px' }} />
                          </p>
                          <p
                            className='ant-upload-text'
                            style={{ fontSize: '14px', color: '#ff8c00' }}
                          >
                            Click or drag file to upload
                          </p>
                          <p
                            className='ant-upload-hint'
                            style={{ fontSize: '12px', color: '#ff8c00' }}
                          >
                            Support for single image upload. Max 5MB.
                          </p>
                        </>
                      )}
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
                        pattern: /^-?([1-8]?[0-9]\.{1}\d{1,6}$|90\.{1}0{1,6}$)/,
                        message: 'Please enter valid latitude',
                        required: true,
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
                        pattern: /^-?([1]?[0-7][0-9]\.{1}\d{1,6}$|180\.{1}0{1,6}$)/,
                        message: 'Please enter valid longitude',
                        required: true,
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
                        min: 1,
                        message: 'Student population must be a positive integer',
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
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
                        min: 1,
                        message: 'Ranking must be a positive number',
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder='Enter your rank'
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
                    label='Phone'
                    name='contact'
                    rules={[
                      { required: true, message: 'Contact is required' },
                      {
                        validator: async (_, value) => {
                          if (value) {
                            if (typeof value !== 'string' || !/^\d+$/.test(value)) {
                              throw new Error('Phone number must contain only digits');
                            }

                            if (value.length > 15) {
                              throw new Error('Phone number must not exceed 15 digits');
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
                          value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                        },
                      },
                    ]}
                  >
                    <Input placeholder='Enter your email' size='large' />
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
                        validator: async (_, value: string) => {
                          if (!value) return Promise.resolve();

                          try {
                            const url = new URL(value);
                            const domain = url.hostname;

                            if (!domain.includes('.')) {
                              return Promise.reject(
                                'Website must contain at least one dot (e.g., example.com)',
                              );
                            }

                            if (/^[-.]/.test(domain) || /[-.]$/.test(domain)) {
                              return Promise.reject(
                                'Website must not start or end with a hyphen or dot',
                              );
                            }

                            if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
                              return Promise.reject(
                                'Website contains invalid characters in domain (only letters, numbers, dots, and hyphens allowed)',
                              );
                            }

                            if (/(\.\.|--)/.test(domain)) {
                              return Promise.reject(
                                'Website must not contain consecutive dots or hyphens',
                              );
                            }
                            // If all checks pass, return resolved promise
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
                    <Input placeholder='Enter your website e.g. https://example.com' size='large' />
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
                    style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}
                    labelCol={{ span: 24 }}
                    colon={false}
                  >
                    <Switch checkedChildren='Yes' unCheckedChildren='No' />
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
                      maxLength={250}
                      style={{ fontSize: '16px' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Broad Fields */}
              <Row gutter={[12, 16]}>
                <Col xs={24}>
                  <Form.Item
                    label='Broad Fields'
                    name='academicFields'
                    rules={[
                      { required: true, message: 'Please select at least one academic field' },
                    ]}
                  >
                    <Select
                      mode='multiple'
                      placeholder='Select broad fields of university'
                      style={{ width: '100%' }}
                      size='large'
                      maxTagCount='responsive'
                      onChange={handleAcademicFieldsChange}
                    >
                      {fieldNamesOptions.map((field) => (
                        <Option key={field.value} value={field.value}>
                          {field.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Subjects - IMPROVED VERSION */}
              <Row gutter={[12, 16]}>
                <Col xs={24}>
                  {form.getFieldValue('academicFields')?.map((field: string) => (
                    <Form.Item
                      key={field}
                      label={`Field of Study for ${
                        fieldNamesOptions.find((f) => f.value === field)?.label || field
                      }`}
                      name={`subjects_${field}`}
                      rules={[
                        {
                          required: true,
                          message: `Please select at least one subject for ${field}`,
                        },
                      ]}
                    >
                      <Select
                        mode='multiple'
                        placeholder={
                          loadingSubjects[field] ? 'Loading subjects...' : 'Select subjects'
                        }
                        options={fieldSubjectsMap[field]?.map((subject) => ({
                          label: subject,
                          value: subject,
                        }))}
                        disabled={loadingSubjects[field]}
                        loading={loadingSubjects[field]}
                        notFoundContent={
                          loadingSubjects[field]
                            ? 'Loading...'
                            : !fieldSubjectsMap[field] || fieldSubjectsMap[field].length === 0
                            ? 'No subjects available'
                            : null
                        }
                        size='large'
                      />
                    </Form.Item>
                  ))}
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
                    Cancel
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
        </LayoutWrapper>
      </div>
    </div>
  );
};

export default CreateUniversity;
