import {
  ArrowLeftOutlined,
  SaveOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined,
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
  Timeline,
  Space,
  Divider,
  Layout,
} from 'antd';
import axios from 'axios';
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
  phone: string;
  email: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

interface StatusHistory {
  id: string;
  status: string;
  updatedBy: string;
  updatedAt: string;
  reason?: string;
  comment?: string;
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
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [isEditable, setIsEditable] = useState(false);

  // Load initial request data
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setPageLoading(true);
        // Placeholder API call - replace with actual endpoint
        const response = await axios.get(`/admin/requests/${id}`);
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

    // Mock data for development
    const mockData: RequestData = {
      id: id || '1',
      universityName: 'Harvard University',
      representativeName: 'Nguyen Van A',
      requestType: 'Update Information',
      status: 'Pending',
      phone: '21151515151',
      email: 'example@gmail.com',
      message:
        'Request to update university information including contact details and academic programs.',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    };

    setRequestData(mockData);
    form.setFieldsValue(mockData);
    setPageLoading(false);

    // Uncomment for actual API call
    // if (id) fetchRequest();
  }, [id, form, navigate]);

  // Load status history
  useEffect(() => {
    const fetchStatusHistory = async () => {
      try {
        // Placeholder API call - replace with actual endpoint
        const response = await axios.get(`/admin/requests/${id}/history`);
        setStatusHistory(response.data);
      } catch (err) {
        console.error('Failed to load status history');
      }
    };

    // Mock history data
    const mockHistory: StatusHistory[] = [
      {
        id: '1',
        status: 'Pending',
        updatedBy: 'System',
        updatedAt: '2024-01-15T10:30:00Z',
        comment: 'Request submitted',
      },
    ];
    setStatusHistory(mockHistory);

    // Uncomment for actual API call
    // if (id) fetchStatusHistory();
  }, [id]);

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'Rejected') {
      setPendingStatus(newStatus);
      setRejectModalVisible(true);
    } else {
      // Just update the form value, actual save happens on form submit
      form.setFieldsValue({ status: newStatus });
    }
  };

  // Submit form
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        status: values.status,
        ...(values.status === 'Rejected' &&
          pendingStatus === 'Rejected' && { reason: values.rejectionReason }),
      };

      // Placeholder API call - replace with actual endpoint
      await axios.patch(`/admin/requests/${id}`, payload);

      message.success('Request updated successfully!');
      setIsEditable(false);

      // Update local state
      setRequestData((prev) => (prev ? { ...prev, status: values.status } : null));

      // Add to history
      const newHistoryItem: StatusHistory = {
        id: Date.now().toString(),
        status: values.status,
        updatedBy: 'Current Admin', // Replace with actual admin name
        updatedAt: new Date().toISOString(),
        ...(values.rejectionReason && { reason: values.rejectionReason }),
      };
      setStatusHistory((prev) => [...prev, newHistoryItem]);
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
    // Reset status to original value
    form.setFieldsValue({ status: requestData?.status });
  };

  // Reset form
  const handleReset = async () => {
    try {
      // Reload original data
      form.setFieldsValue(requestData);
      setIsEditable(false);
      message.info('Changes cancelled');
    } catch {
      message.error('Reset failed');
    }
  };

  // Show history modal
  const showHistoryModal = () => {
    setShowHistory(true);
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

  const availableStatuses = requestData ? getAvailableStatusTransitions(requestData.status) : [];
  const isStatusChangeable = availableStatuses.length > 0;

  return (
    <div className='p-6 bg-gray-100 min-h-screen'>
      <AdminHeader />
      <LayoutWrapper>
        <div className='max-w-4xl mx-auto'>
          <div className='mb-6'>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/manage')}
              className='mb-4'
            >
              Back
            </Button>
            <div className='flex justify-between items-center'>
              <Title level={3}>{isEditable ? 'Edit Request' : 'Request Information'}</Title>
              <Button icon={<HistoryOutlined />} onClick={showHistoryModal} type='default'>
                View History
              </Button>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <Form form={form} layout='vertical' onFinish={onFinish}>
              <Form.Item label='University Name' name='universityName'>
                <Input disabled className='rounded-md' />
              </Form.Item>

              <Form.Item label='Representative Name' name='representativeName'>
                <Input disabled className='rounded-md' />
              </Form.Item>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Form.Item label='Request Type' name='requestType'>
                  <Input disabled className='rounded-md' />
                </Form.Item>

                <Form.Item label='Status' name='status'>
                  <Select
                    disabled={!isEditable || !isStatusChangeable}
                    className='rounded-md'
                    onChange={handleStatusChange}
                  >
                    <Option value={requestData?.status}>{requestData?.status}</Option>
                    {isEditable &&
                      availableStatuses.map((status) => (
                        <Option key={status} value={status}>
                          {status}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Form.Item label='Phone' name='phone'>
                  <Input disabled className='rounded-md' />
                </Form.Item>

                <Form.Item label='Email' name='email'>
                  <Input disabled className='rounded-md' />
                </Form.Item>
              </div>

              <Form.Item label='Message' name='message'>
                <TextArea rows={4} disabled className='rounded-md' />
              </Form.Item>

              {/* Hidden field for rejection reason */}
              <Form.Item name='rejectionReason' style={{ display: 'none' }}>
                <Input />
              </Form.Item>

              {requestData && (
                <div className='mt-6 p-4 bg-gray-50 rounded-md'>
                  <Text strong>Request Information:</Text>
                  <div className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                    <div>
                      <Text type='secondary'>Created:</Text> {formatDate(requestData.createdAt)}
                    </div>
                    <div>
                      <Text type='secondary'>Last Updated:</Text>{' '}
                      {formatDate(requestData.updatedAt)}
                    </div>
                    <div>
                      <Text type='secondary'>Current Status:</Text>{' '}
                      <span style={{ color: getStatusColor(requestData.status) }}>
                        {requestData.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className='flex justify-end space-x-4 mt-6'>
                {!isEditable ? (
                  <Button
                    onClick={() => setIsEditable(true)}
                    className='bg-[#ff7a00] text-white'
                    disabled={!isStatusChangeable}
                  >
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleReset}>Cancel</Button>
                    <Button
                      htmlType='submit'
                      loading={loading}
                      icon={<SaveOutlined />}
                      className='bg-[#ff7a00] text-white'
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                )}
              </div>
            </Form>
          </div>

          {/* Status History Modal */}
          <Modal
            title='Status History'
            open={showHistory}
            onCancel={() => setShowHistory(false)}
            footer={[
              <Button key='close' onClick={() => setShowHistory(false)}>
                Close
              </Button>,
            ]}
            width={600}
          >
            <Timeline>
              {statusHistory.map((item) => (
                <Timeline.Item key={item.id} color={getStatusColor(item.status)}>
                  <div>
                    <div className='font-semibold'>{item.status}</div>
                    <div className='text-sm text-gray-600'>
                      By {item.updatedBy} • {formatDate(item.updatedAt)}
                    </div>
                    {item.comment && <div className='text-sm mt-1'>{item.comment}</div>}
                    {item.reason && (
                      <div className='text-sm mt-1 text-red-600'>
                        <strong>Reason:</strong> {item.reason}
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Modal>

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
