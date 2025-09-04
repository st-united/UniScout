import {
  PlusOutlined,
  ExportOutlined,
  MoreOutlined,
  EyeOutlined,
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
  Drawer,
  Badge,
  Tag,
  Checkbox,
  Dropdown,
  Menu,
  Empty,
  ConfigProvider,
} from 'antd';
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DeleteConfirmModal from './modals/DeleteConfirmModal';
import ExportUniversityModal from './modals/ExportUniversityModal';
import AdminHeader from '../../components/AdminHeader';
import SearchBar from '../../components/AdminSearchbar';
import LayoutWrapper from '../../components/LayoutWrapper';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { Title } = Typography;

/**
 * Types — keep in sync with backend contracts.
 */
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

type FilterKey = 'country' | 'region' | 'type' | 'size' | 'academicFields' | 'search';
type FiltersState = Record<FilterKey, string[]>;
type SortValue = 'rank-asc' | 'rank-desc';

/**
 * Theme & UI constants
 */
const PRIMARY = '#ff7a00';
const PRIMARY_BG_HOVER = '#FFF5EB';
const PRIMARY_BG_ACTIVE = '#FFE8D6';
const INTERACTIVE_SELECTOR =
  'button,a,[role="button"],input,textarea,select,.ant-btn,.ant-dropdown,.ant-select,.ant-checkbox,.ant-pagination';

/**
 * Static options
 */
const sortOptions: { label: string; value: SortValue }[] = [
  { label: 'Sort by: high to low', value: 'rank-asc' },
  { label: 'Sort by: low to high', value: 'rank-desc' },
];
const COUNTRIES = ['Australia', 'India', 'Japan', 'Korea', 'USA', 'Vietnam'] as const;
const TYPES = ['public', 'private', 'college', 'academy', 'international'] as const;
const SIZES = ['small', 'medium', 'large', 'extra large'] as const;

const FIELD_OPTIONS = [
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
  { value: 'transport_safety_security_military', label: 'Transport, Safety, Security & Military' },
] as const;

/**
 * Helpers
 */
const getSortByLabel = (value: string): string =>
  sortOptions.find((opt) => opt.value === value)?.label || value;

const sanitizeSearch = (raw: string) =>
  raw
    .replace(/[^\p{L}\p{N}\s\-']/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);

const getFieldNameLabel = (value: string): string =>
  FIELD_OPTIONS.find((o) => o.value === value)?.label ?? value;

const parseAcademicFields = (csv: string): string[] =>
  !csv
    ? []
    : csv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

const buildParams = (params: Record<string, unknown>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (Array.isArray(val)) val.forEach((v) => sp.append(key, String(v)));
    else if (val !== undefined && val !== null && val !== '') sp.append(key, String(val));
  });
  return sp.toString();
};

const isInteractiveElement = (el: HTMLElement | null) => !!el?.closest(INTERACTIVE_SELECTOR);

// Debounce hook
function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

/**
 * FilterSection
 */
interface FilterSectionProps {
  filters: FiltersState;
  onChange: (field: FilterKey, values: string[]) => void;
  isMobile: boolean;
  sortBy: SortValue;
  onSortChange: (val: SortValue) => void;
  onReset: () => void;
  showReset: boolean;
}

