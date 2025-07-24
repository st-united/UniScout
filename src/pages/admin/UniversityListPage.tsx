import {
  PlusOutlined,
  ExportOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  ExclamationCircleFilled,
  SearchOutlined,
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
  Checkbox,
  Input,
} from 'antd';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ExportUniversityModal from './modals/ExportUniversityModal';
import AdminHeader from '../../components/AdminHeader';
import AdminSearchbar from '../../components/AdminSearchbar';
import LayoutWrapper from '../../components/LayoutWrapper';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { Title } = Typography;

// Updated interface to match API response
interface University {
  id: string;
  university: string;
  abbreviation: string;
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
  academicFieldsCommaSeparated: string; // Updated to use academicFieldsCommaSeparated
  subjectNames: string[];
  size: string;
}

// API Response interface
interface UniversityApiResponse {
  message: string;
  data: University[];
  totalCount: number;
}

// Interface for notification items (imported from AdminNotification)
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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const sortOptions = [
  { label: 'Sort by: high to low', value: 'rank-asc' },
  { label: 'Sort by: low to high', value: 'rank-desc' },
];

type FilterKey = 'country' | 'region' | 'type' | 'size' | 'academicFields' | 'search'; // Updated to academicFields

const UniversityListPage: React.FC = () => {
  const navigate = useNavigate();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // State for university data
  const [universityData, setUniversityData] = useState<UniversityApiResponse>();
  const [currentUniversityData, setCurrentUniversityData] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Record<FilterKey, string[]>>({
    country: [],
    region: [],
    type: [],
    size: [],
    academicFields: [], // Updated to academicFields
    search: [],
  });

  const debouncedFilters = useDebounce(filters, 400);

  const [sortBy, setSortBy] = useState('Sort by: high to low');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // New state for actual search query
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const handleMultiFilterChange = (field: FilterKey, values: string[]) => {
    setFilters({ ...filters, [field]: values });
    setCurrentPage(1);
  };

  const fetchUniversities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<UniversityApiResponse>('/admin/universities', {
        params: {
          search: searchQuery || undefined, // Use searchQuery instead of debouncedFilters.search
          type:
            debouncedFilters.type.length > 0
              ? debouncedFilters.type.map((t) => t.toLowerCase())
              : undefined,
          country: debouncedFilters.country.length > 0 ? debouncedFilters.country : undefined,
          size: debouncedFilters.size.length > 0 ? debouncedFilters.size : undefined,
          fieldNames:
            debouncedFilters.academicFields.length > 0
              ? debouncedFilters.academicFields
              : undefined, // Updated to academicFields
          sortOrder: sortBy.includes('desc') ? 'DESC' : 'ASC',
          page: currentPage,
        },
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          Object.keys(params).forEach((key) => {
            const value = params[key];
            if (Array.isArray(value)) {
              value.forEach((v) => searchParams.append(key, v));
            } else if (value !== undefined) {
              searchParams.append(key, value);
            }
          });
          return searchParams.toString();
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
  }, [debouncedFilters, sortBy, currentPage, pageSize, searchQuery]);

  useEffect(() => {
    fetchUniversities();
  }, [debouncedFilters, sortBy, currentPage, pageSize, fetchUniversities]);

  // Hide delete buttons
  const [showBatchActions, setShowBatchActions] = useState(false);

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

  // Fetch universities on component mount
  useEffect(() => {
    fetchUniversities();
  }, [currentPage, pageSize, fetchUniversities]);

  // Handle search from search input
  const handleSearchSubmit = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  // Handle search from AdminSearchbar component (if still used)
  const handleGlobalSearch = (searchValue: string) => {
    setSearchInput(searchValue);
    setSearchQuery(searchValue);
    setCurrentPage(1);
  };

  // Handle Enter key press in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Clear search input
  const clearSearchInput = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
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
      country: [],
      region: [],
      type: [],
      size: [],
      academicFields: [], // Updated to academicFields
      search: [],
    });
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
    setSelectedRowKeys([]);
    // Note: sortBy is NOT reset here, so it maintains the current sort option
  };

  // Remove individual filter
  const removeFilter = (field: FilterKey, value?: string) => {
    if (
      value &&
      (field === 'country' || field === 'type' || field === 'size' || field === 'academicFields')
    ) {
      // Remove specific value from array
      const newValues = filters[field].filter((item) => item !== value);
      setFilters({ ...filters, [field]: newValues });
    } else {
      // Remove entire filter
      setFilters({ ...filters, [field]: [] });
    }
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

        await axios.delete(`/admin/universities/${universityToDelete.id}`, {
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
    navigate(`/edit-university/${universityId}`);
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/admin/universities/export', {
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

  // Updated academic fields options
  const fieldNamesOptions = [
    { value: 'agricultural_veterinary_sciences', label: 'Agricultural & Veterinary Sciences' },
    { value: 'arts_design', label: 'Arts & Design' },
    { value: 'business_management_law', label: 'Business, Management & Law' },
    { value: 'education_training', label: 'Education & Training' },
    { value: 'engineering_technology', label: 'Engineering & Technology' },
    { value: 'health_medicine', label: 'Health & Medicine' },
    { value: 'humanities_languages', label: 'Humanities & Languages' },
    { value: 'ict', label: 'Information & Communication Technology (ICT)' },
    { value: 'natural_sciences', label: 'Natural Sciences' },
    { value: 'social_behavioral_sciences', label: 'Social & Behavioral Sciences' },
    { value: 'services', label: 'Services' },
    {
      value: 'transport_safety_security_military',
      label: 'Transport, Safety, Security & Military',
    },
    { value: 'other', label: 'Other' },
  ];

  // Helper function to get label for academic field value
  const getFieldNameLabel = (value: string): string => {
    const field = fieldNamesOptions.find((option) => option.value === value);
    return field ? field.label : value;
  };

  // Helper function to parse comma-separated academic fields
  const parseAcademicFields = (academicFieldsCommaSeparated: string): string[] => {
    if (!academicFieldsCommaSeparated) return [];
    return academicFieldsCommaSeparated
      .split(',')
      .map((field) => field.trim())
      .filter((field) => field);
  };

  // Enhanced filter function to include university name, location, and strength search
  const filteredUniversities = currentUniversityData.filter((u) => {
    const searchValue = searchQuery || '';
    const universityFields = parseAcademicFields(u.academicFieldsCommaSeparated);

    const searchMatch =
      !searchValue ||
      u.university.toLowerCase().includes(searchValue.toLowerCase()) ||
      u.abbreviation.toLowerCase().includes(searchValue.toLowerCase()) || // Add this line for abbreviation search
      u.location.toLowerCase().includes(searchValue.toLowerCase()) ||
      u.country.toLowerCase().includes(searchValue.toLowerCase()) ||
      universityFields.some((field) =>
        getFieldNameLabel(field).toLowerCase().includes(searchValue.toLowerCase()),
      );

    return (
      searchMatch &&
      (filters.country.length === 0 || filters.country.includes(u.country)) &&
      (filters.type.length === 0 || filters.type.includes(u.type)) &&
      (filters.size.length === 0 || filters.size.includes(u.size)) &&
      (filters.academicFields.length === 0 ||
        filters.academicFields.some((field) => universityFields.includes(field)))
    );
  });

  const sortedUniversities = [...filteredUniversities].sort((a, b) => {
    switch (sortBy) {
      case 'rank-asc':
        return a.rank - b.rank;
      case 'rank-desc':
        return b.rank - a.rank;
      default:
        return 0;
    }
  });

  // Get unique values for filter options
  const getUniqueCountries = () => {
    return ['Australia', 'India', 'Japan', 'Korea', 'USA', 'Vietnam'];
  };

  const getUniqueTypes = () => {
    return ['public', 'private', 'college', 'academy', 'international'];
  };

  const getUniqueSizes = () => {
    return ['small', 'medium', 'large', 'extra large'];
  };

  // Updated to always return all academic field options
  const getUniqueFields = () => {
    return fieldNamesOptions.map((option) => option.value);
  };

  // Check if any filters are active
  const hasActiveFilters =
    Object.values(filters).some(
      (value) => Array.isArray(value) && value.some((v) => v && v.trim() !== ''),
    ) || searchQuery.trim() !== '';

  // Get active filters for floating display - Updated to show individual tags
  const getActiveFilters = () => {
    const activeFilters: Array<{
      key: FilterKey;
      label: string;
      value: string;
      itemValue?: string;
    }> = [];

    // Individual country filters
    if (filters.country && filters.country.length > 0) {
      filters.country.forEach((country) => {
        activeFilters.push({
          key: 'country',
          label: 'Country',
          value: country,
          itemValue: country,
        });
      });
    }

    // Individual type filters
    if (filters.type && filters.type.length > 0) {
      filters.type.forEach((type) => {
        activeFilters.push({ key: 'type', label: 'Type', value: type, itemValue: type });
      });
    }

    // Individual size filters
    if (filters.size && filters.size.length > 0) {
      filters.size.forEach((size) => {
        activeFilters.push({ key: 'size', label: 'Size', value: size, itemValue: size });
      });
    }

    // Individual academic field filters
    if (filters.academicFields && filters.academicFields.length > 0) {
      filters.academicFields.forEach((field) => {
        const fieldLabel = getFieldNameLabel(field);
        activeFilters.push({
          key: 'academicFields',
          label: 'Field',
          value: fieldLabel,
          itemValue: field,
        });
      });
    }

    // Search filter
    if (searchQuery.trim() !== '') {
      activeFilters.push({ key: 'search', label: 'Search', value: searchQuery });
    }

    return activeFilters;
  };

  // Handle pagination change with scroll to top
  const handlePaginationChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Table columns configuration
  const columns: ColumnsType<University> = [
    {
      title: 'University Name',
      dataIndex: 'university',
      key: 'university',
      width: 400,
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
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
        <Tag color={type === 'public' ? 'blue' : 'green'} style={{ fontSize: '14px' }}>
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
          style={{ fontSize: '14px' }}
        >
          {size.charAt(0).toUpperCase() + size.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Broad Field',
      dataIndex: 'academicFieldsCommaSeparated',
      key: 'academicFieldsCommaSeparated',
      width: 200,
      render: (academicFieldsCommaSeparated: string) => {
        const fields = parseAcademicFields(academicFieldsCommaSeparated);
        const sortedFields = fields.sort(
          (a, b) =>
            fieldNamesOptions.findIndex((opt) => opt.value === a) -
            fieldNamesOptions.findIndex((opt) => opt.value === b),
        );
        const displayText = sortedFields.map((field) => getFieldNameLabel(field)).join(', ');

        return (
          <div
            style={{
              maxWidth: '180px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={displayText} // Show full text on hover
          >
            {displayText}
          </div>
        );
      },
    },
    {
      title: (
        <div
          role='button'
          tabIndex={0}
          onClick={() => setShowBatchActions((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowBatchActions((prev) => !prev);
            }
          }}
          style={{ cursor: 'pointer' }}
          aria-label='Show batch actions'
        >
          <div style={{ textAlign: 'right' }}>
            <MoreOutlined />
          </div>
        </div>
      ),

      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type='text'
            icon={<EditOutlined style={{ fontSize: '18px' }} />}
            onClick={() => handleEdit(record.id)}
            style={{ color: '#ff7a00' }}
          />
          <Button
            type='text'
            icon={<DeleteOutlined style={{ fontSize: '18px' }} />}
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

  // Custom Search Component
  const CustomSearchBar = () => (
    <div style={{ position: 'relative', width: '100%' }}>
      <Input
        placeholder='Search universities...'
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyPress={handleSearchKeyPress}
        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        suffix={
          searchInput ? (
            <CloseOutlined
              style={{
                color: '#bfbfbf',
                cursor: 'pointer',
                padding: '2px',
              }}
              onClick={clearSearchInput}
            />
          ) : null
        }
        style={{
          paddingRight: searchInput ? '30px' : '11px',
        }}
      />
      <Button
        type='primary'
        icon={<SearchOutlined />}
        onClick={handleSearchSubmit}
        style={{
          position: 'absolute',
          right: '-1px',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: '#ff7a00',
          borderColor: '#ff7a00',
          zIndex: 1,
        }}
      />
    </div>
  );

  // Filter component for desktop with adjusted widths
  const FilterSection = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6} lg={4}>
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
          popupRender={(menu) => (
            <span role='presentation' onMouseDown={(e) => e.stopPropagation()}>
              {menu}
            </span>
          )}
        >
          {getUniqueCountries().map((country) => (
            <Option key={country} value={country} label={country}>
              <Checkbox checked={filters.country.includes(country)}>{country}</Checkbox>
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={6} lg={4}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '7px', color: '#666' }}>
          Type
        </div>
        <Select
          mode='multiple' // Enable multi-select
          allowClear
          value={filters.type}
          onChange={(values) => handleMultiFilterChange('type', values || [])}
          style={{ width: '100%' }}
          placeholder='All Types'
          popupRender={(menu) => (
            <span role='presentation' onMouseDown={(e) => e.stopPropagation()}>
              {menu}
            </span>
          )}
        >
          {getUniqueTypes().map((type) => (
            <Option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={6} lg={4}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '7px', color: '#666' }}>
          Size
        </div>
        <Select
          mode='multiple' // Enable multi-select
          allowClear
          value={filters.size}
          onChange={(values) => handleMultiFilterChange('size', values || [])}
          style={{ width: '100%' }}
          placeholder='All Size'
          popupRender={(menu) => (
            <span role='presentation' onMouseDown={(e) => e.stopPropagation()}>
              {menu}
            </span>
          )}
        >
          {getUniqueSizes().map((size) => (
            <Option key={size} value={size}>
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={8} lg={7}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '7px', color: '#666' }}>
          Broad Field
        </div>
        <Select
          mode='multiple' // Enable multi-select for Broad Field
          allowClear
          value={filters.academicFields}
          onChange={(values) => handleMultiFilterChange('academicFields', values || [])}
          style={{ width: '100%' }}
          placeholder='All Broad Fields'
          popupRender={(menu) => (
            <span role='presentation' onMouseDown={(e) => e.stopPropagation()}>
              {menu}
            </span>
          )}
        >
          {getUniqueFields().map((field) => (
            <Option key={field} value={field} label={getFieldNameLabel(field)}>
              {getFieldNameLabel(field)}
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={24} md={6} lg={5}>
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
  if (error && currentUniversityData.length === 0) {
    return (
      <div style={{ backgroundColor: '#FFFDF9', minHeight: '100vh' }}>
        <div style={{ padding: isMobile ? '16px' : '24px' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
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
      <AdminHeader />

      {/* Main Content */}
      <LayoutWrapper>
        <div style={{ padding: isMobile ? '16px' : '24px' }}>
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                  <AdminSearchbar onSearch={handleGlobalSearch} placeholder='Search' />
                </Col>
                <Col xs={24} sm={12} style={{ textAlign: isMobile ? 'left' : 'right' }}>
                  <Space
                    direction={isMobile ? 'vertical' : 'horizontal'}
                    wrap={!isMobile} // Add this prop to allow buttons to wrap on larger screens
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
                      onClick={() => navigate('/create-university')}
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
                      onClick={() => setIsExportModalOpen(true)}
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
            </div>
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
                        onClose={() => removeFilter(filter.key, filter.itemValue)}
                        closeIcon={<CloseOutlined />}
                        style={{
                          backgroundColor: '#fff7e6',
                          borderColor: '#ff7a00',
                          color: '#ff7a00',
                          fontSize: '14px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          marginBottom: '4px',
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
              <Col xs={24} sm={12}>
                <Title
                  level={4}
                  style={{ margin: 0, color: '#333', fontSize: isMobile ? '18px' : '20px' }}
                >
                  List of universities ({universityData?.totalCount || 0})
                </Title>
              </Col>
            </Row>

            {/* Table */}
            <Table
              columns={columns}
              dataSource={sortedUniversities}
              rowKey='id'
              rowSelection={showBatchActions ? rowSelection : undefined}
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: universityData?.totalCount || 0,
                onChange: handlePaginationChange, // Ensure this correctly references the function
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
              scroll={{ x: 800, scrollToFirstRowOnChange: true }}
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
        {/* Delete Confirmation Modal */}
        <Modal
          title='Confirm Action'
          open={deleteModalVisible}
          onOk={handleDeleteConfirm}
          onCancel={() => setDeleteModalVisible(false)}
          okText='Yes'
          cancelText='No'
          okButtonProps={{
            type: 'primary',
          }}
        >
          <div className='flex items-start gap-2'>
            <ExclamationCircleFilled className='text-yellow-300 text-lg relative -top-0.5' />
            <p className='text-sm text-gray-700 m-0'>{getConfirmationMessage()}</p>
          </div>
        </Modal>
        <ExportUniversityModal
          open={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          appliedFilters={filters}
        />
      </LayoutWrapper>
    </div>
  );
};

export default UniversityListPage;
