import {
  SaveOutlined,
  EditOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { Form, Input, Select, Button, message, Typography, Spin, Modal, Row, Col } from 'antd';
import axios from 'axios';
import { GraduationCap } from 'lucide-react';
import React, { useState, useEffect } from 'react';
// Removed: useParams, useNavigate, AdminHeader, LayoutWrapper as they are handled by the parent/Modal

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

// API Base URL
const API_BASE_URL = 'https://api.uniscout.dev.stunited.vn/api';

// Types
interface RequestData {
  id: string;
  universityName: string;
  representativeName: string;
  requestType: string;
  status: string;
  representativeNumber: string;
  representativeEmail: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

interface RejectModalProps {
  visible: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading: boolean;
}

interface EditRequestModalContentProps {
  requestId: string;
  onClose: () => void; // Add an onClose prop to close the modal
  onUpdate?: () => void; // Make onUpdate optional to align with RequestDetailModalContentProps
}

// Status transition rules
const getAvailableStatusTransitions = (currentStatus: string): string[] => {
  switch (currentStatus?.toLowerCase()) {
    case 'pending':
      return ['In Progress', 'Completed', 'Rejected'];
    case 'in progress':
      return ['Completed', 'Rejected'];
    case 'completed':
    case 'rejected':
      return []; // Final states
    default:
      return [];
  }
};

const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return '#faad14';
    case 'in progress':
      return '#1890ff';
    case 'completed':
      return '#52c41a';
    case 'rejected':
      return '#f5222d';
    default:
      return '#d9d9d9';
  }
};

