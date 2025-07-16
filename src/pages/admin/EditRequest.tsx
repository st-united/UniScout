import {
  ArrowLeftOutlined,
  SaveOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import {
  Form,
  Input,
  Select,
  Button,
  message,
  Typography,
  Spin,
  Modal,
  Space,
  Divider,
  Card,
  Row,
  Col,
  Tag,
} from 'antd';
import axios from 'axios';
import { GraduationCap } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import AdminHeader from '../../components/AdminHeader';
import LayoutWrapper from '../../components/LayoutWrapper';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

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
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          Reject Request
        </Space>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText='Reject'
      cancelText='Cancel'
      okButtonProps={{ danger: true }}
      width={500}
    >
      <Divider />
      <Form form={form} layout='vertical'>
        <Form.Item
          label='Rejection Reason'
          name='reason'
          rules={[
            { required: true, message: 'Please provide a rejection reason' },
            { min: 10, message: 'Reason must be at least 10 characters' },
            { max: 500, message: 'Reason cannot exceed 500 characters' },
          ]}
        >
          <TextArea
            rows={4}
            placeholder='Please provide a detailed reason for rejection...'
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const EditRequest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        const response = await axios.get(`/api/admin/contact/${id}`);
        const data = response.data;

        setRequestData(data);
        form.setFieldsValue(data);
      } catch (err) {
        message.error('Failed to load request data');
        navigate('/manage');
      } finally {
        setPageLoading(false);
      }
    };

    if (id) {
      fetchRequest();
    }
  }, [id, form, navigate]);

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
      const payload: any = {
        status: values.status,
      };

      if (values.status === 'Rejected' && values.rejectionReason) {
        payload.rejectionReason = values.rejectionReason;
      }

      await axios.patch(`/api/admin/contact/${id}/status`, payload);

      message.success('Request updated successfully!');
      setIsEditable(false);

      // Update local state
      setRequestData((prev) => (prev ? { ...prev, status: values.status } : null));
    } catch (err: any) {
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

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (pageLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <Spin size='large' />
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <div className='text-center'>
          <Text type='secondary'>Request not found</Text>
        </div>
      </div>
    );
  }

  const availableStatuses = getAvailableStatusTransitions(requestData.status);
  const isStatusChangeable = availableStatuses.length > 0;

  return (
    <div className='p-6 bg-gray-100 min-h-screen'>
      <AdminHeader />
      <LayoutWrapper>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='mb-6'>
            <div className='flex justify-between items-center mb-4'>
              <Title level={3} style={{ color: '#ff7a00', margin: 0 }}>
                Detail of requests
              </Title>
              <Button
                icon={<CloseOutlined />}
                onClick={() => navigate('/manage')}
                type='text'
                size='large'
                style={{ color: '#666' }}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className='bg-white rounded-lg shadow-sm p-8'>
            <Form form={form} layout='vertical' onFinish={onFinish}>
              {/* General Information */}
              <div className='mb-8'>
                <Title level={4} style={{ color: '#ff7a00', marginBottom: 24 }}>
                  General Information
                </Title>

                <Row gutter={[32, 24]}>
                  <Col xs={24} md={12}>
                    <div className='flex items-center space-x-3 mb-2'>
                      <GraduationCap style={{ color: '#ff7a00', fontSize: 18 }} />
                      <Text strong style={{ fontSize: 16 }}>
                        University name
                      </Text>
                    </div>
                    <Form.Item name='universityName' style={{ marginBottom: 0 }}>
                      <Input
                        disabled
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          padding: 0,
                          fontSize: 14,
                          color: '#666',
                        }}
                      />
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
                      <Input
                        disabled
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          padding: 0,
                          fontSize: 14,
                          color: '#666',
                        }}
                      />
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
                      <Input
                        disabled
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          padding: 0,
                          fontSize: 14,
                          color: '#666',
                        }}
                      />
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
                      <Input
                        disabled
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          padding: 0,
                          fontSize: 14,
                          color: '#666',
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Message */}
              <div className='mb-8'>
                <Title level={4} style={{ color: '#ff7a00', marginBottom: 16 }}>
                  Message
                </Title>
                <Form.Item name='message' style={{ marginBottom: 0 }}>
                  <TextArea
                    rows={4}
                    disabled
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

              {/* Request Information */}
              <div className='mb-8'>
                <Title level={4} style={{ color: '#ff7a00', marginBottom: 24 }}>
                  Request Information
                </Title>

                <Row gutter={[32, 24]}>
                  <Col xs={24} md={12}>
                    <div className='mb-2'>
                      <Text strong style={{ fontSize: 16 }}>
                        Request Type
                      </Text>
                    </div>
                    <Form.Item name='requestType' style={{ marginBottom: 0 }}>
                      <Tag
                        style={{
                          backgroundColor: '#f0f0f0',
                          border: '1px solid #d9d9d9',
                          borderRadius: 16,
                          padding: '4px 12px',
                          fontSize: 14,
                          color: '#333',
                        }}
                      >
                        <Input
                          disabled
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: 0,
                            fontSize: 14,
                            color: '#333',
                          }}
                        />
                      </Tag>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <div className='mb-2'>
                      <Text strong style={{ fontSize: 16 }}>
                        Status
                      </Text>
                    </div>
                    <Form.Item name='status' style={{ marginBottom: 0 }}>
                      <Select
                        disabled={!isEditable || !isStatusChangeable}
                        style={{
                          minWidth: 150,
                          borderRadius: 16,
                        }}
                        onChange={handleStatusChange}
                        suffixIcon={isEditable && isStatusChangeable ? undefined : null}
                      >
                        <Option value={requestData.status}>{requestData.status}</Option>
                        {isEditable &&
                          availableStatuses.map((status) => (
                            <Option key={status} value={status}>
                              {status}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Hidden field for rejection reason */}
              <Form.Item name='rejectionReason' style={{ display: 'none' }}>
                <Input />
              </Form.Item>

              {/* Action Buttons */}
              <div className='flex justify-end space-x-3 mt-8'>
                {!isEditable ? (
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => setIsEditable(true)}
                    style={{
                      backgroundColor: '#ff7a00',
                      borderColor: '#ff7a00',
                      color: 'white',
                      borderRadius: 6,
                    }}
                    disabled={!isStatusChangeable}
                  >
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleReset} style={{ borderRadius: 6 }}>
                      Cancel
                    </Button>
                    <Button
                      htmlType='submit'
                      loading={loading}
                      icon={<SaveOutlined />}
                      style={{
                        backgroundColor: '#ff7a00',
                        borderColor: '#ff7a00',
                        color: 'white',
                        borderRadius: 6,
                      }}
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
      </LayoutWrapper>
    </div>
  );
};

export default EditRequest;
