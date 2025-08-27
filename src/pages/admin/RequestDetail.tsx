import { EditOutlined, SaveOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Spin,
  message,
  Select,
  Form,
  Input,
  Modal,
} from 'antd';
import axios from 'axios';
import {
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Globe,
  Users,
  FileText,
  Building,
  Flag,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// API Base URL
const API_BASE_URL = 'https://api.uniscout.dev.stunited.vn/api';

// Interface for detailed request data
interface RequestDetailData {
  id: number;
  requestType: string;
  universityName: string;
  representativeName: string;
  representativeEmail: string;
  representativeNumber: string;
  message: string | null;
  abbreviation: string;
  country: string;
  location: string;
  type: string;
  universityEmail: string;
  universityNumber: string;
  website: string;
  subjectsExcelFilePath: string | null;
  numberOfStudents: string | null;
  description: string;
  submittedAt: string;
  status: 'Pending' | 'In Progress' | 'Rejected' | 'Completed';
  rejectionReason: string | null;
}

interface RequestDetailModalContentProps {
  requestId: string;
  onClose: () => void;
  onUpdate?: () => void; // Callback to refresh data in parent after update
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
          backgroundColor: 'ffebee',
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
const ConfirmCompleteModal: React.FC<{
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ visible, onConfirm, onCancel, loading }) => {
  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
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
      style={{ borderRadius: 12 }}
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
        Complete Request
      </Title>

      <Text
        style={{
          color: '#666',
          fontSize: 16,
          fontWeight: 500,
          textAlign: 'center',
          marginBottom: 20,
          display: 'block',
        }}
      >
        When marked as completed, the system will automatically create a new university record. Do
        you want to proceed?
      </Text>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <Button
          onClick={onCancel}
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
          onClick={onConfirm}
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
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff7043')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff7043')}
        >
          OK
        </Button>
      </div>
    </Modal>
  );
};

