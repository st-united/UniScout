import { PlusOutlined, ExportOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
}

// Mock university data - replace with your actual universityData import
const mockUniversityData: University[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Stanford University ${i + 1}`,
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

  // State for university data
  const [currentUniversityData, setCurrentUniversityData] =
    useState<University[]>(mockUniversityData);
  const [loading] = useState(false);

  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    country: '',
    region: '',
    type: '',
    size: '',
    department: '',
    search: '',
  });

  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortBy, setSortBy] = useState('rank-desc');

  // Multi-select state
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Delete confirmation modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteType, setDeleteType] = useState<'single' | 'multiple'>('single');
  const [universityToDelete, setUniversityToDelete] = useState<University | null>(null);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchInput]);

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
    navigate(`/edit-university/${universityId}`);
  };

  const handleExport = () => {
    message.info('Export functionality will be implemented');
  };

  // Filter and sort data
  const filteredUniversities = currentUniversityData.filter((u) => {
    return (
      (!filters.country || u.location === filters.country) &&
      (!filters.region || u.region === filters.region) &&
      (!filters.department || u.department === filters.department) &&
      (!filters.type ||
        (filters.type === 'Public' || filters.type === 'Private'
          ? u.status === filters.type
          : u.type === filters.type)) &&
      (!filters.size || u.size === filters.size) &&
      (!filters.search || u.name.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  const sortedUniversities = [...filteredUniversities].sort((a, b) => {
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
  });

  // Get unique values for filter options
  const getUniqueValues = (key: keyof University) => {
    return [...new Set(currentUniversityData.map((u) => u[key]))].filter(Boolean);
  };

  // Table columns configuration
  const columns: ColumnsType<University> = [
    {
      title: 'University Name',
      dataIndex: 'name',
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
      dataIndex: 'location',
      key: 'location',
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
      dataIndex: 'department',
      key: 'department',
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

  return (
    <div style={{ padding: '24px', backgroundColor: '#FFFDF9', minHeight: '100vh' }}>
      <Card>
        {/* Filter Section */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={4}>
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

          <Col span={4}>
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

          <Col span={4}>
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

          <Col span={4}>
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

          <Col span={8}>
            <div
              style={{ fontSize: '12px', marginBottom: '4px', color: '#666', textAlign: 'right' }}
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

        {/* Header Section */}
        <Row justify='space-between' align='middle' style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4} style={{ margin: 0, color: '#333' }}>
              List of universities
            </Title>
          </Col>
          <Col>
            <Space>
              {selectedRowKeys.length > 0 && (
                <Button danger onClick={() => showDeleteModal('multiple')}>
                  Delete Selected ({selectedRowKeys.length})
                </Button>
              )}
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/create-university')}
                style={{ backgroundColor: '#ff7a00', borderColor: '#ff7a00' }}
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
                }}
              >
                Export
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={sortedUniversities.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize,
          )}
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
            total={sortedUniversities.length}
            pageSize={pageSize}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size || 12);
            }}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            pageSizeOptions={['12', '24', '48', '96']}
          />
        </Row>
      </Card>

      {/* Custom Delete Confirmation Modal */}
      <Modal
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={null}
        centered
        width={400}
        style={{
          borderRadius: '12px',
        }}
        bodyStyle={{
          padding: '32px',
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
              fontSize: '18px',
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
