import {
  PlusOutlined,
  ExportOutlined,
  MoreOutlined,
  EyeOutlined,
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
  Checkbox,
  Dropdown,
  Menu,
  Empty,
} from 'antd';
import axios from 'axios';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import ExportUniversityModal from './modals/ExportUniversityModal';
import AdminHeader from '../../components/AdminHeader';
import SearchBar from '../../components/AdminSearchbar';
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
  academicFieldsCommaSeparated: string;
  subjectNames: string[];
  size: string;
}

interface UniversityApiResponse {
  message: string;
  data: University[];
  totalCount: number;
}

const sortOptions = [
  { label: 'Sort by: high to low', value: 'rank-asc' },
  { label: 'Sort by: low to high', value: 'rank-desc' },
];

type FilterKey = 'country' | 'region' | 'type' | 'size' | 'academicFields' | 'search';

const getSortByLabel = (value: string): string => {
  const option = sortOptions.find((opt) => opt.value === value);
  return option?.label || value;
};
const sanitizeSearch = (raw: string) => {
  const cleaned = raw
    .replace(/[^\p{L}\p{N}\s\-']/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.slice(0, 120);
};

// Custom hook for debouncing input values
function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const UniversityListPage: React.FC = () => {
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);

  // State for university data
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [universityData, setUniversityData] = useState<UniversityApiResponse>();
  const [currentUniversityData, setCurrentUniversityData] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Record<FilterKey, string[]>>({
    country: [],
    region: [],
    type: [],
    size: [],
    academicFields: [],
    search: [],
  });

  const debouncedFilters = useDebounce(filters, 400);
  const [sortBy, setSortBy] = useState('rank-asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBarKey, setSearchBarKey] = useState(0);
  const appliedFiltersForExport = React.useMemo(
    () => ({ ...filters, search: searchQuery ? [searchQuery] : [] }),
    [filters, searchQuery],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Add state for the dropdown menu visibility
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteType, setDeleteType] = useState<'single' | 'multiple'>('single');
  const [universityToDelete, setUniversityToDelete] = useState<University | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  // ---- Helpers for filter options  ----
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
  ];
  const getFieldNameLabel = (value: string): string =>
    fieldNamesOptions.find((o) => o.value === value)?.label ?? value;
  const parseAcademicFields = (csv: string): string[] =>
    !csv
      ? []
      : csv
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

  const getUniqueCountries = () => ['Australia', 'India', 'Japan', 'Korea', 'USA', 'Vietnam'];
  const getUniqueTypes = () => ['public', 'private', 'college', 'academy', 'international'];
  const getUniqueSizes = () => ['small', 'medium', 'large', 'extra large'];
  const getUniqueFields = () => fieldNamesOptions.map((o) => o.value);

  // ---- Filters change handler ----
  const handleMultiFilterChange = (field: FilterKey, values: string[]) => {
    let newValues = values;

    if (field === 'country' || field === 'type' || field === 'size' || field === 'academicFields') {
      const allOptions =
        field === 'country'
          ? getUniqueCountries()
          : field === 'type'
          ? getUniqueTypes()
          : field === 'size'
          ? getUniqueSizes()
          : getUniqueFields();

      if (values.includes('all')) {
        newValues = values.length === 1 ? allOptions : values.filter((v) => v !== 'all');
      }
    }
    setFilters((prev) => ({ ...prev, [field]: newValues }));
    setCurrentPage(1);
  };

  // ---- Data fetch ----
  const fetchUniversities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const safeSearch = sanitizeSearch(searchQuery);

      const response = await axios.get<UniversityApiResponse>('/admin/universities', {
        params: {
          search: safeSearch || undefined,
          type:
            debouncedFilters.type.length > 0
              ? debouncedFilters.type.map((t) => t.toLowerCase())
              : undefined,
          country: debouncedFilters.country.length > 0 ? debouncedFilters.country : undefined,
          size: debouncedFilters.size.length > 0 ? debouncedFilters.size : undefined,
          fieldNames:
            debouncedFilters.academicFields.length > 0
              ? debouncedFilters.academicFields
              : undefined,
          sortOrder: sortBy.includes('desc') ? 'DESC' : 'ASC',
          page: currentPage,
        },
        paramsSerializer: (params) => {
          const sp = new URLSearchParams();
          Object.keys(params).forEach((key) => {
            const val = (params as any)[key];
            if (Array.isArray(val)) val.forEach((v) => sp.append(key, v));
            else if (val !== undefined) sp.append(key, val);
          });
          return sp.toString();
        },
      });

      setCurrentUniversityData(response.data.data);
      setUniversityData(response.data);
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message || err.message || '' : '';
      if (/syntax error/i.test(msg) || /at or near/i.test(msg)) {
        setCurrentUniversityData([]);
        setUniversityData({ message: 'ok', data: [], totalCount: 0 });
      } else {
        const errorMessage = msg || 'Failed to fetch universities';
        setError(errorMessage);
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters, sortBy, currentPage, pageSize, searchQuery]);

  useEffect(() => {
    fetchUniversities();
  }, [debouncedFilters, sortBy, currentPage, pageSize, fetchUniversities]);

  // ---- Responsive ----
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // ---- Scroll to top on page change ----
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (document.documentElement) document.documentElement.scrollTop = 0;
        if (document.body) document.body.scrollTop = 0;
      } catch {
        window.scrollTo(0, 0);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [currentPage]);

  // ---- Search ----
  const commitSearch = useCallback((val: string) => {
    const safe = sanitizeSearch(val);
    setSearchQuery(safe);
    setFilters((prev) => ({ ...prev, search: safe ? [safe] : [] }));
    setCurrentPage(1);
  }, []);

  // ---- Reset / remove filters ----
  const handleResetFilters = () => {
    setFilters({
      country: [],
      region: [],
      type: [],
      size: [],
      academicFields: [],
      search: [],
    });
    setSearchQuery('');
    setSearchBarKey((k) => k + 1);
    setCurrentPage(1);
    setSelectedRowKeys([]);
  };

  const removeFilter = (field: FilterKey, value?: string) => {
    if (field === 'search') {
      setFilters((prev) => ({ ...prev, search: [] }));
      setSearchQuery('');
      setSearchBarKey((k) => k + 1);
      setCurrentPage(1);
      return;
    }

    if (
      value &&
      (field === 'country' || field === 'type' || field === 'size' || field === 'academicFields')
    ) {
      setFilters((prev) => ({ ...prev, [field]: prev[field].filter((v) => v !== value) }));
    } else {
      setFilters((prev) => ({ ...prev, [field]: [] }));
    }
    setCurrentPage(1);
  };

  // ---- Delete actions ----
  const showDeleteModal = (type: 'single' | 'multiple', university?: University) => {
    setDeleteType(type);
    setUniversityToDelete(university || null);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteType === 'single' && universityToDelete) {
        await axios.delete(`/admin/universities/${universityToDelete.id}`, {
          data: { confirm_deletion: true },
          headers: { 'Content-Type': 'application/json' },
        });
        setCurrentUniversityData((prev) => prev.filter((u) => u.id !== universityToDelete.id));
        message.success('University deleted successfully');
      } else if (deleteType === 'multiple' && selectedRowKeys.length > 0) {
        await axios.delete('/universities/admin/bulk', {
          data: { ids: selectedRowKeys, confirm_deletion: true },
          headers: { 'Content-Type': 'application/json' },
        });
        setCurrentUniversityData((prev) => prev.filter((u) => !selectedRowKeys.includes(u.id)));
        setSelectedRowKeys([]);
        message.success(`${selectedRowKeys.length} universities deleted successfully`);
      }
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? e.response?.data?.message || 'Delete failed'
        : 'Delete failed';
      message.error(msg);
      console.error('Delete error:', e);
    } finally {
      setDeleteModalVisible(false);
      setUniversityToDelete(null);
    }
  };

  const handleEdit = (universityId: string) => navigate(`/edit-university/${universityId}`);

  const handleExport = async () => {
    try {
      const response = await axios.get('/admin/universities/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'universities.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Universities exported successfully');
    } catch (e) {
      message.error('Export failed');
      console.error('Export error:', e);
    }
  };

  // ---- Client-side refine for search + filters ----
  const filteredUniversities = currentUniversityData.filter((u) => {
    const s = searchQuery.toLowerCase();
    const fields = parseAcademicFields(u.academicFieldsCommaSeparated);

    const searchMatch =
      !s ||
      u.university.toLowerCase().includes(s) ||
      u.abbreviation.toLowerCase().includes(s) ||
      u.location.toLowerCase().includes(s) ||
      u.country.toLowerCase().includes(s) ||
      fields.some((f) => getFieldNameLabel(f).toLowerCase().includes(s));

    return (
      searchMatch &&
      (filters.country.length === 0 || filters.country.includes(u.country)) &&
      (filters.type.length === 0 || filters.type.includes(u.type)) &&
      (filters.size.length === 0 || filters.size.includes(u.size)) &&
      (filters.academicFields.length === 0 ||
        filters.academicFields.some((f) => fields.includes(f)))
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

  // ---- Active filters ----
  const hasActiveFilters =
    Object.values(filters).some((v) => Array.isArray(v) && v.some((x) => x && x.trim() !== '')) ||
    searchQuery.trim() !== '';

  const getActiveFilters = () => {
    const active: Array<{ key: FilterKey; label: string; value: string; itemValue?: string }> = [];
    filters.country.forEach((c) =>
      active.push({ key: 'country', label: 'Country', value: c, itemValue: c }),
    );
    filters.type.forEach((t) =>
      active.push({ key: 'type', label: 'Type', value: t, itemValue: t }),
    );
    filters.size.forEach((sz) =>
      active.push({ key: 'size', label: 'Size', value: sz, itemValue: sz }),
    );
    filters.academicFields.forEach((f) =>
      active.push({
        key: 'academicFields',
        label: 'Field',
        value: getFieldNameLabel(f),
        itemValue: f,
      }),
    );
    if (searchQuery.trim() !== '') {
      active.push({ key: 'search', label: 'Search', value: searchQuery });
    }
    return active;
  };

  // Handle pagination change with scroll to top
  const handlePaginationChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const columns: ColumnsType<University> = [
    {
      title: 'University Name',
      dataIndex: 'university',
      key: 'university',
      width: 400,
      render: (text: string) => <span>{text}</span>,
    },
    { title: 'Rank', dataIndex: 'rank', key: 'rank', width: 80 },
    { title: 'Country', dataIndex: 'country', key: 'country', width: 120 },
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
      width: 250,
      render: (value: string) => {
        const fields = parseAcademicFields(value);
        const sortedFields = fields.sort(
          (a, b) =>
            fieldNamesOptions.findIndex((opt) => opt.value === a) -
            fieldNamesOptions.findIndex((opt) => opt.value === b),
        );
        const labels = sortedFields.map(getFieldNameLabel);
        const first = labels[0];
        const rest = labels.length - 1;

        return (
          <Space direction='vertical' size={4} style={{ alignItems: 'flex-start' }}>
            {first && (
              <Tag
                color='white'
                style={{ fontSize: '14px', color: '#000000', borderColor: '#FF6600' }}
              >
                {first}
              </Tag>
            )}
            {rest > 0 && (
              <Tag
                color='white'
                style={{ fontSize: '14px', color: '#000', borderColor: '#FF6600' }}
              >
                +{rest}
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: (
        <Space>
          <strong>Action</strong>
          <Dropdown
            trigger={['click']}
            onOpenChange={(v) => setDropdownVisible(v)}
            open={dropdownVisible}
            dropdownRender={() => (
              <Menu
                onClick={({ key }) => {
                  if (key === 'multiple-selection') {
                    setShowBatchActions((prev) => !prev);
                    setDropdownVisible(false);
                  }
                }}
              >
                <Menu.Item key='multiple-selection'>
                  <Space>Multiple selection</Space>
                </Menu.Item>
              </Menu>
            )}
          >
            <Button type='text' icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type='text'
            icon={<EyeOutlined style={{ fontSize: '18px' }} />}
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

  // ---- Inline FilterSection (uses parent state via closure) ----
  const FilterSection = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6} lg={4}>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 7, color: '#666' }}>
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
          menuItemSelectedIcon={() => null}
          dropdownRender={(menu) => (
            <div role='presentation' onPointerDown={(e) => e.preventDefault()}>
              {menu}
            </div>
          )}
        >
          <Option key='all' value='all' label='Select All'>
            <Checkbox
              checked={
                filters.country.length === getUniqueCountries().length &&
                getUniqueCountries().length > 0
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

      <Col xs={24} sm={12} md={6} lg={4}>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 7, color: '#666' }}>Type</div>
        <Select
          mode='multiple'
          allowClear
          value={filters.type}
          onChange={(values) => handleMultiFilterChange('type', values || [])}
          style={{ width: '100%' }}
          placeholder='All Types'
          optionLabelProp='label'
          menuItemSelectedIcon={() => null}
          dropdownRender={(menu) => (
            <div role='presentation' onPointerDown={(e) => e.preventDefault()}>
              {menu}
            </div>
          )}
        >
          <Option key='all' value='all' label='Select All'>
            <Checkbox
              checked={
                filters.type.length === getUniqueTypes().length && getUniqueTypes().length > 0
              }
            >
              Select All
            </Checkbox>
          </Option>
          {getUniqueTypes().map((type) => (
            <Option key={type} value={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
              <Checkbox checked={filters.type.includes(type)}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Checkbox>
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={6} lg={4}>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 7, color: '#666' }}>Size</div>
        <Select
          mode='multiple'
          allowClear
          value={filters.size}
          onChange={(values) => handleMultiFilterChange('size', values || [])}
          style={{ width: '100%' }}
          placeholder='All Sizes'
          optionLabelProp='label'
          dropdownRender={(menu) => (
            <div role='presentation' onPointerDown={(e) => e.preventDefault()}>
              {menu}
            </div>
          )}
        >
          <Option key='all' value='all' label='Select All'>
            <Checkbox
              checked={
                filters.size.length === getUniqueSizes().length && getUniqueSizes().length > 0
              }
            >
              Select All
            </Checkbox>
          </Option>
          {getUniqueSizes().map((size) => (
            <Option key={size} value={size} label={size.charAt(0).toUpperCase() + size.slice(1)}>
              <Checkbox checked={filters.size.includes(size)}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </Checkbox>
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={8} lg={7}>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 7, color: '#666' }}>
          Broad Field
        </div>
        <Select
          mode='multiple'
          allowClear
          value={filters.academicFields}
          onChange={(values) => handleMultiFilterChange('academicFields', values || [])}
          style={{ width: '100%' }}
          placeholder='All Broad Fields'
          optionLabelProp='label'
          menuItemSelectedIcon={() => null}
          dropdownRender={(menu) => (
            <div role='presentation' onPointerDown={(e) => e.preventDefault()}>
              {menu}
            </div>
          )}
        >
          <Option key='all' value='all' label='Select All'>
            <Checkbox
              checked={
                filters.academicFields.length === getUniqueFields().length &&
                getUniqueFields().length > 0
              }
            >
              Select All
            </Checkbox>
          </Option>
          {getUniqueFields().map((field) => (
            <Option key={field} value={field} label={getFieldNameLabel(field)}>
              <Checkbox checked={filters.academicFields.includes(field)}>
                {getFieldNameLabel(field)}
              </Checkbox>
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={24} md={6} lg={5}>
        <div
          style={{
            fontSize: 12,
            marginBottom: 4,
            color: '#666',
            textAlign: isMobile ? 'left' : 'right',
          }}
        >
          <button
            onClick={handleResetFilters}
            style={{
              color: '#ff7a00',
              cursor: 'pointer',
              fontSize: 14,
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
        <Select value={sortBy} onChange={setSortBy} style={{ width: '100%', marginTop: 8 }}>
          {sortOptions.map((opt) => (
            <Option key={opt.value} value={opt.value}>
              {opt.label}
            </Option>
          ))}
        </Select>
      </Col>
    </Row>
  );

  // ---- Error screen ----
  if (error && currentUniversityData.length === 0) {
    return (
      <div style={{ backgroundColor: '#FFFDF9', minHeight: '100vh' }}>
        <div style={{ padding: isMobile ? '16px' : '24px' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <Title level={4} style={{ color: '#ff4d4f' }}>
                Failed to load universities
              </Title>
              <p style={{ color: '#666', marginBottom: 20 }}>{error}</p>
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

      <LayoutWrapper>
        <div ref={topRef} style={{ padding: isMobile ? '16px' : '24px' }}>
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                  <SearchBar
                    key={searchBarKey}
                    placeholder='Search universities...'
                    onSearch={commitSearch}
                  />
                </Col>
                <Col xs={24} sm={12} style={{ textAlign: isMobile ? 'left' : 'right' }}>
                  <Space
                    direction={isMobile ? 'vertical' : 'horizontal'}
                    wrap={!isMobile}
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
                        height: 36,
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
                        height: 36,
                      }}
                    >
                      Export
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>

            {isMobile && (
              <Row style={{ marginBottom: 16 }}>
                <Col span={24}>
                  <Button
                    onClick={() => setFilterDrawerVisible(true)}
                    type='default'
                    className='w-full flex items-center justify-center h-10 border border-gray-300 rounded-md transition duration-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-500'
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
                    {getActiveFilters().map((f) => (
                      <Tag
                        key={`${f.key}-${f.value}`} // ✅ unique key per tag
                        closable
                        onClose={() => removeFilter(f.key, f.itemValue)}
                        closeIcon={<CloseOutlined />}
                        style={{
                          background: '#FEF7E6',
                          color: '#FF923E',
                          border: '1px solid #FF923E',
                          fontSize: 14,
                          padding: '4px 8px',
                          borderRadius: 6,
                        }}
                      >
                        {f.label}: {f.value}
                      </Tag>
                    ))}
                  </Space>
                </Col>
              </Row>
            )}

            <Row justify='space-between' align='middle' style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12}>
                <Title level={4} style={{ margin: 0, color: '#333', fontSize: isMobile ? 18 : 20 }}>
                  List of universities ({universityData?.totalCount || 0})
                </Title>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={sortedUniversities}
              rowKey='id'
              rowSelection={
                showBatchActions ? { selectedRowKeys, onChange: setSelectedRowKeys } : undefined
              }
              loading={loading}
              pagination={
                sortedUniversities.length
                  ? {
                      current: currentPage,
                      pageSize,
                      total: universityData?.totalCount || 0,
                      onChange: handlePaginationChange,
                      showSizeChanger: false,
                      showQuickJumper: false,
                      className: 'custom-pagination',
                      itemRender: (page, type, original) => {
                        const totalPages = Math.ceil((universityData?.totalCount || 0) / pageSize);
                        const baseStyle: React.CSSProperties = {
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'color 0.2s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        };
                        const handlePageClick = (newPage: number) => {
                          setCurrentPage(newPage);
                          setTimeout(() => {
                            topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }, 100);
                        };

                        if (type === 'prev') {
                          const disabled = currentPage === 1;
                          return (
                            <span
                              role='button'
                              tabIndex={disabled ? -1 : 0}
                              style={{ ...baseStyle, color: disabled ? '#d9d9d9' : '#ff7a00' }}
                              onClick={() => !disabled && handlePageClick(currentPage - 1)}
                              aria-disabled={disabled}
                              onKeyDown={(e) => {
                                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                                  e.preventDefault();
                                  handlePageClick(currentPage - 1);
                                }
                              }}
                            >
                              &lt; Previous
                            </span>
                          );
                        }
                        if (type === 'next') {
                          const disabled = currentPage >= totalPages;
                          return (
                            <span
                              role='button'
                              tabIndex={disabled ? -1 : 0}
                              style={{ ...baseStyle, color: disabled ? '#d9d9d9' : '#ff7a00' }}
                              onClick={() => !disabled && handlePageClick(currentPage + 1)}
                              aria-disabled={disabled}
                              onKeyDown={(e) => {
                                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                                  e.preventDefault();
                                  handlePageClick(currentPage + 1);
                                }
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
                              role='button'
                              tabIndex={isCurrent ? -1 : 0}
                              style={{
                                ...baseStyle,
                                color: '#ff7a00',
                                fontWeight: isCurrent ? 'bold' : 500,
                              }}
                              onClick={() => !isCurrent && handlePageClick(page)}
                              aria-current={isCurrent ? 'page' : undefined}
                              onKeyDown={(e) => {
                                if (!isCurrent && (e.key === 'Enter' || e.key === ' ')) {
                                  e.preventDefault();
                                  handlePageClick(page);
                                }
                              }}
                            >
                              {page}
                            </span>
                          );
                        }
                        if (type === 'jump-prev' || type === 'jump-next') {
                          return <span style={{ color: '#999' }}>•••</span>;
                        }
                        return original;
                      },
                      style: {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        marginTop: 24,
                        marginBottom: 16,
                      },
                    }
                  : false
              }
              scroll={{ x: 800, scrollToFirstRowOnChange: true }}
              style={{ marginBottom: 16 }}
              locale={{
                emptyText: hasActiveFilters ? (
                  <Empty description='No matching result found' />
                ) : (
                  <Empty description='No data' />
                ),
              }}
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
          bodyStyle={{ padding: 16 }}
        >
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <FilterSection />
          </div>
          <Space direction='vertical' style={{ width: '100%', marginTop: 16 }} size='middle'>
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
          okButtonProps={{ type: 'primary' }}
        >
          <div className='flex items-start gap-2'>
            <ExclamationCircleFilled className='text-yellow-300 text-lg relative -top-0.5' />
            <p className='text-sm text-gray-700 m-0'>
              {deleteType === 'single' && universityToDelete
                ? `Are you sure delete ${universityToDelete.university}?`
                : 'Are you sure delete all selected fields?'}
            </p>
          </div>
        </Modal>
        <ExportUniversityModal
          open={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          appliedFilters={appliedFiltersForExport}
          sortBy={getSortByLabel(sortBy)}
          sortOrder={sortBy}
        />
      </LayoutWrapper>
    </div>
  );
};

export default UniversityListPage;
