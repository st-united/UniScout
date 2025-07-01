import {
  PlusOutlined,
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
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
  Pagination,
  Modal,
  Drawer,
  Badge,
  Tag,
} from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminSearchFilter from '../../components/AdminSearchFilter';
import type { ColumnsType } from 'antd/es/table';
const { Option } = Select;
const { Title } = Typography;

// Mock data interface
interface University {
  id: number;
  name: string;
  rank: number;
  location: string;
  type: string;
  size: string;
  department: string;
  region: string;
  status: string;
  abbreviation?: string; // Added for search functionality
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

// Mock university data - replace with your actual universityData import
const mockUniversityData: University[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Stanford University ${i + 1}`,
  abbreviation: `SU${i + 1}`, // Added abbreviations for search
  rank: i + 1,
  location: i % 3 === 0 ? 'America' : i % 3 === 1 ? 'Canada' : 'UK',
  type:
    i % 4 === 0 ? 'Academy' : i % 4 === 1 ? 'Public' : i % 4 === 2 ? 'Private' : 'International',
  size: i % 4 === 0 ? 'Small' : i % 4 === 1 ? 'Medium' : i % 4 === 2 ? 'Large' : 'XL',
  department: i % 3 === 0 ? 'Science & Engineer' : i % 3 === 1 ? 'Business' : 'Arts & Humanities',
  region: i % 3 === 0 ? 'North America' : i % 3 === 1 ? 'Europe' : 'Asia',
  status: i % 2 === 0 ? 'Public' : 'Private',
}));

const sortOptions = [
  { label: 'High to Low Rank', value: 'rank-desc' },
  { label: 'Low to High Rank', value: 'rank-asc' },
  { label: 'A-Z Name', value: 'name-asc' },
  { label: 'Z-A Name', value: 'name-desc' },
];
type FilterKey = 'country' | 'region' | 'type' | 'size' | 'department' | 'search';
const UniversityListPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUniversityData, setCurrentUniversityData] = useState<University[]>([]);
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
  const [loading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        console.log('API params sent:', {
          search: filters.search || undefined,
          type: filters.type || undefined,
          country: filters.country || undefined,
          size: filters.size || undefined,
          fieldNames:
            filters.department && filters.department !== 'all' ? [filters.department] : undefined,

          sortOrder: sortBy.includes('desc') ? 'DESC' : 'ASC',
        });

        const response = await axios.get('/universities', {
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
        setTotalCount(response.data.totalCount);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Erreur API:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            data: error.response?.data,
            config: error.config,
          });
        } else {
          console.error('Unexpected Error:', error);
        }
      }
    };
    fetchUniversities();
  }, [debouncedFilters, sortBy, currentPage, pageSize]);

  // Multi-select state
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Delete confirmation modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteType, setDeleteType] = useState<'single' | 'multiple'>('single');
  const [universityToDelete, setUniversityToDelete] = useState<University | null>(null);

  // Mobile responsive states
  const [isMobile, setIsMobile] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

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

  // Handle notification click from AdminSearchFilter component
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
        // Mock check for existing references
        const hasReferences = Math.random() < 0.1;
        if (hasReferences) {
          throw new Error('Cannot delete university due to existing references.');
        }

        setCurrentUniversityData((prev) => prev.filter((uni) => uni.id !== universityToDelete.id));
        message.success('University deleted successfully');
        console.log(
          `AUDIT: Deleted university ${universityToDelete.name} (ID: ${universityToDelete.id})`,
        );
      } else if (deleteType === 'multiple' && selectedRowKeys.length > 0) {
        const universitiesToDelete = currentUniversityData.filter((uni) =>
          selectedRowKeys.includes(uni.id),
        );

        // Mock check for references
        const hasReferences = Math.random() < 0.1;
        if (hasReferences) {
          throw new Error('Cannot delete universities due to existing references.');
        }

        setCurrentUniversityData((prev) => prev.filter((uni) => !selectedRowKeys.includes(uni.id)));
        setSelectedRowKeys([]);
        message.success(`${selectedRowKeys.length} universities deleted successfully`);
        console.log(
          `AUDIT: Deleted ${universitiesToDelete.length} universities:`,
          universitiesToDelete.map((u) => u.name),
        );
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setDeleteModalVisible(false);
      setUniversityToDelete(null);
    }
  };

  const handleEdit = (universityId: number) => {
    navigate(`/admin/edit-university/${universityId}`);
  };

  const handleExport = () => {
    message.info('Export functionality will be implemented');
  };

  // Filter universities based on search input
  const filteredUniversities = currentUniversityData;
  const [totalCount, setTotalCount] = useState(0);

  /*const sortedUniversities = [...filteredUniversities].sort((a, b) => {
    switch (sortBy) {
      case 'rank-asc':
        return b.rank - a.rank;
      case 'rank-desc':
        return a.rank - b.rank;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });*/
  const sortedUniversities = filteredUniversities;

  // Get unique values for filter options
  const getUniqueValues = (key: keyof University) => {
    return [...new Set(currentUniversityData.map((u) => u[key]))].filter(Boolean);
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
      key: 'name',
      sorter: true,
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
      width: 120,
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 100,
    },
    {
      title: 'Broad Field',
      dataIndex: 'strength',
      key: 'strength',
      width: 180,
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
      return `Are you sure delete ${universityToDelete.name}?`;
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
          {getUniqueValues('location').map((country) => (
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
          <Option value='all'>All Type</Option>
          {['Public', 'Private', 'Academy', 'International'].map((type) => (
            <Option key={type} value={type}>
              {type}
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
          <Option value='all'>All Size</Option>
          {['Small', 'Medium', 'Large', 'XL'].map((size) => (
            <Option key={size} value={size}>
              {size}
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
          {getUniqueValues('department').map((dept) => (
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
  const itemRender = (_: any, type: string, originalElement: React.ReactNode) => {
    const commonStyle = { color: '#ff7a00', background: 'none', border: 'none', cursor: 'pointer' };

    if (type === 'prev') {
      return <button style={commonStyle}>Previous</button>;
    }
    if (type === 'next') {
      return <button style={commonStyle}>Next</button>;
    }
    return (
      <button style={commonStyle}>
        {React.isValidElement(originalElement) ? originalElement.props.children : originalElement}
      </button>
    );
  };

  return (
    <div style={{ backgroundColor: '#FFFDF9', minHeight: '100vh' }}>
      {/* Search and Notification Bar */}
      <AdminSearchFilter
        onSearch={handleGlobalSearch}
        onNotificationClick={handleNotificationClick}
        onMarkAllAsRead={handleMarkAllAsRead}
        placeholder='Search by university name, abbreviation, or location...'
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
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '40px',
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
                List of universities
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
            pagination={false}
            scroll={{ x: 800 }}
            style={{ marginBottom: 16 }}
          />

          {/* Custom Pagination */}
          <Row justify='center'>
            <Pagination
              current={currentPage}
              total={totalCount}
              pageSize={pageSize}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size || 12);
              }}
              showSizeChanger={false}
              itemRender={itemRender}
            />
          </Row>
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
              {getUniqueValues('location').map((country) => (
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
              <Option value='all'>All Type</Option>
              {['Public', 'Private', 'Academy', 'International'].map((type) => (
                <Option key={type} value={type}>
                  {type}
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
              <Option value='all'>All Size</Option>
              {['Small', 'Medium', 'Large', 'XL'].map((size) => (
                <Option key={size} value={size}>
                  {size}
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
              {getUniqueValues('department').map((dept) => (
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

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              onClick={handleResetFilters}
              style={{
                flex: 1,
                height: '44px',
                fontSize: '16px',
                color: '#ff7a00',
                borderColor: '#ff7a00',
              }}
            >
              Reset Filters
            </Button>
            <Button
              type='primary'
              onClick={() => setFilterDrawerVisible(false)}
              style={{
                flex: 1,
                height: '44px',
                fontSize: '16px',
                backgroundColor: '#ff7a00',
                borderColor: '#ff7a00',
              }}
            >
              Apply Filters
            </Button>
          </div>
        </Space>
      </Drawer>

      {/* Custom Delete Confirmation Modal */}
      <Modal
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={null}
        centered
        width={isMobile ? '90%' : 400}
        style={{
          borderRadius: '12px',
        }}
        bodyStyle={{
          padding: isMobile ? '24px' : '32px',
          textAlign: 'center',
        }}
        maskStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#FFF3CD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <span style={{ fontSize: '24px', color: '#F59E0B' }}>⚠</span>
          </div>
          <div
            style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: 500,
              color: '#333',
              lineHeight: '24px',
            }}
          >
            {getConfirmationMessage()}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button
            onClick={() => setDeleteModalVisible(false)}
            style={{
              minWidth: '80px',
              height: '40px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              borderColor: '#d9d9d9',
              color: '#666',
              flex: isMobile ? 1 : 'none',
            }}
          >
            No
          </Button>
          <Button
            type='primary'
            onClick={handleDeleteConfirm}
            style={{
              minWidth: '80px',
              height: '40px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              backgroundColor: '#1890ff',
              borderColor: '#1890ff',
              flex: isMobile ? 1 : 'none',
            }}
          >
            Yes
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UniversityListPage;
