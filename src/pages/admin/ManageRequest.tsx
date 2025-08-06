// ManageRequest.tsx
import { ExportOutlined, EyeOutlined, CloseCircleFilled, SearchOutlined } from '@ant-design/icons';
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
  Modal,
} from 'antd';
import axios from 'axios';
import React, { useCallback, useEffect, useState, useRef } from 'react';
// Removed: useNavigate as it's no longer used
// import { useNavigate } from 'react-router-dom';

import EditRequestModalContent from './EditRequest';
import ExportRequestModal from './modals/ExportRequestModal';
import RequestDetailModalContent from './RequestDetail';
import AdminHeader from '../../components/AdminHeader';
import LayoutWrapper from '../../components/LayoutWrapper';
import noResults from '@app/assets/images/noimage.png';
import type { ColumnsType } from 'antd/es/table';
import type { AxiosError } from 'axios';

const { Option } = Select;
const { Title } = Typography;

// API Base URL
const API_BASE_URL = 'https://api.uniscout.dev.stunited.vn/api';

// Interface for user request (updated to match API response)
interface UserRequest {
  id: string;
  number?: number;
  requestType: string;
  country: string;
  universityName: string;
  abbreviation?: string;
  status: 'Pending' | 'In Progress' | 'Rejected' | 'Completed';
  submittedBy: string;
  submittedDate: string;
  submittedAt: string;
  description?: string;
  // Additional fields from API response
  representativeName?: string;
  representativeEmail?: string;
  representativeNumber?: string;
  message?: string;
  type?: string;
  universityEmail?: string;
  universityNumber?: string;
  website?: string;
  subjectsExcelFilePath?: string;
  numberOfStudents?: number;
  rejectionReason?: string;
}

// API Response interface
interface ApiResponse {
  data: UserRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Custom hook for debouncing input values - NO LONGER USED FOR SEARCH
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const sortOptions = [
  { label: 'Sort by: Newest first', value: 'DESC' },
  { label: 'Sort by: Oldest first', value: 'ASC' },
];

type FilterKey = 'country' | 'requestType' | 'status' | 'search';

const ManageRequest: React.FC = () => {
  // State for request data
  const [requestData, setRequestData] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);
  // Removed: const navigate = useNavigate(); as it's no longer used

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

  const [currentSearchInput, setCurrentSearchInput] = useState('');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [sortBy] = useState('submittedAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Mobile responsive states
  const [isMobile, setIsMobile] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  // Modal states
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);

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
    let newValues = [...values];

    let allOptions: string[] = [];
    if (field === 'country') allOptions = getUniqueCountries();
    if (field === 'requestType') allOptions = getUniqueRequestTypes();
    if (field === 'status') allOptions = getUniqueStatuses();

    if (newValues.includes('__SELECT_ALL__')) {
      if (newValues.length === 1 || newValues.length < allOptions.length + 1) {
        newValues = allOptions;
      } else {
        newValues = [];
      }
    }

    const finalValues = newValues.filter((value) => value !== '__SELECT_ALL__');

