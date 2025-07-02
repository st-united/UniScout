import {
  PlusOutlined,
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
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
  Modal,
  Drawer,
  Badge,
  Tag,
} from 'antd';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminSearchFilter from '../../components/AdminSearchFilter';
import type { ColumnsType } from 'antd/es/table';
const { Option } = Select;
const { Title } = Typography;

// Updated interface to match API response
interface University {
  id: string;
  university: string;
  latitude: number;
  longitude: number;
  logo: string;
  rank: number;
  type: string;
  country: string;
  location: string;
  studentPopulation: number;
  year: number;
  contact: string;
  email: string;
  website: string;
  strength: string;
  description: string;
  exchange: string | null;
  academicFields: string[];
  size: string;
}

// API Response interface
interface UniversityApiResponse {
  message: string;
  data: University[];
  totalCount: number;
}

// Interface for notification items (imported from AdminSearchFilter)
interface NotificationItem {
  id: number;
  type: 'join_request';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
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
  { label: 'High to Low Rank', value: 'rank-desc' },
  { label: 'Low to High Rank', value: 'rank-asc' },
  { label: 'A-Z Name', value: 'name-asc' },
  { label: 'Z-A Name', value: 'name-desc' },
];
type FilterKey = 'country' | 'region' | 'type' | 'size' | 'department' | 'search';
const UniversityListPage: React.FC = () => {
  const navigate = useNavigate();

  // State for university data
  const [universityData, setUniversityData] = useState<UniversityApiResponse>();
  const [currentUniversityData, setCurrentUniversityData] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    country: '',
    region: '',
    type: '',
    size: '',
    department: '',
    search: '',
  });
  const debouncedFilters = useDebounce(filters, 400);

  const [sortBy, setSortBy] = useState('name-asc');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const fetchUniversities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<UniversityApiResponse>('/universities/admin', {
        params: {
          search: filters.search || undefined,
          type: filters.type || undefined,
          country: filters.country || undefined,
          size: filters.size || undefined,
          fieldNames:
            filters.department && filters.department !== 'all' ? [filters.department] : undefined,

          sortOrder: sortBy.includes('desc') ? 'DESC' : 'ASC',
          page: currentPage,
          limit: pageSize,
        },
      });
      setCurrentUniversityData(response.data.data);
      setUniversityData(response.data);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message || 'Failed to fetch universities'
        : 'An unexpected error occurred';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, currentPage, pageSize]);

  useEffect(() => {
    fetchUniversities();
  }, [
    debouncedFilters,
    sortBy,
    currentPage,
    pageSize,
    filters.search,
    filters.type,
    filters.country,
    filters.size,
    filters.department,
    fetchUniversities,
  ]);

  // Multi-select state
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Delete confirmation modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteType, setDeleteType] = useState<'single' | 'multiple'>('single');
  const [universityToDelete, setUniversityToDelete] = useState<University | null>(null);

  // Mobile responsive states
  const [isMobile, setIsMobile] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  // API function to fetch universities

  // Check screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Fetch universities on component mount
  useEffect(() => {
    fetchUniversities();
  }, [currentPage, pageSize, fetchUniversities]);

  useEffect(() => {
    setFilters((prevFilters) => {
      if (prevFilters.search === searchInput) return prevFilters;
      return { ...prevFilters, search: searchInput };
    });
    setCurrentPage(1);
  }, [searchInput]);

  // Handle search from AdminSearchFilter component
  const handleGlobalSearch = (searchValue: string) => {
    setSearchInput(searchValue);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    // Navigate to join request management page or show details
    console.log('Notification clicked:', notification);
    message.info(`Viewing join request: ${notification.description}`);
    // Example: navigate('/admin/join-requests/' + notification.id);
  };

  // Handle mark all notifications as read
  const handleMarkAllAsRead = () => {
    message.success('All notifications marked as read');
  };

  const handleResetFilters = () => {
    setFilters({
      country: '',
      region: '',
      type: '',
      size: '',
      department: '',
      search: '',
    });
    setSearchInput('');
    setCurrentPage(1);
    setSelectedRowKeys([]);
    // Note: sortBy is NOT reset here, so it maintains the current sort option
  };

  const handleFilterChange = (field: FilterKey, value: string) => {
    setFilters({ ...filters, [field]: value });
    setCurrentPage(1);
  };

  // Remove individual filter
  const removeFilter = (field: FilterKey) => {
    setFilters({ ...filters, [field]: '' });
    setCurrentPage(1);
  };

  // Show delete confirmation modal
  const showDeleteModal = (type: 'single' | 'multiple', university?: University) => {
    setDeleteType(type);
    setUniversityToDelete(university || null);
    setDeleteModalVisible(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      if (deleteType === 'single' && universityToDelete) {
        console.log('Deleting university ID:', universityToDelete.id);

        await axios.delete(`/universities/${universityToDelete.id}`, {
          data: { confirm_deletion: true },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        setCurrentUniversityData((prev) => prev.filter((uni) => uni.id !== universityToDelete.id));
        message.success('University deleted successfully');
        console.log(
          `AUDIT: Deleted university ${universityToDelete.university} (ID: ${universityToDelete.id})`,
        );
      } else if (deleteType === 'multiple' && selectedRowKeys.length > 0) {
        console.log('Deleting multiple universities:', selectedRowKeys);

        await axios.delete('/universities/admin/bulk', {
          data: {
            ids: selectedRowKeys,
            confirm_deletion: true,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const universitiesToDelete = currentUniversityData.filter((uni) =>
          selectedRowKeys.includes(uni.id),
        );

        setCurrentUniversityData((prev) => prev.filter((uni) => !selectedRowKeys.includes(uni.id)));
        setSelectedRowKeys([]);
        message.success(`${selectedRowKeys.length} universities deleted successfully`);
        console.log(
          `AUDIT: Deleted ${universitiesToDelete.length} universities:`,
          universitiesToDelete.map((u) => u.university),
        );
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Delete failed'
        : 'Delete failed';
      message.error(errorMessage);
      console.error('Delete error:', error);
    } finally {
      setDeleteModalVisible(false);
      setUniversityToDelete(null);
    }
  };

  const handleEdit = (universityId: string) => {
    navigate(`/admin/edit-university/${universityId}`);
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/universities/admin/export', {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'universities.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('Universities exported successfully');
    } catch (error) {
      message.error('Export failed');
      console.error('Export error:', error);
    }
  };

  // Enhanced filter function to include university name, location, and strength search
  const filteredUniversities = currentUniversityData.filter((u) => {
    const searchMatch =
      !filters.search ||
      u.university.toLowerCase().includes(filters.search.toLowerCase()) ||
      u.location.toLowerCase().includes(filters.search.toLowerCase()) ||
      u.country.toLowerCase().includes(filters.search.toLowerCase()) ||
      u.strength.toLowerCase().includes(filters.search.toLowerCase());

    return (
      searchMatch &&
      (!filters.country || u.country === filters.country) &&
      (!filters.type || u.type === filters.type) &&
      (!filters.size || u.size === filters.size) &&
      (!filters.department || u.strength.includes(filters.department))
    );
  });

  const sortedUniversities = [...filteredUniversities].sort((a, b) => {
    switch (sortBy) {
      case 'rank-asc':
        return b.rank - a.rank;
      case 'rank-desc':
        return a.rank - b.rank;
      case 'name-asc':
        return a.university.localeCompare(b.university);
      case 'name-desc':
        return b.university.localeCompare(a.university);
      default:
        return 0;
    }
  });

  // Get unique values for filter options
  const getUniqueCountries = () => {
    return [...new Set(currentUniversityData.map((u) => u.country))].filter(Boolean).sort();
  };

  const getUniqueTypes = () => {
    return [...new Set(currentUniversityData.map((u) => u.type))].filter(Boolean).sort();
  };

  const getUniqueSizes = () => {
    return [...new Set(currentUniversityData.map((u) => u.size))].filter(Boolean).sort();
  };

  const getUniqueDepartments = () => {
    const allDepartments = currentUniversityData.flatMap((u) =>
      (u.strength || '').split(',').map((dept) => dept.trim()),
    );
    return [...new Set(allDepartments)].filter(Boolean).sort();
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  // Get active filters for floating display
  const getActiveFilters = () => {
    const activeFilters: Array<{ key: FilterKey; label: string; value: string }> = [];

    if (filters.country) {
      activeFilters.push({ key: 'country', label: 'Country', value: filters.country });
    }
    if (filters.type) {
      activeFilters.push({ key: 'type', label: 'Type', value: filters.type });
    }
    if (filters.size) {
      activeFilters.push({ key: 'size', label: 'Size', value: filters.size });
    }
    if (filters.department) {
      activeFilters.push({ key: 'department', label: 'Field', value: filters.department });
    }

    return activeFilters;
  };

  // Table columns configuration
  const columns: ColumnsType<University> = [
    {
      title: 'University Name',
      dataIndex: 'university',
      key: 'university',
      width: 400,
      sorter: true,
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      sorter: true,
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      width: 120,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'public' ? 'blue' : 'green'}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size: string) => (
        <Tag
          color={
            size === 'small'
              ? 'orange'
              : size === 'medium'
              ? 'yellow'
              : size === 'large'
              ? 'blue'
              : 'purple'
          }
        >
          {size.charAt(0).toUpperCase() + size.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Broad field',
      dataIndex: 'academicFields',
      key: 'academicFields',
      width: 200,
      render: (academicFields: string) => (
        <div
          style={{
            maxWidth: '180px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {academicFields}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type='text'
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
            style={{ color: '#ff7a00' }}
          />
          <Button
            type='text'
            icon={<DeleteOutlined />}
            onClick={() => showDeleteModal('single', record)}
            style={{ color: '#ff7a00' }}
          />
        </Space>
      ),
    },
  ];

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    onSelectAll: (selected: boolean, selectedRows: University[], changeRows: University[]) => {
      console.log(selected, selectedRows, changeRows);
    },
  };

  // Get confirmation message
  const getConfirmationMessage = () => {
    if (deleteType === 'single' && universityToDelete) {
      return `Are you sure delete ${universityToDelete.university}?`;
    } else if (deleteType === 'multiple') {
      return 'Are you sure delete all selected fields?';
    }
    return '';
  };

  // Filter component for desktop with adjusted widths
  const FilterSection = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6} lg={4}>
        <div style={{ fontSize: '12px', marginBottom: '7px', color: '#666' }}>Country</div>
        <Select
          value={filters.country || 'all'}
          onChange={(value) => handleFilterChange('country', value === 'all' ? '' : value)}
          style={{ width: '100%' }}
        >
          <Option value='all'>All Countries</Option>
          {getUniqueCountries().map((country) => (
            <Option key={country} value={country}>
              {country}
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={6} lg={4}>
        <div style={{ fontSize: '12px', marginBottom: '7px', color: '#666' }}>Type</div>
        <Select
          value={filters.type || 'all'}
          onChange={(value) => handleFilterChange('type', value === 'all' ? '' : value)}
          style={{ width: '100%' }}
        >
          <Option value='all'>All Types</Option>
          {getUniqueTypes().map((type) => (
            <Option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={6} lg={4}>
        <div style={{ fontSize: '12px', marginBottom: '7px', color: '#666' }}>Size</div>
        <Select
          value={filters.size || 'all'}
          onChange={(value) => handleFilterChange('size', value === 'all' ? '' : value)}
          style={{ width: '100%' }}
        >
          <Option value='all'>All Sizes</Option>
          {getUniqueSizes().map((size) => (
            <Option key={size} value={size}>
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={8} lg={6}>
        <div style={{ fontSize: '12px', marginBottom: '7px', color: '#666' }}>Fields</div>
        <Select
          value={filters.department || 'all'}
          onChange={(value) => handleFilterChange('department', value === 'all' ? '' : value)}
          style={{ width: '100%' }}
        >
          <Option value='all'>All Fields</Option>
          {getUniqueDepartments().map((dept) => (
            <Option key={dept} value={dept}>
              {dept}
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
            tabIndex={0}
          >
            Reset Filter
          </button>
        </div>
        <Select value={sortBy} onChange={setSortBy} style={{ width: '100%' }}>
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
  if (error && currentUniversityData.length === 0) {
    return (
      <div style={{ backgroundColor: '#FFFDF9', minHeight: '100vh' }}>
        <AdminSearchFilter
          onSearch={handleGlobalSearch}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={handleMarkAllAsRead}
          placeholder='Search by university name, location, or field...'
        />
        <div style={{ padding: isMobile ? '16px' : '24px' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Title level={4} style={{ color: '#ff4d4f' }}>
                Failed to load universities
              </Title>
              <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
              <Button
                type='primary'
                onClick={fetchUniversities}
                loading={loading}
                style={{ backgroundColor: '#ff7a00', borderColor: '#ff7a00' }}
              >
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* Search and Notification Bar */}
      <AdminSearchFilter
        onSearch={handleGlobalSearch}
        onNotificationClick={handleNotificationClick}
        onMarkAllAsRead={handleMarkAllAsRead}
        placeholder='Search by university name, location, or field...'
      />

      {/* Main Content */}
      <div style={{ padding: isMobile ? '16px' : '24px' }}>
        <Card>
          {/* Mobile Filter Button */}
          {isMobile && (
            <Row style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Button
                  onClick={() => setFilterDrawerVisible(true)}
                  type='default'
                  className='w-full flex items-center justify-center h-10 border border-gray-300 rounded-md
                   transition duration-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-500'
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

          {/* Floating Active Filters */}
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
                        marginBottom: '4px',
                      }}
                    >
                      {filter.label}: {filter.value}
                    </Tag>
                  ))}
                  <Button
                    type='text'
                    size='small'
                    onClick={handleResetFilters}
                    style={{
                      visibility: hasActiveFilters ? 'visible' : 'hidden',
                      color: '#ff7a00',
                      fontSize: '12px',
                      padding: '0 4px',
                      height: '24px',
                      marginBottom: '4px',
                    }}
                  >
                    Clear all
                  </Button>
                </Space>
              </Col>
            </Row>
          )}

          {/* Header Section */}
          <Row justify='space-between' align='middle' style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12}>
              <Title
                level={4}
                style={{ margin: 0, color: '#333', fontSize: isMobile ? '18px' : '20px' }}
              >
                List of universities ({universityData?.totalCount || 0})
              </Title>
            </Col>
            <Col
              xs={24}
              sm={12}
              style={{ textAlign: isMobile ? 'left' : 'right', marginTop: isMobile ? 12 : 0 }}
            >
              <Space
                direction={isMobile ? 'vertical' : 'horizontal'}
                style={{ width: isMobile ? '100%' : 'auto' }}
              >
                {selectedRowKeys.length > 0 && (
                  <Button
                    danger
                    onClick={() => showDeleteModal('multiple')}
                    style={{ width: isMobile ? '100%' : 'auto' }}
                  >
                    Delete Selected ({selectedRowKeys.length})
                  </Button>
                )}
                <Button
                  type='primary'
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/admin/create-university')}
                  style={{
                    backgroundColor: '#ff7a00',
                    borderColor: '#ff7a00',
                    width: isMobile ? '100%' : 'auto',
                  }}
                >
                  Create
                </Button>
                <Button
                  icon={<ExportOutlined />}
                  onClick={handleExport}
                  style={{
                    backgroundColor: '#ff7a00',
                    borderColor: '#ff7a00',
                    color: 'white',
                    width: isMobile ? '100%' : 'auto',
                  }}
                >
                  Export
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Search Results Info */}
          {searchInput && (
            <Row style={{ position: 'relative', marginBottom: 16, minHeight: '24px' }}>
              <Col>
                <div style={{ fontSize: '14px', color: '#000' }}>
                  Results for &quot;<b>{searchInput}</b>&quot;:
                </div>
              </Col>
            </Row>
          )}

          {/* Table */}
          <Table
            columns={columns}
            dataSource={sortedUniversities}
            rowKey='id'
            rowSelection={rowSelection}
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: universityData?.totalCount || 0,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size || 12);
              },
              showSizeChanger: false,
              showQuickJumper: false,
              className: 'custom-pagination',
              itemRender: (page, type, originalElement) => {
                const totalPages = Math.ceil((universityData?.totalCount || 0) / pageSize);

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
                      onMouseEnter={(e) => {
                        if (!isDisabled) e.currentTarget.style.color = '#ffb366';
                      }}
                      onMouseLeave={(e) => {
                        if (!isDisabled) e.currentTarget.style.color = '#ff7a00';
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
                      onMouseEnter={(e) => {
                        if (!isDisabled) e.currentTarget.style.color = '#ffb366';
                      }}
                      onMouseLeave={(e) => {
                        if (!isDisabled) e.currentTarget.style.color = '#ff7a00';
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
            style={{ marginBottom: 16 }}
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
        <Space direction='vertical' style={{ width: '100%' }} size='large'>
          <div>
            <div style={{ fontSize: '14px', marginBottom: '8px', color: '#666', fontWeight: 500 }}>
              Country
            </div>
            <Select
              value={filters.country || 'all'}
              onChange={(value) => handleFilterChange('country', value === 'all' ? '' : value)}
              style={{ width: '100%' }}
              size='large'
            >
              <Option value='all'>All Countries</Option>
              {getUniqueCountries().map((country) => (
                <Option key={country} value={country}>
                  {country}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <div style={{ fontSize: '14px', marginBottom: '8px', color: '#666', fontWeight: 500 }}>
              Type
            </div>
            <Select
              value={filters.type || 'all'}
              onChange={(value) => handleFilterChange('type', value === 'all' ? '' : value)}
              style={{ width: '100%' }}
              size='large'
            >
              <Option value='all'>All Types</Option>
              {getUniqueTypes().map((type) => (
                <Option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <div style={{ fontSize: '14px', marginBottom: '8px', color: '#666', fontWeight: 500 }}>
              Size
            </div>
            <Select
              value={filters.size || 'all'}
              onChange={(value) => handleFilterChange('size', value === 'all' ? '' : value)}
              style={{ width: '100%' }}
              size='large'
            >
              <Option value='all'>All Sizes</Option>
              {getUniqueSizes().map((size) => (
                <Option key={size} value={size}>
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <div style={{ fontSize: '14px', marginBottom: '8px', color: '#666', fontWeight: 500 }}>
              Fields
            </div>
            <Select
              value={filters.department || 'all'}
              onChange={(value) => handleFilterChange('department', value === 'all' ? '' : value)}
              style={{ width: '100%' }}
              size='large'
            >
              <Option value='all'>All Fields</Option>
              {getUniqueDepartments().map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <div style={{ fontSize: '14px', marginBottom: '8px', color: '#666', fontWeight: 500 }}>
              Sort By
            </div>
            <Select value={sortBy} onChange={setSortBy} style={{ width: '100%' }} size='large'>
              {sortOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
          </div>
        </Space>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        title='Confirm Action'
        visible={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
        okText='Yes'
        cancelText='No'
        okButtonProps={{
          type: 'primary', // blue button
        }}
      >
        <div className='flex items-start gap-2'>
          <ExclamationCircleFilled className='text-yellow-300 text-lg relative -top-0.5' />
          <p className='text-sm text-gray-700 m-0'>{getConfirmationMessage()}</p>
        </div>
      </Modal>
    </div>
  );
};

export default UniversityListPage;
