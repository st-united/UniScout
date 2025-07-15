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
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminHeader from '../../components/AdminHeader';
import LayoutWrapper from '../../components/LayoutWrapper';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { Title } = Typography;

// Interface for user request
interface UserRequest {
  id: string;
  number: number;
  requestType: string;
  country: string;
  universityName: string;
  status: 'Pending' | 'In Progress' | 'Rejected' | 'Completed';
  submittedBy: string;
  submittedDate: string;
  description?: string;
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
  { label: 'Sort by: newest first', value: 'new-to-old' },
  { label: 'Sort by: oldest first', value: 'old-to-new' },
];

type FilterKey = 'country' | 'requestType' | 'status' | 'search';

const ManageRequest: React.FC = () => {
  // State for request data
  const [requestData, setRequestData] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [filters, setFilters] = useState<Record<FilterKey, string[]>>({
    country: [],
    requestType: [],
    status: [],
    search: [],
  });

  const debouncedFilters = useDebounce(filters, 400);

  const [sortBy, setSortBy] = useState('Sort by: newest first');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Mobile responsive states
  const [isMobile, setIsMobile] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  // Mock data for demonstration
  const mockRequests: UserRequest[] = [
    {
      id: '1',
      number: 1,
      requestType: 'New University',
      country: 'America',
      universityName: 'Harvard University (HU)',
      status: 'Pending',
      submittedBy: 'john.doe@email.com',
      submittedDate: '2024-01-15',
    },
    {
      id: '2',
      number: 2,
      requestType: 'Update Information',
      country: 'America',
      universityName: 'Harvard University (HU)',
      status: 'Rejected',
      submittedBy: 'jane.smith@email.com',
      submittedDate: '2024-01-14',
    },
    {
      id: '3',
      number: 3,
      requestType: 'New University',
      country: 'America',
      universityName: 'Harvard University (HU)',
      status: 'In Progress',
      submittedBy: 'bob.wilson@email.com',
      submittedDate: '2024-01-13',
    },
    {
      id: '4',
      number: 4,
      requestType: 'New University',
      country: 'America',
      universityName: 'Harvard University (HU)',
      status: 'Completed',
      submittedBy: 'alice.johnson@email.com',
      submittedDate: '2024-01-12',
    },
    {
      id: '5',
      number: 5,
      requestType: 'New University',
      country: 'America',
      universityName: 'Harvard University (HU)',
      status: 'Completed',
      submittedBy: 'charlie.brown@email.com',
      submittedDate: '2024-01-11',
    },
    {
      id: '6',
      number: 6,
      requestType: 'New University',
      country: 'America',
      universityName: 'Harvard University (HU)',
      status: 'Completed',
      submittedBy: 'diana.prince@email.com',
      submittedDate: '2024-01-10',
    },
    {
      id: '7',
      number: 7,
      requestType: 'New University',
      country: 'America',
      universityName: 'Harvard University (HU)',
      status: 'Completed',
      submittedBy: 'edward.stark@email.com',
      submittedDate: '2024-01-09',
    },
    {
      id: '8',
      number: 8,
      requestType: 'New University',
      country: 'America',
      universityName: 'Harvard University (HU)',
      status: 'Completed',
      submittedBy: 'frank.castle@email.com',
      submittedDate: '2024-01-08',
    },
    {
      id: '9',
      number: 9,
      requestType: 'New University',
      country: 'America',
      universityName: 'Harvard University (HU)',
      status: 'Completed',
      submittedBy: 'grace.hopper@email.com',
      submittedDate: '2024-01-07',
    },
    {
      id: '10',
      number: 10,
      requestType: 'New University',
      country: 'America',
      universityName: 'Harvard University (HU)',
      status: 'Completed',
      submittedBy: 'henry.ford@email.com',
      submittedDate: '2024-01-06',
    },
  ];

  // Check screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleMultiFilterChange = (field: FilterKey, values: string[]) => {
    setFilters({ ...filters, [field]: values });
    setCurrentPage(1);
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 500));
      setRequestData(mockRequests);
    } catch (err) {
      const errorMessage = 'Failed to fetch requests';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

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
      // Simulate export functionality
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

  // Get unique values for filter options
  const getUniqueCountries = () => {
    return ['America', 'Vietnam', 'Japan', 'Korea', 'Australia', 'India'];
  };

  const getUniqueRequestTypes = () => {
    return ['New University', 'Update Information', 'Remove University'];
  };

  const getUniqueStatuses = () => {
    return ['Pending', 'In Progress', 'Rejected', 'Completed'];
  };

  // Enhanced filter function
  const filteredRequests = requestData.filter((request) => {
    const searchValue = filters.search[0] || '';

    const searchMatch =
      !searchValue ||
      request.universityName.toLowerCase().includes(searchValue.toLowerCase()) ||
      request.country.toLowerCase().includes(searchValue.toLowerCase()) ||
      request.requestType.toLowerCase().includes(searchValue.toLowerCase());

    return (
      searchMatch &&
      (filters.country.length === 0 || filters.country.includes(request.country)) &&
      (filters.requestType.length === 0 || filters.requestType.includes(request.requestType)) &&
      (filters.status.length === 0 || filters.status.includes(request.status))
    );
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    switch (sortBy) {
      case 'new-to-old':
        return a.number - b.number;
      case 'old-to-new':
        return b.number - a.number;
      default:
        return 0;
    }
  });

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

  // Pagination for current page data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = sortedRequests.slice(startIndex, endIndex);
  const totalCount = sortedRequests.length;

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
        <Select value={sortBy} onChange={setSortBy} style={{ width: '100%', marginTop: '8px' }}>
          {sortOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </Col>
    </Row>
  );

  // Error state
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
              dataSource={currentPageData}
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