// Mock data moved outside the component
const mockRequestData: RequestData = {
  id: 'mock-id', // Will be overridden by actual requestId if available
  universityName: 'Mock Nhi University',
  representativeName: 'Nhi',
  requestType: 'Update Information',
  status: 'Pending',
  representativeNumber: '093175465121',
  representativeEmail: 'ngoc.nhi@stunited.edu',
  message: 'Example',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Reject Modal Component
const RejectModal: React.FC<RejectModalProps> = ({ visible, onConfirm, onCancel, loading }) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onConfirm(values.reason);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      centered
      closable={false}
      bodyStyle={{
        padding: '24px 40px',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        maxHeight: '450px',
      }}
      style={{
        borderRadius: 12,
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: '#ffebee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: '#ffcdd2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '15px solid transparent',
              borderRight: '15px solid transparent',
              borderBottom: '25px solid #f44336',
              position: 'relative',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            !
          </div>
        </div>
      </div>

      <Title
        level={3}
        style={{
          color: '#333',
          marginBottom: 12,
          fontSize: 22,
          fontWeight: 700,
          textAlign: 'center',
        }}
      >
        Reject Request
      </Title>

      <Text
        style={{
          color: '#666',
          fontSize: 16,
          fontWeight: 500,
          textAlign: 'left',
          marginBottom: 12,
        }}
      >
        Please provide a reason for rejection
      </Text>

      <Form form={form} layout='vertical'>
        <Form.Item
          name='reason'
          rules={[
            { required: true, message: 'Please provide a rejection reason' },
            { min: 10, message: 'Reason must be at least 10 characters' },
            { max: 500, message: 'Reason cannot exceed 500 characters' },
          ]}
          style={{ textAlign: 'left', marginBottom: 12 }}
        >
          <TextArea
            rows={2}
            showCount
            maxLength={500}
            style={{
              borderRadius: 10,
              padding: '12px 18px',
              fontSize: 16,
              border: '1px solid #d9d9d9',
              backgroundColor: '#ffffff',
            }}
          />
        </Form.Item>

        <Text
          style={{
            color: '#999',
            fontSize: 14,
            fontStyle: 'italic',
            textAlign: 'left',
            marginTop: -10,
            marginBottom: 20,
            display: 'block',
          }}
        >
          This field is required (10-500 characters)
        </Text>
      </Form>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <Button
          onClick={handleCancel}
          size='large'
          style={{
            minWidth: 120,
            height: 48,
            borderRadius: 24,
            border: '1px solid #d9d9d9',
            backgroundColor: '#ffffff',
            color: '#666',
            fontSize: 16,
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e3f2fd';
            e.currentTarget.style.borderColor = '#1976d2';
            e.currentTarget.style.color = '#1976d2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#d9d9d9';
            e.currentTarget.style.color = '#666';
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          loading={loading}
          size='large'
          style={{
            minWidth: 120,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#ff7043',
            borderColor: '#ff7043',
            color: 'white',
            fontSize: 16,
            fontWeight: 500,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7934d')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff7043')}
        >
          OK
        </Button>
      </div>
    </Modal>
  );
};

const EditRequestModalContent: React.FC<EditRequestModalContentProps> = ({
  requestId,
  onClose,
  onUpdate,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [isEditable, setIsEditable] = useState(false);

  // Load initial request data
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setPageLoading(true);
        console.log('Fetching request data for ID:', requestId);
        // Using `API_BASE_URL` from the ManageRequest.tsx context, assuming it's correctly set up for API calls
        const response = await axios.get(`/admin/contact/${requestId}`);
        const data = response.data;

        console.log('API Response:', data);

        // Map API response to expected format
        const mappedData: RequestData = {
          id: data.id || requestId,
          universityName: data.universityName || '',
          representativeName: data.representativeName || '',
          requestType: data.requestType || '',
          status: data.status || '',
          representativeNumber: data.representativeNumber || '',
          representativeEmail: data.representativeEmail || '',
          message: data.message || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        };

        setRequestData(mappedData);
        form.setFieldsValue(mappedData);
        console.log('Data loaded successfully:', mappedData);
      } catch (err) {
        console.warn('API failed, loading mock data instead:', err);
        // Use a spread to assign requestId to the mock data's ID
        setRequestData({ ...mockRequestData, id: requestId });
        form.setFieldsValue({ ...mockRequestData, id: requestId });
        message.warning('Loaded fallback mock data - API endpoint may be unavailable');
      } finally {
        setPageLoading(false);
      }
    };

    if (requestId) {
      fetchRequest();
    }
  }, [requestId, form]); // mockRequestData is no longer a dependency here

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'Rejected') {
      setPendingStatus(newStatus);
      setRejectModalVisible(true);
    } else {
      form.setFieldsValue({ status: newStatus });
    }
  };

  // Submit form
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        status: values.status,
        rejectionReason:
          values.status === 'Rejected'
            ? values.rejectionReason
            : `Status manually set to ${values.status}`,
      };

      console.log('Submitting payload:', payload);
      // Using `API_BASE_URL` from the ManageRequest.tsx context
      await axios.patch(`/admin/contact/${requestId}/status`, payload);

      message.success('Request updated successfully!');
      setIsEditable(false);

      // Update local state
      setRequestData((prev) => (prev ? { ...prev, status: values.status } : null));
      if (onUpdate) onUpdate(); // Call onUpdate to refresh parent data
    } catch (err: any) {
      console.error('Update failed:', err);
      const msg = err?.response?.data?.message;
      message.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle reject confirmation
  const handleRejectConfirm = (reason: string) => {
    form.setFieldsValue({
      status: 'Rejected',
      rejectionReason: reason,
    });
    setRejectModalVisible(false);
    setPendingStatus('');
  };

  // Handle reject cancel
  const handleRejectCancel = () => {
    setRejectModalVisible(false);
    setPendingStatus('');
    form.setFieldsValue({ status: requestData?.status });
  };

  // Reset form
  const handleReset = () => {
    form.setFieldsValue(requestData);
    setIsEditable(false);
    message.info('Changes cancelled');
  };

  if (pageLoading) {
    return (
      <div className='flex items-center justify-center p-6' style={{ minHeight: '300px' }}>
        <Spin size='large' />
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className='flex items-center justify-center p-6' style={{ minHeight: '300px' }}>
        <div className='text-center'>
          <Text type='secondary'>Request not found</Text>
          <Button onClick={onClose} style={{ marginTop: 16 }}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  const availableStatuses = getAvailableStatusTransitions(requestData.status);
  const isStatusChangeable = availableStatuses.length > 0;

  return (
    <div className='p-4' style={{ marginTop: '-20px' }}>
      {/* Main Content */}
      <div className='bg-white rounded-lg shadow-sm p-4'>
        <Form form={form} layout='vertical' onFinish={onFinish}>
          {/* Request Details Container */}
          <div
            className='mb-6 p-4 rounded-lg'
            style={{
              border: '1px solid #e8e8e8',
              backgroundColor: 'white',
            }}
          >
            <Title level={4} style={{ color: '#ff7a00', marginBottom: 20 }}>
              Request Details
            </Title>

            <div>
              <Row gutter={[32, 20]}>
                <Col xs={24} md={12}>
                  <div className='flex items-center space-x-3 mb-2'>
                    <GraduationCap style={{ color: '#ff7a00', fontSize: 18 }} />
                    <Text strong style={{ fontSize: 16 }}>
                      University name
                    </Text>
                  </div>
                  <Form.Item name='universityName' style={{ marginBottom: 0 }}>
                    <div style={{ fontSize: 14, color: '#666' }}>{requestData.universityName}</div>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <div className='flex items-center space-x-3 mb-2'>
                    <UserOutlined style={{ color: '#ff7a00', fontSize: 18 }} />
                    <Text strong style={{ fontSize: 16 }}>
                      Representative
                    </Text>
                  </div>
                  <Form.Item name='representativeName' style={{ marginBottom: 0 }}>
                    <div style={{ fontSize: 14, color: '#666' }}>
                      {requestData.representativeName}
                    </div>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <div className='flex items-center space-x-3 mb-2'>
                    <MailOutlined style={{ color: '#ff7a00', fontSize: 18 }} />
                    <Text strong style={{ fontSize: 16 }}>
                      Email
                    </Text>
                  </div>
                  <Form.Item name='representativeEmail' style={{ marginBottom: 0 }}>
                    <div style={{ fontSize: 14, color: '#666' }}>
                      {requestData.representativeEmail}
                    </div>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <div className='flex items-center space-x-3 mb-2'>
                    <PhoneOutlined style={{ color: '#ff7a00', fontSize: 18 }} />
                    <Text strong style={{ fontSize: 16 }}>
                      Phone
                    </Text>
                  </div>
                  <Form.Item name='representativeNumber' style={{ marginBottom: 0 }}>
                    <div style={{ fontSize: 14, color: '#666' }}>
                      {requestData.representativeNumber}
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          {/* Message Container */}
          <div
            className='mb-6 p-4 rounded-lg'
            style={{
              border: '1px solid #e8e8e8',
              backgroundColor: 'white',
            }}
          >
            <Title level={4} style={{ color: '#ff7a00', marginBottom: 12 }}>
              Message
            </Title>
            <Form.Item name='message' style={{ marginBottom: 0 }}>
              <TextArea
                rows={3}
                disabled
                value={requestData.message}
                style={{
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #e8e8e8',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  color: '#333',
                }}
              />
            </Form.Item>
          </div>

          {/* Request Information Container */}
          <div
            className='mb-6 p-4 rounded-lg'
            style={{
              border: '1px solid #e8e8e8',
              backgroundColor: 'white',
            }}
          >
            <Title level={4} style={{ color: '#ff7a00', marginBottom: 20 }}>
              Request Information
            </Title>

            <div>
              <Row gutter={[32, 16]} align='middle'>
                {' '}
                {/* Modified: Added vertical gutter for small screens */}
                <Col xs={24} md={12}>
                  <div className='flex items-center space-x-3'>
                    <Text strong style={{ fontSize: 14, whiteSpace: 'nowrap' }}>
                      Request Type
                    </Text>
                    <div style={{ flexGrow: 1 }}>
                      <Form.Item
                        name='requestType'
                        style={{
                          marginBottom: 0,
                          display: 'inline-block', // Ensures it doesn’t break the line
                          width: '100%',
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: '#f0f0f0',
                            border: '1px solid #d9d9d9',
                            borderRadius: 20,
                            padding: '6px 12px',
                            fontSize: 14,
                            color: '#333',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {requestData.requestType}
                        </div>
                      </Form.Item>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className='flex items-center space-x-3'>
                    <Text strong style={{ fontSize: 14 }}>
                      Status
                    </Text>
                    <Form.Item name='status' style={{ marginBottom: 0 }}>
                      <Select
                        disabled={!isEditable || !isStatusChangeable}
                        style={{
                          minWidth: 160,
                          borderRadius: 20,
                          width: '100%', // Modified: Make select full width on smaller screens
                        }}
                        size='middle'
                        onChange={handleStatusChange}
                        suffixIcon={isEditable && isStatusChangeable ? undefined : null}
                        value={requestData.status}
                      >
                        <Option value='Pending'>Pending</Option>
                        <Option value='In Progress'>In Progress</Option>
                        <Option value='Completed'>Completed</Option>
                        <Option value='Rejected'>Rejected</Option>
                      </Select>
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          {/* Hidden field for rejection reason */}
          <Form.Item name='rejectionReason' style={{ display: 'none' }}>
            <Input />
          </Form.Item>

          {/* Action Buttons */}
          <div className='flex justify-end space-x-3 mt-8 flex-wrap'>
            {' '}
            {/* Modified: Added flex-wrap for responsiveness */}
            {!isEditable ? (
              <Button
                icon={<EditOutlined />}
                onClick={() => setIsEditable(true)}
                style={{
                  backgroundColor: '#ff7a00',
                  borderColor: '#ff7a00',
                  color: 'white',
                  borderRadius: 6,
                  width: '100%', // Modified: Full width on small screens
                  maxWidth: '120px', // Max width on larger screens
                }}
                disabled={!isStatusChangeable}
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  htmlType='submit'
                  loading={loading}
                  icon={<SaveOutlined />}
                  style={{
                    backgroundColor: '#ff7a00',
                    borderColor: '#ff7a00',
                    color: 'white',
                    borderRadius: 6,
                    width: '100%', // Modified: Full width on small screens
                    maxWidth: '120px', // Max width on larger screens
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7a445')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff7043')}
                >
                  Save
                </Button>
              </>
            )}
          </div>
        </Form>
      </div>

      {/* Reject Modal */}
      <RejectModal
        visible={rejectModalVisible}
        onConfirm={handleRejectConfirm}
        onCancel={handleRejectCancel}
        loading={loading}
      />
    </div>
  );
};

export default EditRequestModalContent;