const RequestDetailModalContent: React.FC<RequestDetailModalContentProps> = ({
  requestId,
  onClose,
  onUpdate,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false); // Used for form submission
  const [pageLoading, setPageLoading] = useState(true); // Used for initial page load
  const [rejectModalLoading, setRejectModalLoading] = useState(false); // New state for reject modal
  const [requestData, setRequestData] = useState<RequestDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [isEditable, setIsEditable] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmedCompleted, setConfirmedCompleted] = useState(false);

  // Mock data for demonstration when API fails
  const mockDetailData: RequestDetailData = {
    id: 1,
    requestType: 'New University',
    universityName: 'Harvard University',
    representativeName: 'John Doe',
    representativeEmail: 'phuasien@gmail.com',
    representativeNumber: '98808251',
    message: null,
    abbreviation: 'HU',
    country: 'US',
    location: 'Cambridge, Massachusetts',
    type: 'Public',
    universityEmail: 'admissions@harvard.edu',
    universityNumber: '+1-617-495-1000',
    website: 'harvard.edu',
    subjectsExcelFilePath:
      'uploads/excel-submissions/1752743239306-subjectsExcel-1752743239291-98621669.xlsx',
    numberOfStudents: '50000',
    description: 'Example',
    submittedAt: '2025-07-17T09:07:25.339Z',
    status: 'In Progress',
    rejectionReason: null,
  };

  useEffect(() => {
    const fetchRequestDetail = async () => {
      setPageLoading(true); // Set page loading to true at the start of fetch
      setError(null);

      try {
        console.log('Fetching request detail for ID:', requestId);
        const response = await axios.get(`/admin/contact/${requestId}`);
        const data = response.data;

        console.log('API Response:', data);
        setRequestData(data);
        form.setFieldsValue({ status: data.status });
      } catch (err) {
        console.warn('API failed, loading mock data instead:', err);
        setRequestData(mockDetailData);
        form.setFieldsValue({ status: mockDetailData.status });
        message.warning('Loaded fallback mock data - API endpoint may be unavailable');
      } finally {
        setPageLoading(false); // Always set page loading to false
        setLoading(false); // Reset general loading after initial fetch
      }
    };

    if (requestId) {
      fetchRequestDetail();
    }
  }, [requestId, form]);

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'Rejected') {
      setPendingStatus(newStatus);
      setRejectModalVisible(true);
    } else if (
      newStatus === 'Completed' &&
      requestData?.requestType === 'New University' &&
      !confirmedCompleted
    ) {
      setConfirmModalVisible(true);
      form.setFieldsValue({ status: 'Completed' });
    } else {
      form.setFieldsValue({ status: newStatus });
    }
  };

  // Submit form
  const onFinish = async (values: any) => {
    const formValues = form.getFieldsValue();
    const finalStatus = formValues.status || requestData?.status;

    console.log('🟢 Submitting with status:', finalStatus);
    setLoading(true);

    try {
      const payload: any = {
        status: finalStatus,
        rejectionReason: finalStatus === 'Rejected' ? formValues.rejectionReason : null,
      };

      await axios.patch(`/admin/contact/${requestId}/status`, payload);

      message.success('Request updated successfully!');
      setIsEditable(false);
      setConfirmedCompleted(false);
      setRequestData((prev) =>
        prev
          ? { ...prev, status: finalStatus, rejectionReason: formValues.rejectionReason || null }
          : null,
      );
      if (onUpdate) onUpdate();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      message.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle reject confirmation
  const handleRejectConfirm = async (reason: string) => {
    setRejectModalLoading(true); // Set loading for reject modal specifically
    try {
      // Set the form values, but the actual submission happens via onFinish
      form.setFieldsValue({
        status: 'Rejected',
        rejectionReason: reason,
      });
      setRejectModalVisible(false);
      setPendingStatus('');
      await onFinish({ status: 'Rejected', rejectionReason: reason }); // Manually trigger form submission
    } finally {
      setRejectModalLoading(false); // Reset loading for reject modal
    }
  };

  // Handle reject cancel
  const handleRejectCancel = () => {
    setRejectModalVisible(false);
    setPendingStatus('');
    form.setFieldsValue({ status: requestData?.status });
  };
  const handleConfirmModalConfirm = () => {
    setConfirmedCompleted(true);
    setConfirmModalVisible(false);
    const values = form.getFieldsValue();
    onFinish({ ...values, status: 'Completed' });
  };

  const handleConfirmModalCancel = () => {
    setConfirmModalVisible(false);
    form.setFieldsValue({ status: requestData?.status });
  };

  // Reset form
  const handleReset = () => {
    form.setFieldsValue({ status: requestData?.status });
    setIsEditable(false);
    message.info('Changes cancelled');
  };

  const handleDownload = async () => {
    if (requestData?.id) {
      try {
        const response = await axios.get(`/admin/contact/download-excel/${requestData.id}`, {
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'subjects.xlsx');
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        message.error('Failed to download file.');
      }
    }
  };

  if (pageLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
        }}
      >
        <Spin size='large' />
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <Title level={4} style={{ color: '#ff4d4f' }}>
              {error || 'Request not found'}
            </Title>
            <Button
              type='primary'
              onClick={onClose}
              style={{ backgroundColor: '#ff7a00', borderColor: '#ff7a00' }}
            >
              Close
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const availableStatuses = getAvailableStatusTransitions(requestData.status);
  const isStatusChangeable = availableStatuses.length > 0;

  return (
    <div style={{ marginTop: '-20px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      ></div>

      <div className='bg-white rounded-lg shadow-sm p-4'>
        <Form form={form} layout='vertical' onFinish={onFinish}>
          {/* General Information Container */}
          <div
            className='mb-6 p-4 rounded-lg'
            style={{
              border: '1px solid #e8e8e8',
              backgroundColor: 'white',
            }}
          >
            <Title level={4} style={{ color: '#ff7a00', marginBottom: '16px' }}>
              General Information
            </Title>

            <Row gutter={[24, 16]}>
              <Col xs={24} md={8}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <GraduationCap
                    style={{ color: '#ff7a00', marginRight: '8px', fontSize: '16px' }}
                  />
                  <Text strong>University name</Text>
                </div>
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  {requestData.universityName}
                </Text>
              </Col>

              <Col xs={24} md={8}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <Building style={{ color: '#ff7a00', marginRight: '8px', fontSize: '16px' }} />
                  <Text strong>Abbreviation</Text>
                </div>
                <Text style={{ color: '#666', fontSize: '14px' }}>{requestData.abbreviation}</Text>
              </Col>

              <Col xs={24} md={8}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <Flag style={{ color: '#ff7a00', marginRight: '8px', fontSize: '16px' }} />
                  <Text strong>Country</Text>
                </div>
                <Text style={{ color: '#666', fontSize: '14px' }}>{requestData.country}</Text>
              </Col>

              <Col xs={24} md={8}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <MapPin style={{ color: '#ff7a00', marginRight: '8px', fontSize: '16px' }} />
                  <Text strong>Location</Text>
                </div>
                <Text style={{ color: '#666', fontSize: '14px' }}>{requestData.location}</Text>
              </Col>

              <Col xs={24} md={8}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <FileText style={{ color: '#ff7a00', marginRight: '8px', fontSize: '16px' }} />
                  <Text strong>Type</Text>
                </div>
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  {requestData.type.charAt(0).toUpperCase() + requestData.type.slice(1)}
                </Text>
              </Col>

              <Col xs={24} md={8}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <Users style={{ color: '#ff7a00', marginRight: '8px', fontSize: '16px' }} />
                  <Text strong>Number of students</Text>
                </div>
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  {requestData.numberOfStudents || 'Not specified'}
                </Text>
              </Col>
            </Row>
          </div>

          {/* Contact Information Container */}
          <div
            className='mb-6 p-4 rounded-lg'
            style={{
              border: '1px solid #e8e8e8',
              backgroundColor: 'white',
            }}
          >
            <Title level={4} style={{ color: '#ff7a00', marginBottom: '16px' }}>
              Contact Information
            </Title>

            <Row gutter={[24, 16]}>
              <Col xs={24} md={8}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <Mail style={{ color: '#ff7a00', marginRight: '8px', fontSize: '16px' }} />
                  <Text strong>Email</Text>
                </div>
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  {requestData.universityEmail || requestData.representativeEmail}
                </Text>
              </Col>

              <Col xs={24} md={8}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <Phone style={{ color: '#ff7a00', marginRight: '8px', fontSize: '16px' }} />
                  <Text strong>Phone</Text>
                </div>
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  {requestData.universityNumber || requestData.representativeNumber}
                </Text>
              </Col>

              <Col xs={24} md={8}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <Globe style={{ color: '#ff7a00', marginRight: '8px', fontSize: '16px' }} />
                  <Text strong>Website</Text>
                </div>
                <Text style={{ color: '#666', fontSize: '14px' }}>{requestData.website}</Text>
              </Col>
            </Row>
          </div>

          {/* Subjects Container */}
          {requestData.subjectsExcelFilePath && (
            <div
              className='mb-6 p-4 rounded-lg'
              style={{
                border: '1px solid #e8e8e8',
                backgroundColor: 'white',
              }}
            >
              <Title level={4} style={{ color: '#ff7a00', marginBottom: '16px' }}>
                Subjects
              </Title>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  border: '1px solid #e8e8e8',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa',
                }}
              >
                <FileText style={{ color: '#52c41a', marginRight: '12px', fontSize: '16px' }} />
                <div style={{ flex: 1 }}>
                  <Text strong>Example.xls</Text>
                  <br />
                  <Text type='secondary' style={{ fontSize: '12px' }}>
                    Excel file
                  </Text>
                </div>
                <Button
                  type='text'
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                  style={{ color: '#666' }}
                />
              </div>
            </div>
          )}

          {/* Description Container */}
          <div
            className='mb-6 p-4 rounded-lg'
            style={{
              border: '1px solid #e8e8e8',
              backgroundColor: 'white',
            }}
          >
            <Title level={4} style={{ color: '#ff7a00', marginBottom: '16px' }}>
              Description
            </Title>

            <div
              style={{
                padding: '16px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                border: '1px solid #e8e8e8',
              }}
            >
              <Text style={{ color: '#666', fontSize: '14px' }}>
                {requestData.description || requestData.message || ''}
              </Text>
            </div>
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
                {/* Added vertical gutter for small screens */}
                <Col xs={24} md={12}>
                  <div className='flex items-center space-x-3'>
                    <Text strong style={{ fontSize: 14, whiteSpace: 'nowrap' }}>
                      Request Type
                    </Text>
                    <div style={{ flexGrow: 1 }}>
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
                        }}
                        size='middle'
                        onChange={handleStatusChange}
                        suffixIcon={isEditable && isStatusChangeable ? undefined : null}
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
        </Form>
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
              <Button
                onClick={() => form.submit()}
                loading={loading}
                icon={<SaveOutlined />}
                style={{
                  backgroundColor: '#ff7a00',
                  borderColor: '#ff7a00',
                  color: 'white',
                  borderRadius: 6,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7a445')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff7043')}
              >
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <RejectModal
        visible={rejectModalVisible}
        onConfirm={handleRejectConfirm}
        onCancel={handleRejectCancel}
        loading={rejectModalLoading} // Use rejectModalLoading here
      />

      <ConfirmCompleteModal
        visible={confirmModalVisible}
        onConfirm={handleConfirmModalConfirm}
        onCancel={handleConfirmModalCancel}
        loading={loading}
      />
    </div>
  );
};

export default RequestDetailModalContent;