const FilterSectionComponent: React.FC<FilterSectionProps> = ({
  filters,
  onChange,
  isMobile,
  sortBy,
  onSortChange,
  onReset,
  showReset,
}) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24, width: '100%' }}>
      <Col xs={24} flex='1 1 220px' style={{ minWidth: 220 }}>
        <div style={{ fontSize: 14, marginBottom: 4, color: '#666' }}>Country</div>
        <Select
          mode='multiple'
          allowClear
          size='large'
          value={filters.country}
          onChange={(values) => onChange('country', values || [])}
          style={{ width: '100%', fontSize: 13 }}
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
            <Checkbox checked={filters.country.length === COUNTRIES.length && COUNTRIES.length > 0}>
              Select All
            </Checkbox>
          </Option>
          {COUNTRIES.map((country) => (
            <Option key={country} value={country} label={country}>
              <Checkbox checked={filters.country.includes(country)}>{country}</Checkbox>
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} flex='1 1 220px' style={{ minWidth: 220 }}>
        <div style={{ fontSize: 14, marginBottom: 4, color: '#666' }}>Type</div>
        <Select
          mode='multiple'
          allowClear
          size='large'
          value={filters.type}
          onChange={(values) => onChange('type', values || [])}
          style={{ width: '100%', fontSize: 13 }}
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
            <Checkbox checked={filters.type.length === TYPES.length && TYPES.length > 0}>
              Select All
            </Checkbox>
          </Option>
          {TYPES.map((type) => (
            <Option key={type} value={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
              <Checkbox checked={filters.type.includes(type)}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Checkbox>
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} flex='1 1 220px' style={{ minWidth: 220 }}>
        <div style={{ fontSize: 14, marginBottom: 4, color: '#666' }}>Size</div>
        <Select
          mode='multiple'
          allowClear
          size='large'
          value={filters.size}
          onChange={(values) => onChange('size', values || [])}
          style={{ width: '100%', fontSize: 13 }}
          placeholder='All Sizes'
          optionLabelProp='label'
          menuItemSelectedIcon={() => null}
          dropdownRender={(menu) => (
            <div role='presentation' onPointerDown={(e) => e.preventDefault()}>
              {menu}
            </div>
          )}
        >
          <Option key='all' value='all' label='Select All'>
            <Checkbox checked={filters.size.length === SIZES.length && SIZES.length > 0}>
              Select All
            </Checkbox>
          </Option>
          {SIZES.map((size) => (
            <Option key={size} value={size} label={size.charAt(0).toUpperCase() + size.slice(1)}>
              <Checkbox checked={filters.size.includes(size)}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </Checkbox>
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} flex='1 1 220px' style={{ minWidth: 220 }}>
        <div style={{ fontSize: 14, marginBottom: 4, color: '#666' }}>Broad Field</div>
        <Select
          mode='multiple'
          allowClear
          size='large'
          value={filters.academicFields}
          onChange={(values) => onChange('academicFields', values || [])}
          style={{ width: '100%', fontSize: 13 }}
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
                filters.academicFields.length === FIELD_OPTIONS.length && FIELD_OPTIONS.length > 0
              }
            >
              Select All
            </Checkbox>
          </Option>
          {FIELD_OPTIONS.map((field) => (
            <Option key={field.value} value={field.value} label={field.label}>
              <Checkbox checked={filters.academicFields.includes(field.value)}>
                {field.label}
              </Checkbox>
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} flex='1 1 220px' style={{ minWidth: 220 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 14,
            marginBottom: 4,
            color: '#666',
          }}
        >
          <span>Sort by</span>
          {showReset && (
            <button
              onClick={onReset}
              style={{
                color: '#FF6600',
                cursor: 'pointer',
                fontSize: 13,
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
          )}
        </div>
        <ConfigProvider theme={{ token: { fontSize: 12 } }}>
          <Select
            value={sortBy}
            onChange={(v) => onSortChange(v as SortValue)}
            size='large'
            style={{ width: '100%', fontSize: 12 }}
            className='!text-xs'
          >
            {sortOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </ConfigProvider>
      </Col>
    </Row>
  );
};

const FilterSection = React.memo(FilterSectionComponent);
FilterSection.displayName = 'FilterSection';
(FilterSection as any).propTypes = {
  filters: PropTypes.shape({
    country: PropTypes.arrayOf(PropTypes.string).isRequired,
    region: PropTypes.arrayOf(PropTypes.string).isRequired,
    type: PropTypes.arrayOf(PropTypes.string).isRequired,
    size: PropTypes.arrayOf(PropTypes.string).isRequired,
    academicFields: PropTypes.arrayOf(PropTypes.string).isRequired,
    search: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  sortBy: PropTypes.oneOf(['rank-asc', 'rank-desc']).isRequired,
  onSortChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  showReset: PropTypes.bool.isRequired,
};

/**
 * Page component
 */
const UniversityListPage: React.FC = () => {
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);

  // State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [universityData, setUniversityData] = useState<UniversityApiResponse>();
  const [currentUniversityData, setCurrentUniversityData] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FiltersState>({
    country: [],
    region: [],
    type: [],
    size: [],
    academicFields: [],
    search: [],
  });

  const debouncedFilters = useDebounce(filters, 400);
  const [sortBy, setSortBy] = useState<SortValue>('rank-asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBarKey, setSearchBarKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteType, setDeleteType] = useState<'single' | 'multiple'>('single');
  const [universityToDelete, setUniversityToDelete] = useState<University | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  // Derived
  const appliedFiltersForExport = useMemo(
    () => ({ ...filters, search: searchQuery ? [searchQuery] : [] }),
    [filters, searchQuery],
  );

  const hasActiveFilters = useMemo(
    () =>
      Object.values(filters).some((v) => Array.isArray(v) && v.some((x) => x && x.trim() !== '')) ||
      searchQuery.trim() !== '',
    [filters, searchQuery],
  );

  // Handlers
  const handleMultiFilterChange = useCallback((field: FilterKey, values: string[]) => {
    let newValues = values;

    if (field === 'country' || field === 'type' || field === 'size' || field === 'academicFields') {
      const allOptions =
        field === 'country'
          ? [...COUNTRIES]
          : field === 'type'
          ? [...TYPES]
          : field === 'size'
          ? [...SIZES]
          : FIELD_OPTIONS.map((o) => o.value);

      if (values.includes('all')) {
        newValues = values.length === 1 ? allOptions : values.filter((v) => v !== 'all');
      }
    }
    setFilters((prev) => ({ ...prev, [field]: newValues }));
    setCurrentPage(1);
  }, []);

  const commitSearch = useCallback((val: string) => {
    const safe = sanitizeSearch(val);
    setSearchQuery(safe);
    setFilters((prev) => ({ ...prev, search: safe ? [safe] : [] }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ country: [], region: [], type: [], size: [], academicFields: [], search: [] });
    setSearchQuery('');
    setSearchBarKey((k) => k + 1);
    setCurrentPage(1);
    setSelectedRowKeys([]);
  }, []);

  const removeFilter = useCallback((field: FilterKey, value?: string) => {
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
  }, []);

  const showDeleteModal = useCallback((type: 'single' | 'multiple', university?: University) => {
    setDeleteType(type);
    setUniversityToDelete(university || null);
    setDeleteModalVisible(true);
  }, []);

  const handleEdit = useCallback(
    (universityId: string) => navigate(`/edit-university/${universityId}`),
    [navigate],
  );

  const handleExport = useCallback(async () => {
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
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
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
      setDeleting(false);
      setDeleteModalVisible(false);
      setUniversityToDelete(null);
    }
  }, [deleteType, selectedRowKeys, universityToDelete]);

  const handlePaginationChange = useCallback((page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Row click support
  const makeRowHandlers = useCallback(
    (record: University) => ({
      onClick: (e: React.MouseEvent<HTMLTableRowElement>) => {
        const target = e.target as HTMLElement;
        if (isInteractiveElement(target)) return;
        handleEdit(record.id);
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>) => {
        if (
          (e.key === 'Enter' || e.key === ' ') &&
          !isInteractiveElement(e.target as HTMLElement)
        ) {
          e.preventDefault();
          handleEdit(record.id);
        }
      },
    }),
    [handleEdit],
  );

  // Data fetch
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
        paramsSerializer: buildParams,
      });
      setCurrentUniversityData(response.data.data);
      setUniversityData(response.data);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || (err as any).message || ''
        : '';
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

  // Responsive flag
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Scroll to top on page change (extra guard)
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

  // Filter + search
  const filteredUniversities = useMemo(() => {
    const s = searchQuery.toLowerCase();
    return currentUniversityData.filter((u) => {
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
  }, [currentUniversityData, filters, searchQuery]);

  const sortedUniversities = useMemo(() => {
    const clone = [...filteredUniversities];
    return sortBy === 'rank-asc'
      ? clone.sort((a, b) => a.rank - b.rank)
      : sortBy === 'rank-desc'
      ? clone.sort((a, b) => b.rank - a.rank)
      : clone;
  }, [filteredUniversities, sortBy]);

  const getActiveFilters = useCallback(() => {
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
    if (searchQuery.trim() !== '')
      active.push({ key: 'search', label: 'Search', value: searchQuery });
    return active;
  }, [filters, searchQuery]);

  // Columns
  const columns: ColumnsType<University> = useMemo(
    () => [
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
          <Tag
            color={type === 'public' ? 'geekblue' : 'cyan'}
            style={{ fontSize: '12px', border: 'none' }}
          >
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
                ? 'magenta'
                : size === 'medium'
                ? 'cyan'
                : size === 'large'
                ? 'geekblue'
                : 'purple'
            }
            style={{ fontSize: '12px', border: 'none' }}
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
              FIELD_OPTIONS.findIndex((opt) => opt.value === a) -
              FIELD_OPTIONS.findIndex((opt) => opt.value === b),
          );
          const labels = sortedFields.map(getFieldNameLabel);
          const first = labels[0];
          const rest = labels.length - 1;

          return (
            <Space direction='horizontal' style={{ display: 'flex', alignItems: 'center' }}>
              {first && (
                <p className='flex text-sm !w-fit !text-gray-500 !font-medium !leading-none !whitespace-nowrap'>
                  {first}
                </p>
              )}
              {rest > 0 && (
                <Tag
                  color='white'
                  style={{ fontSize: '11px', color: '#000', borderColor: '#FF6600' }}
                >
                  + {rest}
                </Tag>
              )}
            </Space>
          );
        },
      },
      {
        title: (
          <Space className='flex justify-end text-right'>
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
              <Button type='text' icon={<MoreOutlined size={16} />} />
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
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(record.id);
              }}
              style={{ color: PRIMARY }}
            />
            <Button
              type='text'
              icon={<DeleteOutlined style={{ fontSize: '18px' }} />}
              onClick={(e) => {
                e.stopPropagation();
                showDeleteModal('single', record);
              }}
              style={{ color: PRIMARY }}
            />
          </Space>
        ),
      },
    ],
    [dropdownVisible, handleEdit, showDeleteModal],
  );

  // Error screen
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
                style={{ backgroundColor: PRIMARY, borderColor: PRIMARY }}
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
                  <SearchBar key={searchBarKey} placeholder='Search' onSearch={commitSearch} />
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
                        backgroundColor: PRIMARY,
                        borderColor: PRIMARY,
                        width: isMobile ? '100%' : 'auto',
                        border: `solid 1px ${PRIMARY}`,
                        height: 36,
                      }}
                    >
                      Create
                    </Button>
                    <Button
                      icon={<ExportOutlined />}
                      onClick={() => setIsExportModalOpen(true)}
                      style={{
                        backgroundColor: PRIMARY,
                        borderColor: PRIMARY,
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

            {!isMobile && (
              <FilterSection
                filters={filters}
                onChange={handleMultiFilterChange}
                isMobile={isMobile}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onReset={handleResetFilters}
                showReset={hasActiveFilters}
              />
            )}

            {hasActiveFilters && (
              <Row style={{ marginBottom: 16 }}>
                <Col span={24}>
                  <Space wrap>
                    {getActiveFilters().map((f) => (
                      <Tag
                        key={`${f.key}-${f.value}`}
                        closable
                        onClose={() => removeFilter(f.key, f.itemValue)}
                        closeIcon={<CloseOutlined />}
                        style={{
                          background: '#FEF7E6',
                          color: '#FF923E',
                          border: '1px solid #FF923E',
                          fontSize: 12,
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

            <ConfigProvider
              theme={{
                components: {
                  Table: {
                    headerSplitColor: '#F2F3F5',
                    fontWeightStrong: 600,
                    fontSize: 14,
                  },
                },
              }}
            >
              <Table
                columns={columns}
                dataSource={sortedUniversities}
                rowKey='id'
                onRow={(record) => makeRowHandlers(record)}
                rowClassName={() => 'clickable-row'}
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
                          const totalPages = Math.ceil(
                            (universityData?.totalCount || 0) / pageSize,
                          );
                          const baseStyle: React.CSSProperties = {
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'color 0.2s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          };
                          const clickTo = (newPage: number) => {
                            setCurrentPage(newPage);
                            setTimeout(() => {
                              topRef.current?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                              });
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }, 100);
                          };

                          if (type === 'prev') {
                            const disabled = currentPage === 1;
                            return (
                              <span
                                role='button'
                                tabIndex={disabled ? -1 : 0}
                                style={{ ...baseStyle, color: disabled ? '#d9d9d9' : PRIMARY }}
                                onClick={() => !disabled && clickTo(currentPage - 1)}
                                aria-disabled={disabled}
                                onKeyDown={(e) => {
                                  if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                                    e.preventDefault();
                                    clickTo(currentPage - 1);
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
                                style={{ ...baseStyle, color: disabled ? '#d9d9d9' : PRIMARY }}
                                onClick={() => !disabled && clickTo(currentPage + 1)}
                                aria-disabled={disabled}
                                onKeyDown={(e) => {
                                  if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                                    e.preventDefault();
                                    clickTo(currentPage + 1);
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
                                  color: PRIMARY,
                                  fontWeight: isCurrent ? 'bold' : 500,
                                }}
                                onClick={() => !isCurrent && clickTo(page)}
                                aria-current={isCurrent ? 'page' : undefined}
                                onKeyDown={(e) => {
                                  if (!isCurrent && (e.key === 'Enter' || e.key === ' ')) {
                                    e.preventDefault();
                                    clickTo(page);
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
                          fontSize: '12px',
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
            </ConfigProvider>
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
            <FilterSection
              filters={filters}
              onChange={handleMultiFilterChange}
              isMobile={isMobile}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onReset={handleResetFilters}
              showReset={hasActiveFilters}
            />
          </div>
          <Space direction='vertical' style={{ width: '100%', marginTop: 16 }} size='middle'>
            {hasActiveFilters && (
              <Button onClick={handleResetFilters} style={{ color: PRIMARY, borderColor: PRIMARY }}>
                Reset Filters
              </Button>
            )}
            <Button
              type='primary'
              onClick={() => setFilterDrawerVisible(false)}
              style={{ backgroundColor: PRIMARY, borderColor: PRIMARY }}
            >
              Apply
            </Button>
          </Space>
        </Drawer>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          open={deleteModalVisible}
          deleteType={deleteType === 'multiple' ? 'bulk' : 'single'}
          universityToDelete={
            universityToDelete ? { university: universityToDelete.university } : null
          }
          onCancel={() => setDeleteModalVisible(false)}
          onConfirm={handleDeleteConfirm}
          loading={deleting}
        />

        {/* Export Modal */}
        <ExportUniversityModal
          open={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          appliedFilters={appliedFiltersForExport}
          sortBy={getSortByLabel(sortBy)}
          sortOrder={sortBy}
        />

        {/* Row hover/active styles */}
        <style>{`
          .clickable-row { cursor: pointer; }
          .clickable-row:hover td { background: ${PRIMARY_BG_HOVER}; }
          .clickable-row:active td { background: ${PRIMARY_BG_ACTIVE}; }
        `}</style>
      </LayoutWrapper>
    </div>
  );
};

export default UniversityListPage;
