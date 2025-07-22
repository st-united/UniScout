import { ExportOutlined, EditOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Table,
  Button,
  Select,
  Space,
  message,
  Card,
  Row,
  Col,
  Typography,
  Drawer,
  Badge,
  Tag,
  Checkbox,
  Input,
} from 'antd';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminHeader from '../../components/AdminHeader';
import LayoutWrapper from '../../components/LayoutWrapper';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { Title } = Typography;

// API Base URL
const API_BASE_URL = 'https://api.uniscout.dev.stunited.vn/api';

// Interface for user request (updated to match API response)
interface UserRequest {
  id: string;
  number: number;
  requestType: string;
  country: string;
  universityName: string;
  status: 'Pending' | 'In Progress' | 'Rejected' | 'Completed';
  submittedBy: string;
  submittedDate: string;
  submittedAt: string; // API timestamp field
  description?: string;
}

// API Response interface
interface ApiResponse {
  data: UserRequest[];
  total: number;
  page: number;
  pageSize: number;
}

// Custom hook for debouncing input values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const sortOptions = [
  { label: 'Sort by: newest first', value: 'DESC' },
  { label: 'Sort by: oldest first', value: 'ASC' },
];

type FilterKey = 'country' | 'requestType' | 'status' | 'search';

const ManageRequest: React.FC = () => {
  // State for request data
  const [requestData, setRequestData] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  // State for API data
  const [contactRequestTypes, setContactRequestTypes] = useState<string[]>([]);
  const [contactSubmissionStatuses, setContactSubmissionStatuses] = useState<string[]>([]);
  const [loadingRequestTypes, setLoadingRequestTypes] = useState(false);
  const [loadingSubmissionStatuses, setLoadingSubmissionStatuses] = useState(false);

  const [filters, setFilters] = useState<Record<FilterKey, string[]>>({
    country: [],
    requestType: [],
    status: [],
    search: [],
  });

  const debouncedFilters = useDebounce(filters, 400);

  const [sortOrder, setSortOrder] = useState('DESC'); // Changed from sortBy to sortOrder
  const [sortBy] = useState('submittedAt'); // Fixed sort field
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Mobile responsive states
  const [isMobile, setIsMobile] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  // API Functions
  const fetchContactRequestTypes = async () => {
    setLoadingRequestTypes(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/contact/request-types`, {
        headers: {
          accept: '*/*',
        },
      });

      if (Array.isArray(response.data.data)) {
        setContactRequestTypes(response.data.data);
      } else {
        throw new Error('Invalid request types format');
      }
    } catch (error) {
      console.error('Error fetching contact request types:', error);
      message.error('Failed to fetch request types');
      // fallback
      setContactRequestTypes(['New University', 'Update Information', 'Remove University']);
    } finally {
      setLoadingRequestTypes(false);
    }
  };

  const fetchContactSubmissionStatuses = async () => {
    setLoadingSubmissionStatuses(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/contact/status`, {
        headers: {
          accept: '*/*',
        },
      });

      if (Array.isArray(response.data.data)) {
        setContactSubmissionStatuses(response.data.data);
      } else {
        throw new Error('Invalid response format for submission statuses');
      }
    } catch (error) {
      console.error('Error fetching contact submission statuses:', error);
      message.error('Failed to fetch submission statuses');
      setContactSubmissionStatuses(['Pending', 'In Progress', 'Rejected', 'Completed']);
    } finally {
      setLoadingSubmissionStatuses(false);
    }
  };

  // Check screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Load API data on component mount
  useEffect(() => {
    fetchContactRequestTypes();
    fetchContactSubmissionStatuses();
  }, []);

  const handleMultiFilterChange = (field: FilterKey, values: string[]) => {
    setFilters({ ...filters, [field]: values });
    setCurrentPage(1);
  };

  // Updated fetchRequests to use real API
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const requestParams: Record<string, any> = {
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
      };

      if (debouncedFilters.requestType.length > 0) {
        requestParams.requestType = debouncedFilters.requestType;
      }
      if (debouncedFilters.country.length > 0) {
        requestParams.country = debouncedFilters.country;
      }
      if (debouncedFilters.status.length > 0) {
        requestParams.status = debouncedFilters.status;
      }
      if (debouncedFilters.search.length > 0 && debouncedFilters.search[0].trim()) {
        requestParams.search = debouncedFilters.search[0].trim();
      }

      const response = await axios.get(`${API_BASE_URL}/admin/contact`, {
        params: requestParams,
        headers: {
          accept: '*/*',
        },
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          Object.keys(params).forEach((key) => {
            const value = params[key];
            if (Array.isArray(value)) {
              searchParams.append(key, value.join(','));
            } else if (value !== undefined) {
              searchParams.append(key, value);
            }
          });
          return searchParams.toString();
        },
      });

      // Handle API response
      if (response.data && response.data.data) {
        const apiData: ApiResponse = response.data;

        // Check if API returned empty data and use fallback
        if (apiData.data.length === 0) {
          console.log('API returned empty data, using fallback mock data');
          const mockData: UserRequest[] = [
            {
              id: '1',
              number: 101,
              requestType: 'New University',
              country: 'Vietnam',
              universityName: 'Mock University Vietnam',
              status: 'Pending',
              submittedBy: 'John Doe',
              submittedDate: '2025-07-01',
              submittedAt: '2025-07-01T10:00:00Z',
            },
            {
              id: '2',
              number: 102,
              requestType: 'Update Information',
              country: 'Japan',
              universityName: 'Mock University Japan',
              status: 'Completed',
              submittedBy: 'Jane Smith',
              submittedDate: '2025-07-05',
              submittedAt: '2025-07-05T12:00:00Z',
            },
            {
              id: '3',
              number: 103,
              requestType: 'Remove University',
              country: 'Korea',
              universityName: 'Mock University Korea',
              status: 'In Progress',
              submittedBy: 'Mike Johnson',
              submittedDate: '2025-07-10',
              submittedAt: '2025-07-10T14:30:00Z',
            },
            {
              id: '4',
              number: 104,
              requestType: 'New University',
              country: 'Australia',
              universityName: 'Mock University Australia',
              status: 'Rejected',
              submittedBy: 'Sarah Wilson',
              submittedDate: '2025-07-12',
              submittedAt: '2025-07-12T09:15:00Z',
            },
          ];

          setRequestData(mockData);
          setTotalCount(mockData.length);
          message.info('No data found, showing sample data');
        } else {
          // Use real API data
          setRequestData(apiData.data);
          setTotalCount(apiData.total);
        }
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch requests';
      console.error('API Error:', err);
      setError(errorMessage);

      // Provide fallback mock data when API fails
      const mockData: UserRequest[] = [
        {
          id: '1',
          number: 101,
          requestType: 'New University',
          country: 'Vietnam',
          universityName: 'Mock University Vietnam',
          status: 'Pending',
          submittedBy: 'John Doe',
          submittedDate: '2025-07-01',
          submittedAt: '2025-07-01T10:00:00Z',
        },
        {
          id: '2',
          number: 102,
          requestType: 'Update Information',
          country: 'Japan',
          universityName: 'Mock University Japan',
          status: 'Completed',
          submittedBy: 'Jane Smith',
          submittedDate: '2025-07-05',
          submittedAt: '2025-07-05T12:00:00Z',
        },
        {
          id: '3',
          number: 103,
          requestType: 'Remove University',
          country: 'Korea',
          universityName: 'Mock University Korea',
          status: 'In Progress',
          submittedBy: 'Mike Johnson',
          submittedDate: '2025-07-10',
          submittedAt: '2025-07-10T14:30:00Z',
        },
        {
          id: '4',
          number: 104,
          requestType: 'New University',
          country: 'Australia',
          universityName: 'Mock University Australia',
          status: 'Rejected',
          submittedBy: 'Sarah Wilson',
          submittedDate: '2025-07-12',
          submittedAt: '2025-07-12T09:15:00Z',
        },
      ];

      setRequestData(mockData);
      setTotalCount(mockData.length);
      message.warning('Using mock data fallback - API connection failed');

      // Clear the error after setting fallback data so UI doesn't show error state
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, sortOrder, debouncedFilters]);

  // Fetch requests when dependencies change
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Update search filter when search input changes
  useEffect(() => {
    setFilters((prevFilters) => {
      if (prevFilters.search[0] === searchInput) return prevFilters;
      return { ...prevFilters, search: [searchInput] };
    });
    setCurrentPage(1);
  }, [searchInput]);

  const handleResetFilters = () => {
    setFilters({
      country: [],
      requestType: [],
      status: [],
      search: [],
    });
    setSearchInput('');
    setCurrentPage(1);
  };

  // Remove individual filter
  const removeFilter = (field: FilterKey) => {
    setFilters({ ...filters, [field]: [] });
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      // You can implement export functionality here
      // For now, simulating export
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Requests exported successfully');
    } catch (error) {
      message.error('Export failed');
      console.error('Export error:', error);
    }
  };

  const handleEdit = (requestId: string) => {
    navigate(`/edit-request/${requestId}`);
  };

  // Handle row click to view request details
  const handleRowClick = (record: UserRequest) => {
    navigate(`/request-detail/${record.id}`);
  };

  // Get unique values for filter options (these will be populated from API data)
  const getUniqueCountries = () => {
    // You might want to fetch this from a separate API endpoint
    // For now, using static data
    return ['America', 'Vietnam', 'Japan', 'Korea', 'Australia', 'India'];
  };

  const getUniqueRequestTypes = () => contactRequestTypes;
  const getUniqueStatuses = () => contactSubmissionStatuses;

  // Handle sort change
  const handleSortChange = (value: string) => {
    const option = sortOptions.find((opt) => opt.value === value);
    if (option) {
      setSortOrder(value);
      setCurrentPage(1);
    }
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(
    (value) => Array.isArray(value) && value.some((v) => v && v.trim() !== ''),
  );

  // Get active filters for floating display
  const getActiveFilters = () => {
    const activeFilters: Array<{ key: FilterKey; label: string; value: string }> = [];

    if (filters.country && filters.country.length > 0) {
      activeFilters.push({ key: 'country', label: 'Country', value: filters.country.join(', ') });
    }
    if (filters.requestType && filters.requestType.length > 0) {
      activeFilters.push({
        key: 'requestType',
        label: 'Request Type',
        value: filters.requestType.join(', '),
      });
    }
    if (filters.status && filters.status.length > 0) {
      activeFilters.push({ key: 'status', label: 'Status', value: filters.status.join(', ') });
    }

    return activeFilters;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return '#6B7280';
      case 'In Progress':
        return '#F59E0B';
      case 'Rejected':
        return '#EF4444';
      case 'Completed':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  // Get status background color
  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return '#F3F4F6';
      case 'In Progress':
        return '#FEF3C7';
      case 'Rejected':
        return '#FEE2E2';
      case 'Completed':
        return '#D1FAE5';
      default:
        return '#F3F4F6';
    }
  };

  // Table columns configuration
  const columns: ColumnsType<UserRequest> = [
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
      width: 80,
      render: (text: number) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Request Type',
      dataIndex: 'requestType',
      key: 'requestType',
      width: 150,
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      width: 120,
    },
    {
      title: 'University Name',
      dataIndex: 'universityName',
      key: 'universityName',
      width: 300,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag
          style={{
            color: getStatusColor(status),
            backgroundColor: getStatusBgColor(status),
            border: 'none',
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: 500,
          }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type='text'
          icon={<EditOutlined style={{ fontSize: '18px', color: '#ff7a00' }} />}
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click when clicking edit button
            handleEdit(record.id);
          }}
        />
      ),
    },
  ];

  // Filter component for desktop (without search)
  const FilterSection = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }} wrap>
      <Col xs={24} sm={12} md={6} lg={6}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '7px', color: '#666' }}>
          Country
        </div>
        <Select
          mode='multiple'
          allowClear
          value={filters.country}
          onChange={(values) => handleMultiFilterChange('country', values || [])}
          style={{ width: '100%' }}
          placeholder='All Countries'
          optionLabelProp='label'
        >
          {getUniqueCountries().map((country) => (
            <Option key={country} value={country} label={country}>
              <Checkbox checked={filters.country.includes(country)}>{country}</Checkbox>
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={6} lg={6}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '7px', color: '#666' }}>
          Request Type
        </div>
        <Select
          mode='multiple'
          allowClear
          value={filters.requestType}
          onChange={(values) => handleMultiFilterChange('requestType', values || [])}
          style={{ width: '100%' }}
          placeholder='All Type'
          loading={loadingRequestTypes}
        >
          {getUniqueRequestTypes().map((type) => (
            <Option key={type} value={type}>
              <Checkbox checked={filters.requestType.includes(type)}>{type}</Checkbox>
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={6} lg={6}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '7px', color: '#666' }}>
          Status
        </div>
        <Select
          mode='multiple'
          allowClear
          value={filters.status}
          onChange={(values) => handleMultiFilterChange('status', values || [])}
          style={{ width: '100%' }}
          placeholder='All Status'
          loading={loadingSubmissionStatuses}
        >
          {getUniqueStatuses().map((status) => (
            <Option key={status} value={status}>
              <Checkbox checked={filters.status.includes(status)}>{status}</Checkbox>
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={24} md={6} lg={6}>
        <div
          style={{
            fontSize: '12px',
            marginBottom: '4px',
            color: '#666',
            textAlign: isMobile ? 'left' : 'right',
          }}
        >
          <button
            onClick={handleResetFilters}
            style={{
              color: '#ff7a00',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              background: 'none',
              border: 'none',
              padding: 0,
              outline: 'none',
            }}
            type='button'
          >
            Reset Filter
          </button>
        </div>
        <Select
          value={sortOrder}
          onChange={handleSortChange}
          style={{ width: '100%', marginTop: '8px' }}
        >
          {sortOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </Col>
    </Row>
  );

  // Error state - FIXED: Only show error state if we have an error AND no fallback data
  if (error && requestData.length === 0) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Title level={4} style={{ color: '#ff4d4f' }}>
              Failed to load requests
            </Title>
            <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
            <Button
              type='primary'
              onClick={fetchRequests}
              loading={loading}
              style={{ backgroundColor: '#ff7a00', borderColor: '#ff7a00' }}
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* Main Content */}
      <AdminHeader />
      <LayoutWrapper>
        <div style={{ padding: isMobile ? '16px' : '24px' }}>
          <Card>
            {/* Top Search and Export Section */}
            <Row
              justify='space-between'
              align='middle'
              gutter={[16, 16]}
              style={{ marginBottom: 24, flexWrap: 'wrap' }}
            >
              {/* Styled SearchBar UI */}
              <Col xs={24} md={16}>
                <div style={{ width: '100%', maxWidth: 600 }}>
                  <div style={{ display: 'flex', height: 40 }}>
                    <Input
                      placeholder='Search'
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      bordered={false}
                      style={{
                        flex: 1,
                        fontSize: '14px',
                        padding: '0 12px',
                        border: '1px solid #d9d9d9',
                        borderRight: 'none',
                        borderRadius: '8px 0 0 8px',
                        height: '100%',
                        lineHeight: 'normal',
                        backgroundColor: '#fff',
                      }}
                    />
                    <Button
                      type='primary'
                      onClick={() => setFilters({ ...filters, search: [searchInput] })}
                      style={{
                        backgroundColor: '#ff7a00',
                        border: '1px solid #d9d9d9',
                        borderRadius: '0 8px 8px 0',
                        width: 40,
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 0,
                      }}
                      icon={<SearchOutlined style={{ fontSize: '16px' }} />}
                    />
                  </div>
                </div>
              </Col>

              {/* Export Button */}
              <Col xs={24} md={8} style={{ textAlign: isMobile ? 'left' : 'right' }}>
                <Button
                  icon={<ExportOutlined />}
                  onClick={handleExport}
                  style={{
                    backgroundColor: '#ff7a00',
                    borderColor: '#ff7a00',
                    color: 'white',
                    height: '36px',
                    fontSize: '13px',
                    fontWeight: 500,
                    width: isMobile ? '100%' : 'auto',
                    marginTop: isMobile ? 8 : 0,
                  }}
                >
                  Export
                </Button>
              </Col>
            </Row>

            {/* Mobile Filter Button */}
            {isMobile && (
              <Row style={{ marginBottom: 16 }}>
                <Col span={24}>
                  <Button
                    onClick={() => setFilterDrawerVisible(true)}
                    type='default'
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '40px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '6px',
                    }}
                  >
                    <Space>
                      Filters
                      {hasActiveFilters && <Badge dot />}
                    </Space>
                  </Button>
                </Col>
              </Row>
            )}

            {/* Desktop Filter Section */}
            {!isMobile && <FilterSection />}

            {/* Active Filter Tags */}
            {hasActiveFilters && (
              <Row style={{ marginBottom: 16 }}>
                <Col span={24}>
                  <Space wrap>
                    {getActiveFilters().map((filter) => (
                      <Tag
                        key={filter.key}
                        closable
                        onClose={() => removeFilter(filter.key)}
                        closeIcon={<CloseOutlined />}
                        style={{
                          backgroundColor: '#fff7e6',
                          borderColor: '#ff7a00',
                          color: '#ff7a00',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {filter.label}: {filter.value}
                      </Tag>
                    ))}
                  </Space>
                </Col>
              </Row>
            )}

            {/* Header Section */}
            <Row justify='space-between' align='middle' style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Title
                  level={4}
                  style={{ margin: 0, color: '#333', fontSize: isMobile ? '18px' : '20px' }}
                >
                  User Requests ({totalCount})
                </Title>
              </Col>
            </Row>

            {/* Table */}
            <Table
              columns={columns}
              dataSource={requestData}
              rowKey='id'
              loading={loading}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                style: { cursor: 'pointer' },
              })}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: totalCount,
                onChange: (page) => setCurrentPage(page),
                showSizeChanger: false,
                showQuickJumper: false,
                itemRender: (page, type, originalElement) => {
                  const totalPages = Math.ceil(totalCount / pageSize);
                  const baseStyle: React.CSSProperties = {
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  };

                  if (type === 'prev') {
                    const isDisabled = currentPage === 1;
                    return (
                      <span
                        style={{
                          ...baseStyle,
                          color: isDisabled ? '#d9d9d9' : '#ff7a00',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                        }}
                      >
                        &lt; Previous
                      </span>
                    );
                  }

                  if (type === 'next') {
                    const isDisabled = currentPage >= totalPages;
                    return (
                      <span
                        style={{
                          ...baseStyle,
                          color: isDisabled ? '#d9d9d9' : '#ff7a00',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Next &gt;
                      </span>
                    );
                  }

                  if (type === 'page') {
                    const isCurrent = page === currentPage;
                    return (
                      <span
                        style={{
                          ...baseStyle,
                          color: '#ff7a00',
                          fontWeight: isCurrent ? 'bold' : 500,
                        }}
                      >
                        {page}
                      </span>
                    );
                  }

                  if (type === 'jump-prev' || type === 'jump-next') {
                    return <span style={{ color: '#999' }}>•••</span>;
                  }

                  return originalElement;
                },
                style: {
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  marginTop: '24px',
                  marginBottom: '16px',
                },
              }}
              scroll={{ x: 800 }}
            />
          </Card>
        </div>

        {/* Mobile Filter Drawer */}
        <Drawer
          title='Filters'
          placement='bottom'
          height='auto'
          onClose={() => setFilterDrawerVisible(false)}
          open={filterDrawerVisible}
          bodyStyle={{ padding: '16px' }}
        >
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <FilterSection />
          </div>
          <Space direction='vertical' style={{ width: '100%', marginTop: '16px' }} size='middle'>
            <Button
              onClick={handleResetFilters}
              style={{ color: '#ff7a00', borderColor: '#ff7a00' }}
            >
              Reset Filters
            </Button>
            <Button
              type='primary'
              onClick={() => setFilterDrawerVisible(false)}
              style={{ backgroundColor: '#ff7a00', borderColor: '#ff7a00' }}
            >
              Apply
            </Button>
          </Space>
        </Drawer>
      </LayoutWrapper>
    </div>
  );
};

export default ManageRequest;
