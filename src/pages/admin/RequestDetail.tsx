import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { Card, Row, Col, Input, Select, Button, Typography, Space, Spin, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import AdminHeader from '../../components/AdminHeader';
import LayoutWrapper from '../../components/LayoutWrapper';

const { Title, Text } = Typography;
const { Option } = Select;

// Interface for detailed request data
interface RequestDetailData {
  id: string;
  number: number;
  requestType: string;
  universityName: string;
  country: string;
  location: string;
  email: string;
  website: string;
  phone: string;
  numberOfStudents: string;
  type: string;
  status: 'Pending' | 'In Progress' | 'Rejected' | 'Completed';
  submittedBy: string;
  submittedDate: string;
  description?: string;
}

const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requestData, setRequestData] = useState<RequestDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration - in real app, this would come from API
  const mockDetailData: Record<string, RequestDetailData> = {
    '1': {
      id: '1',
      number: 1,
      requestType: 'New University',
      universityName: 'Harvard University',
      country: 'America',
      location: 'Cambridge, Massachusetts',
      email: 'admissions@harvard.edu',
      website: 'https://www.harvard.edu',
      phone: '+1-617-495-1000',
      numberOfStudents: '23000',
      type: 'Academic',
      status: 'Pending',
      submittedBy: 'john.doe@email.com',
      submittedDate: '2024-01-15',
      description: 'Request to add Harvard University to the system database.',
    },
    '2': {
      id: '2',
      number: 2,
      requestType: 'Update Information',
      universityName: 'Harvard University',
      country: 'America',
      location: 'Cambridge, Massachusetts',
      email: 'info@harvard.edu',
      website: 'https://www.harvard.edu',
      phone: '+1-617-495-1000',
      numberOfStudents: '23500',
      type: 'Academic',
      status: 'Rejected',
      submittedBy: 'jane.smith@email.com',
      submittedDate: '2024-01-14',
      description: 'Request to update contact information and student count.',
    },
    '3': {
      id: '3',
      number: 3,
      requestType: 'New University',
      universityName: 'MIT',
      country: 'America',
      location: 'Cambridge, Massachusetts',
      email: 'admissions@mit.edu',
      website: 'https://www.mit.edu',
      phone: '+1-617-253-1000',
      numberOfStudents: '11500',
      type: 'Technical',
      status: 'In Progress',
      submittedBy: 'bob.wilson@email.com',
      submittedDate: '2024-01-13',
      description: 'Request to add Massachusetts Institute of Technology to the system.',
    },
  };

  useEffect(() => {
    const fetchRequestDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (id && mockDetailData[id]) {
          setRequestData(mockDetailData[id]);
        } else {
          throw new Error('Request not found');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch request details';
        setError(errorMessage);
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRequestDetail();
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/edit-request/${id}`);
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <Spin size='large' />
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <Title level={4} style={{ color: '#ff4d4f' }}>
              {error || 'Request not found'}
            </Title>
            <Button
              type='primary'
              onClick={handleBack}
              style={{ backgroundColor: '#ff7a00', borderColor: '#ff7a00' }}
            >
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: '24px' }}>
      <AdminHeader />
      <Card>
        <LayoutWrapper>
          {/* Form Fields */}
          <Row gutter={[24, 24]}>
            {/* University Name */}
            <Col span={24}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>University Name</Text>
              </div>
              <Input
                value={requestData.universityName}
                readOnly
                style={{
                  height: '48px',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  cursor: 'not-allowed',
                }}
              />
            </Col>

            {/* Country and Location */}
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Country</Text>
              </div>
              <Input
                value={requestData.country}
                readOnly
                style={{
                  height: '48px',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  cursor: 'not-allowed',
                }}
              />
            </Col>

            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Location</Text>
              </div>
              <Input
                value={requestData.location}
                readOnly
                style={{
                  height: '48px',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  cursor: 'not-allowed',
                }}
              />
            </Col>

            {/* Email and Website */}
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Email</Text>
              </div>
              <Input
                value={requestData.email}
                readOnly
                style={{
                  height: '48px',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  cursor: 'not-allowed',
                }}
              />
            </Col>

            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Website</Text>
              </div>
              <Input
                value={requestData.website}
                readOnly
                style={{
                  height: '48px',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  cursor: 'not-allowed',
                }}
              />
            </Col>

            {/* Phone and Number of Students */}
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Phone</Text>
              </div>
              <Input
                value={requestData.phone}
                readOnly
                style={{
                  height: '48px',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  cursor: 'not-allowed',
                }}
              />
            </Col>

            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Number of Students</Text>
              </div>
              <Input
                value={requestData.numberOfStudents}
                readOnly
                style={{
                  height: '48px',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  cursor: 'not-allowed',
                }}
              />
            </Col>

            {/* Type and Status */}
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Type</Text>
              </div>
              <Select
                value={requestData.type}
                disabled
                style={{
                  height: '48px',
                  width: '100%',
                  backgroundColor: '#f5f5f5',
                }}
              >
                <Option value='Academic'>Academic</Option>
                <Option value='Technical'>Technical</Option>
                <Option value='Research'>Research</Option>
              </Select>
            </Col>

            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Status</Text>
              </div>
              <Select
                value={requestData.status}
                disabled
                style={{
                  height: '48px',
                  width: '100%',
                  backgroundColor: '#f5f5f5',
                }}
              >
                <Option value='Pending'>Pending</Option>
                <Option value='In Progress'>In Progress</Option>
                <Option value='Rejected'>Rejected</Option>
                <Option value='Completed'>Completed</Option>
              </Select>
            </Col>
          </Row>

          {/* Action Buttons */}
          <Row justify='end' style={{ marginTop: 32 }}>
            <Col>
              <Space>
                <Button onClick={handleBack}>Cancel</Button>
                <Button
                  type='primary'
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  style={{ backgroundColor: '#ff7a00', borderColor: '#ff7a00' }}
                >
                  Edit
                </Button>
              </Space>
            </Col>
          </Row>
        </LayoutWrapper>
      </Card>
    </div>
  );
};

export default RequestDetail;