    setFilters((prevFilters) => ({ ...prevFilters, [field]: finalValues }));
    setCurrentPage(1);
  };

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

      if (filters.requestType.length > 0) {
        requestParams.requestType = filters.requestType;
      }
      if (filters.country.length > 0) {
        requestParams.country = filters.country;
      }
      if (filters.status.length > 0) {
        requestParams.status = filters.status;
      }
      if (filters.search.length > 0 && filters.search[0].trim()) {
        requestParams.search = filters.search[0].trim();
      }

      const response = await axios.get<ApiResponse>(`${API_BASE_URL}/admin/contact`, {
        params: requestParams,
        headers: {
          accept: '*/*',
        },
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          Object.keys(params).forEach((key) => {
            const value = params[key];
            if (Array.isArray(value)) {
              value.forEach((item) => searchParams.append(key, item));
            } else if (value !== undefined) {
              searchParams.append(key, value);
            }
          });
          return searchParams.toString();
        },
      });

      if (response.data && response.data.data) {
        const apiData: ApiResponse = response.data;
        setRequestData(apiData.data);
        setTotalCount(apiData.total);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      if (axiosError.response && axiosError.response.status === 400) {
        // This is the specific case where the API returns 400 for no matching results.
        // We'll treat this as a successful response with zero data.
        console.warn('API returned 400, treating as no results found.');
        setRequestData([]);
        setTotalCount(0);
        setError(null);
      } else {
        // Handle all other types of errors as actual failures
        const errorMessage = axiosError.message || 'Failed to fetch requests';
        console.error('API Error:', axiosError);
        setError(errorMessage);
        setRequestData([]);
        setTotalCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Scroll to top when page changes - more robust approach
  useEffect(() => {
    const scrollToTop = () => {
      // Multiple methods for maximum compatibility
      try {
        // Method 1: scrollIntoView with top reference
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Method 2: window.scrollTo to very top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Method 3: document.documentElement.scrollTop
        if (document.documentElement) {
          document.documentElement.scrollTop = 0;
        }

        // Method 4: document.body.scrollTop
        if (document.body) {
          document.body.scrollTop = 0;
        }

        // Method 5: Force scroll to very top
        setTimeout(() => {
          window.scrollTo(0, 0);
          if (document.documentElement) {
            document.documentElement.scrollTop = 0;
          }
          if (document.body) {
            document.body.scrollTop = 0;
          }
        }, 100);
      } catch (error) {
        // Fallback to instant scroll to very top
        window.scrollTo(0, 0);
        if (document.documentElement) {
          document.documentElement.scrollTop = 0;
        }
        if (document.body) {
          document.body.scrollTop = 0;
        }
      }
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(scrollToTop, 50);
    return () => clearTimeout(timer);
  }, [currentPage]);

  const handleSearch = () => {
    setFilters((prevFilters) => ({ ...prevFilters, search: [currentSearchInput] }));
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setCurrentSearchInput('');
    setFilters((prevFilters) => ({ ...prevFilters, search: [] }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      country: [],
      requestType: [],
      status: [],
      search: [],
    });
    setCurrentSearchInput('');
    setCurrentPage(1);
  };

  const removeFilter = (field: FilterKey, valueToRemove?: string) => {
    if (field === 'search') {
      handleClearSearch();
    } else {
      setFilters((prevFilters) => {
        const newValues = prevFilters[field].filter((val) => val !== valueToRemove);
        return { ...prevFilters, [field]: newValues };
      });
      setCurrentPage(1);
    }
  };

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  // Handle opening different modals based on request type
  const handleViewRequest = (record: UserRequest) => {
    setSelectedRequest(record);
    if (record.requestType === 'Update Information') {
      setIsEditModalVisible(true);
    } else if (record.requestType === 'New University') {
      setIsDetailModalVisible(true);
    } else {
      // Default action if neither Update Information nor New University
      setIsDetailModalVisible(true);
    }
  };

  // Handle row click to view request details
  const handleRowClick = (record: UserRequest) => {
    handleViewRequest(record);
  };

  // Handlers to close modals
  const handleDetailModalClose = () => {
    setIsDetailModalVisible(false);
    setSelectedRequest(null);
    fetchRequests(); // Refresh data after closing detail modal (optional)
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setSelectedRequest(null);
    fetchRequests(); // Refresh data after closing edit modal (important for status updates)
  };

  const getUniqueCountries = () => {
    return ['America', 'Vietnam', 'Japan', 'Korea', 'Australia', 'India'];
  };

  const getUniqueRequestTypes = () => contactRequestTypes;
  const getUniqueStatuses = () => contactSubmissionStatuses;

  const handleSortChange = (value: string) => {
    const option = sortOptions.find((opt) => opt.value === value);
    if (option) {
      setSortOrder(value);
      setCurrentPage(1);
    }
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => Array.isArray(value) && value.some((v) => v && v.trim() !== ''),
  );

  const getActiveFilters = () => {
    const activeFilters: Array<{ key: FilterKey; label: string; value: string }> = [];

    filters.country.forEach((country) => {
      activeFilters.push({ key: 'country', label: 'Country', value: country });
    });
    filters.requestType.forEach((type) => {
      activeFilters.push({ key: 'requestType', label: 'Request Type', value: type });
    });
    filters.status.forEach((status) => {
      activeFilters.push({ key: 'status', label: 'Status', value: status });
    });
    if (filters.search.length > 0 && filters.search[0].trim()) {
      activeFilters.push({ key: 'search', label: 'Search', value: filters.search[0].trim() });
    }

    return activeFilters;
  };

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

  const columns: ColumnsType<UserRequest> = [
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
      width: 80,
      render: (_, __, index) => (
        <span style={{ fontWeight: 500 }}>{(currentPage - 1) * pageSize + index + 1}</span>
      ),
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
      render: (text: string, record: UserRequest) => (
        <>
          {text} {record.abbreviation && `(${record.abbreviation})`}
        </>
      ),
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
          icon={<EyeOutlined style={{ fontSize: '18px', color: '#ff7a00' }} />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewRequest(record);
          }}
        />
      ),
    },
  ];

  const FilterSection = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }} wrap>
      <Col xs={24} sm={12} md={6} lg={6}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '7px', color: '#666' }}>
          Country
        </div>
        <Select
          mode='multiple'
          value={filters.country}
          onChange={(values) => handleMultiFilterChange('country', values)}
          style={{ width: '100%' }}
          placeholder='All Countries'
          optionLabelProp='label'
        >
          <Option key='__SELECT_ALL__' value='__SELECT_ALL__' label='Select All'>
            <Checkbox
              checked={
                filters.country.length === getUniqueCountries().length && filters.country.length > 0
              }
            >
              Select All
            </Checkbox>
          </Option>
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
          value={filters.requestType}
          onChange={(values) => handleMultiFilterChange('requestType', values)}
          style={{ width: '100%' }}
          placeholder='All Type'
          loading={loadingRequestTypes}
          optionLabelProp='label'
        >
          <Option key='__SELECT_ALL_TYPES__' value='__SELECT_ALL__' label='Select All'>
            <Checkbox
              checked={
                filters.requestType.length === getUniqueRequestTypes().length &&
                filters.requestType.length > 0
              }
            >
              Select All
            </Checkbox>
          </Option>
          {getUniqueRequestTypes().map((type) => (
            <Option key={type} value={type} label={type}>
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
          value={filters.status}
          onChange={(values) => handleMultiFilterChange('status', values)}
          style={{ width: '100%' }}
          placeholder='All Status'
          loading={loadingSubmissionStatuses}
          optionLabelProp='label'
        >
          <Option key='__SELECT_ALL_STATUSES__' value='__SELECT_ALL__' label='Select All'>
            <Checkbox
              checked={
                filters.status.length === getUniqueStatuses().length && filters.status.length > 0
              }
            >
              Select All
            </Checkbox>
          </Option>
          {getUniqueStatuses().map((status) => (
            <Option key={status} value={status} label={status}>
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

  if (error) {
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
      <AdminHeader />
      <LayoutWrapper>
        <div ref={topRef} style={{ padding: isMobile ? '16px' : '24px' }}>
          <Card>
            <Row
              justify='space-between'
              align='middle'
              gutter={[16, 16]}
              style={{ marginBottom: 24, flexWrap: 'wrap' }}
            >
              <Col xs={24} md={16}>
                <div style={{ width: '100%', maxWidth: 600 }}>
                  <div style={{ display: 'flex', height: 40 }}>
                    <Input
                      placeholder='Search'
                      value={currentSearchInput}
                      onChange={(e) => setCurrentSearchInput(e.target.value)}
                      onPressEnter={handleSearch}
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
                    {currentSearchInput && (
                      <Button
                        type='text'
                        icon={<CloseCircleFilled style={{ fontSize: '12px', color: '#999' }} />}
                        onClick={handleClearSearch}
                        style={{
                          border: '1px solid #d9d9d9',
                          borderLeft: 'none',
                          borderRadius: 0,
                          width: 40,
                          height: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 0,
                          backgroundColor: '#fff',
                        }}
                      />
                    )}
                    <Button
                      type='primary'
                      onClick={handleSearch}
                      style={{
                        backgroundColor: '#ff7a00',
                        border: '1px solid #d9d9d9',
                        borderRadius: currentSearchInput ? '0 8px 8px 0' : '0 8px 8px 0',
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

            {!isMobile && <FilterSection />}

            {hasActiveFilters && (
              <Row style={{ marginBottom: 16 }}>
                <Col span={24}>
                  <Space wrap>
                    {getActiveFilters().map((filter) => (
                      <Tag
                        key={`${filter.key}-${filter.value}`}
                        closable
                        onClose={() => removeFilter(filter.key, filter.value)}
                        closeIcon={<CloseCircleFilled />}
                        style={{
                          background: '#FEF7E6',
                          color: '#FF923E',
                          border: '1px solid #FF923E',
                          fontSize: '14px',
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

            <Row justify='space-between' align='middle' style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Title
                  level={4}
                  style={{ margin: 0, color: '#333', fontSize: isMobile ? '18px' : '20px' }}
                >
                  List of Requests ({totalCount})
                </Title>
              </Col>
            </Row>

            {loading ? (
              <Table
                columns={columns}
                dataSource={[]}
                rowKey='id'
                loading={loading}
                pagination={false}
              />
            ) : requestData.length > 0 ? (
              <Table
                columns={columns}
                dataSource={requestData}
                rowKey='id'
                onRow={(record: UserRequest) => ({
                  onClick: () => handleRowClick(record),
                  style: { cursor: 'pointer' },
                })}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: totalCount,
                  onChange: (page: number) => setCurrentPage(page),
                  showSizeChanger: false,
                  showQuickJumper: false,
                  itemRender: (page: number, type: string, originalElement: React.ReactNode) => {
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
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <img
                  src={noResults}
                  alt='No matching result found'
                  style={{ width: 200, height: 200, marginBottom: 16 }}
                />
                <Title level={4} style={{ color: '#999' }}>
                  No matching result found
                </Title>
              </div>
            )}
          </Card>
        </div>

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

        {/* Request Detail Modal */}
        {selectedRequest && (
          <Modal
            title={
              <div
                style={{ textAlign: 'center', color: '#FE7743', fontWeight: 'bold', fontSize: 28 }}
              >
                Detail of requests
              </div>
            }
            open={isDetailModalVisible}
            onCancel={handleDetailModalClose}
            footer={null}
            width={700}
            destroyOnClose={true}
            centered={false} // <--- Set centered to false
            style={{ top: 20 }} // <--- Position it 20px from the top
          >
            <RequestDetailModalContent
              requestId={selectedRequest.id}
              onClose={handleDetailModalClose}
            />
          </Modal>
        )}

        {/* Edit Request Modal */}
        {selectedRequest && (
          <Modal
            title={
              <div
                style={{ textAlign: 'center', color: '#FE7743', fontWeight: 'bold', fontSize: 28 }}
              >
                Detail of requests
              </div>
            }
            open={isEditModalVisible}
            onCancel={handleEditModalClose}
            footer={null}
            width={700}
            destroyOnClose={true}
            centered={false} // <--- Set centered to false
            style={{ top: 20 }} // <--- Position it 20px from the top
          >
            <EditRequestModalContent
              requestId={selectedRequest.id}
              onClose={handleEditModalClose}
              onUpdate={fetchRequests}
            />
          </Modal>
        )}

        {/* Export Request Modal */}
        <ExportRequestModal
          open={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          appliedFilters={filters}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </LayoutWrapper>
    </div>
  );
};

export default ManageRequest;
