import { ExclamationCircleOutlined, SearchOutlined, CloseCircleFilled } from '@ant-design/icons';
import {
  Table,
  Select,
  Modal,
  Input,
  Button,
  message,
  ConfigProvider,
  Checkbox,
  Tag,
  Spin,
} from 'antd';
import axios from 'axios';
import {
  Users,
  UserRoundCheck,
  UserRoundX,
  UserRoundMinus,
  UserSearch,
  ChevronDown,
  Plus,
  ClipboardPaste,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';

import CreateAccount from './modals/CreateAccount';
import ExportAccountModal from './modals/ExportAccountModal';
import AdminHeader from '../../components/AdminHeader';
import LayoutWrapper from '../../components/LayoutWrapper';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

interface Account {
  key: string;
  name: string;
  role: string;
  email: string;
  createdAt: string;
  status: string;
}

type Status = Account['status'];
const ALL_STATUSES: Status[] = ['Active', 'Blocked', 'Deactivated', 'Pending'];

const isForbiddenTransitionForSuperAdmin = (from: Status, to: Status) => {
  if (to === 'Pending' && from !== 'Pending') return true;
  if (from === 'Pending' && to === 'Blocked') return true;
  if (from === 'Deactivated' && to === 'Pending') return true;
  if (from === 'Blocked' && to === 'Pending') return true;
  return false;
};

const getVisibleTargets = (current: Status, isSuperAdmin: boolean): Status[] => {
  if (!isSuperAdmin) return ALL_STATUSES;
  return ALL_STATUSES.filter(
    (to) => to === current || !isForbiddenTransitionForSuperAdmin(current, to),
  );
};

const safeApplyStatus = (
  from: Status,
  to: Status,
  isSuperAdmin: boolean,
  onAllowed: () => void,
) => {
  if (isSuperAdmin && isForbiddenTransitionForSuperAdmin(from, to)) {
    message.warning('This status change is not allowed.');
    return;
  }
  onAllowed();
};

const ManageAccount: React.FC = () => {
  const [createAccountModal, setCreateAccountModal] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<{
    total: number;
    Active: number;
    Blocked: number;
    Deactivated: number;
    Pending: number;
  } | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Account | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const [showStatusWarning, setShowStatusWarning] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [jobRoles, setJobRoles] = useState<string[]>([]);

  // Search functionality
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter states
  const [filters, setFilters] = useState<{
    role: string[];
    status: string[];
  }>({
    role: [],
    status: [],
  });

  // Dropdown states
  const [roleDropdownVisible, setRoleDropdownVisible] = useState(false);
  const [statusDropdownVisible, setStatusDropdownVisible] = useState(false);
  const [roleDropdownRef, setRoleDropdownRef] = useState<HTMLDivElement | null>(null);
  const [statusDropdownRef, setStatusDropdownRef] = useState<HTMLDivElement | null>(null);

  const colorMap: Record<Account['status'], { text: string; bg: string }> = {
    Active: { text: '#00B69B', bg: 'rgba(0, 182, 155, 0.3)' },
    Deactivated: { text: '#6226EF', bg: 'rgba(98, 38, 239, 0.2)' },
    Blocked: { text: '#EF3826', bg: 'rgba(239, 56, 38, 0.2)' },
    Pending: { text: '#FFA756', bg: 'rgba(255, 167, 86, 0.3)' },
  };

  const mapBackendStatus = (status: string): Account['status'] => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'Active';
      case 'INACTIVE':
        return 'Deactivated';
      case 'BLOCKED':
        return 'Blocked';
      case 'PENDING':
        return 'Pending';
      default:
        return 'Pending';
    }
  };

  const mapStatusToAPI = (status: Account['status']): string => {
    switch (status) {
      case 'Active':
        return 'active';
      case 'Deactivated':
        return 'inactive';
      case 'Blocked':
        return 'blocked';
      case 'Pending':
        return 'pending';
      default:
        return 'pending';
    }
  };

  const mapRoleToAPI = (role: string): string => {
    // Map display role names to API job parameter
    return role;
  };

  // -- mount: job roles + stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await axios.get(
          'https://api.uniscout.dev.stunited.vn/api/dashboard/users-overview',
        );
        const data = res.data.data;
        setStats({
          total: data.totalUsers,
          Active: data.activeUsers,
          Blocked: data.blockedUsers,
          Deactivated: data.deactivatedUsers,
          Pending: data.pendingUsers,
        });
      } catch {
        message.error('Error fetching overview stats');
      } finally {
        setStatsLoading(false);
      }
    };

    const fetchJobRoles = async () => {
      try {
        const res = await axios.get('https://api.uniscout.dev.stunited.vn/api/users/job-roles');
        if (Array.isArray(res.data)) {
          setJobRoles(res.data);
        } else if (Array.isArray(res.data.data)) {
          setJobRoles(res.data.data);
        }
      } catch {
        setJobRoles([]);
      }
    };

    fetchJobRoles();
    fetchStats();
  }, []);

  // -- users: refetch when pagination/search/filters changent
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setTableLoading(true);
        const params: any = {};

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (filters.role.length > 0) {
          params.job = filters.role.map(mapRoleToAPI);
        }

        if (filters.status.length > 0) {
          params.status = filters.status.map(mapStatusToAPI);
        }

        const res = await axios.get('https://api.uniscout.dev.stunited.vn/api/users', {
          params,
          paramsSerializer: (params) => {
            const searchParams = new URLSearchParams();
            Object.keys(params).forEach((key) => {
              const value = params[key];
              if (Array.isArray(value)) {
                // For arrays, add each value as a separate parameter without brackets
                value.forEach((item) => searchParams.append(key, item));
              } else if (value !== undefined) {
                searchParams.append(key, value);
              }
            });
            return searchParams.toString();
          },
        });

        const users = res.data.data;
        const total = res.data.meta?.totalItems ?? users.length;

        const formattedUsers = users.map((user: any) => ({
          key: String(user.id),
          name: user.name,
          role: user.job ?? '-',
          email: user.email,
          createdAt: user.createdAt,
          status: mapBackendStatus(user.status),
        }));
        setAccounts(formattedUsers);
        setTotalCount(total);
      } catch {
        message.error('Error fetching users');
      } finally {
        setTableLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, pageSize, searchQuery, filters]);

  // === Full-screen initial loading: show one spinner until stats + table loaded once
  const [initialLoading, setInitialLoading] = useState(true);
  useEffect(() => {
    if (!statsLoading && !tableLoading) {
      setInitialLoading(false);
    }
  }, [statsLoading, tableLoading]);

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

  // Click outside handler to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is inside role dropdown or its trigger
      const roleTrigger = document.querySelector('[data-role-trigger]');
      const roleDropdown = document.querySelector('[data-role-dropdown]');
      const isRoleClick = roleTrigger?.contains(target) || roleDropdown?.contains(target);

      // Check if click is inside status dropdown or its trigger
      const statusTrigger = document.querySelector('[data-status-trigger]');
      const statusDropdown = document.querySelector('[data-status-dropdown]');
      const isStatusClick = statusTrigger?.contains(target) || statusDropdown?.contains(target);

      // Close dropdowns if click is outside
      if (!isRoleClick) {
        setRoleDropdownVisible(false);
      }
      if (!isStatusClick) {
        setStatusDropdownVisible(false);
      }

      // Additional check for clicks on table rows or other elements
      const tableElement = document.querySelector('.ant-table');
      if (tableElement?.contains(target) && !isRoleClick && !isStatusClick) {
        setRoleDropdownVisible(false);
        setStatusDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search handlers
  const handleSearchSubmit = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const clearSearchInput = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Filter handlers
  const handleFilterChange = (field: 'role' | 'status', values: string[]) => {
    setFilters((prev) => ({ ...prev, [field]: values }));
    if (currentPage !== 1) setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ role: [], status: [] });
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const removeFilter = (field: 'role' | 'status', value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field].filter((v) => v !== value),
    }));
    setCurrentPage(1);
  };

  const isSuperAdmin = true;

  const columns: ColumnsType<Account> = [
    {
      title: 'NAME',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text,
    },
    {
      title: (
        <div className='flex items-center gap-1 relative'>
          <span>ROLE</span>
          <div
            ref={setRoleDropdownRef}
            data-role-trigger
            role='button'
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setRoleDropdownVisible(!roleDropdownVisible);
              setStatusDropdownVisible(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setRoleDropdownVisible(!roleDropdownVisible);
                setStatusDropdownVisible(false);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <ChevronDown className='w-4 h-4 text-gray-400' />
          </div>
          {roleDropdownVisible && (
            <div
              data-role-dropdown
              style={{
                position: 'fixed',
                top: 'auto',
                left: 'auto',
                transform: 'none',
                zIndex: 9999,
                backgroundColor: 'white',
                border: '1px solid #e8e8e8',
                borderRadius: '8px',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12), 0 3px 6px rgba(0, 0, 0, 0.08)',
                minWidth: '220px',
                maxWidth: '280px',
                padding: '8px',
                animation: 'dropdownFadeIn 0.2s ease-out',
              }}
              ref={(el) => {
                if (el && roleDropdownRef) {
                  const rect = roleDropdownRef.getBoundingClientRect();
                  const viewportHeight = window.innerHeight;
                  const dropdownHeight = 200; // Approximate height

                  // Position the dropdown below the trigger
                  el.style.left = `${rect.left + rect.width / 2}px`;
                  el.style.top = `${rect.bottom + 8}px`;
                  el.style.transform = 'translateX(-50%)';

                  // Check if dropdown would go below viewport
                  if (rect.bottom + dropdownHeight > viewportHeight) {
                    // Position above the trigger instead
                    el.style.top = `${rect.top - dropdownHeight - 8}px`;
                  }
                }
              }}
            >
              <div
                style={{
                  maxHeight: '160px',
                  overflowY: 'auto',
                }}
              >
                {jobRoles.map((role) => (
                  <div
                    key={role}
                    role='button'
                    tabIndex={0}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background-color 0.15s ease',
                      marginBottom: '2px',
                      fontSize: '14px',
                      lineHeight: '1.4',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const newRoles = filters.role.includes(role)
                        ? filters.role.filter((r) => r !== role)
                        : [...filters.role, role];
                      handleFilterChange('role', newRoles);
                      setRoleDropdownVisible(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const newRoles = filters.role.includes(role)
                          ? filters.role.filter((r) => r !== role)
                          : [...filters.role, role];
                        handleFilterChange('role', newRoles);
                        setRoleDropdownVisible(false);
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Checkbox
                      checked={filters.role.includes(role)}
                      style={{
                        marginRight: 0,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#333',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
      dataIndex: 'role',
      key: 'role',
      render: (text: string) => text,
    },
    {
      title: 'EMAIL',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'CREATE TIME',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => {
        const d = new Date(date);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
          d.getHours(),
        )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      },
    },
    {
      title: (
        <div className='flex items-center gap-1 relative'>
          <span>STATUS</span>
          <div
            ref={setStatusDropdownRef}
            data-status-trigger
            role='button'
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setStatusDropdownVisible(!statusDropdownVisible);
              setRoleDropdownVisible(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setStatusDropdownVisible(!statusDropdownVisible);
                setRoleDropdownVisible(false);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <ChevronDown className='w-4 h-4 text-gray-400' />
          </div>
          {statusDropdownVisible && (
            <div
              data-status-dropdown
              style={{
                position: 'fixed',
                top: 'auto',
                left: 'auto',
                transform: 'none',
                zIndex: 9999,
                backgroundColor: 'white',
                border: '1px solid #e8e8e8',
                borderRadius: '8px',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12), 0 3px 6px rgba(0, 0, 0, 0.08)',
                minWidth: '180px',
                maxWidth: '220px',
                padding: '8px',
                animation: 'dropdownFadeIn 0.2s ease-out',
              }}
              ref={(el) => {
                if (el && statusDropdownRef) {
                  const rect = statusDropdownRef.getBoundingClientRect();
                  const viewportHeight = window.innerHeight;
                  const dropdownHeight = 200; // Approximate height

                  // Position the dropdown below the trigger
                  el.style.left = `${rect.left + rect.width / 2}px`;
                  el.style.top = `${rect.bottom + 8}px`;
                  el.style.transform = 'translateX(-50%)';

                  // Check if dropdown would go below viewport
                  if (rect.bottom + dropdownHeight > viewportHeight) {
                    // Position above the trigger instead
                    el.style.top = `${rect.top - dropdownHeight - 8}px`;
                  }
                }
              }}
            >
              <div
                style={{
                  maxHeight: '160px',
                  overflowY: 'auto',
                }}
              >
                {Object.keys(colorMap).map((status) => (
                  <div
                    key={status}
                    role='button'
                    tabIndex={0}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background-color 0.15s ease',
                      marginBottom: '2px',
                      fontSize: '14px',
                      lineHeight: '1.4',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const newStatuses = filters.status.includes(status)
                        ? filters.status.filter((s) => s !== status)
                        : [...filters.status, status];
                      handleFilterChange('status', newStatuses);
                      setStatusDropdownVisible(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const newStatuses = filters.status.includes(status)
                          ? filters.status.filter((s) => s !== status)
                          : [...filters.status, status];
                        handleFilterChange('status', newStatuses);
                        setStatusDropdownVisible(false);
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Checkbox
                      checked={filters.status.includes(status)}
                      style={{
                        marginRight: 0,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#333',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
      dataIndex: 'status',
      key: 'status',
      render: (status: Account['status'], record: Account) => {
        const handleChange = (value: Account['status']) => {
          setAccounts((prev) =>
            prev.map((acc) => (acc.key === record.key ? { ...acc, status: value } : acc)),
          );
        };

        const { text, bg } = colorMap[status];
        const visibleOptions = getVisibleTargets(status, isSuperAdmin);

        return (
          <div
            className='flex items-center justify-center rounded-md'
            style={{ backgroundColor: bg }}
          >
            <Select
              value={status}
              open={false}
              onChange={handleChange}
              bordered={false}
              dropdownStyle={{
                backgroundColor: '#ffffff',
                borderRadius: 8,
              }}
              className='!bg-transparent !border-none !outline-none !shadow-none !text-sm w-full text-center'
              style={{
                backgroundColor: 'transparent',
                color: text,
                fontWeight: 600,
              }}
              getPopupContainer={(trigger: HTMLElement) => trigger.parentNode as HTMLElement}
            >
              {visibleOptions.map((opt) => (
                <Option key={opt} value={opt}>
                  <span
                    className='text-sm font-bold'
                    style={{
                      color: opt === status ? colorMap[opt].text : '#000',
                      fontWeight: opt === status ? 600 : 400,
                    }}
                  >
                    {opt}
                  </span>
                </Option>
              ))}
            </Select>
          </div>
        );
      },
    },
  ];

  const items = [
    {
      label: 'Total User',
      value: stats?.total ?? 0,
      icon: <Users className='w-6 h-6 text-[#8280FF]' />,
      bg: 'bg-[#8280FF]/20',
      color: 'text-[#8280FF]',
    },
    {
      label: 'Active',
      value: stats?.Active ?? 0,
      icon: <UserRoundCheck className='w-6 h-6 text-[#00B69B]' />,
      bg: 'bg-[#00B69B]/20',
      color: 'text-[#00B69B]',
    },
    {
      label: 'Blocked',
      value: stats?.Blocked ?? 0,
      icon: <UserRoundX className='w-6 h-6 text-[#EF3826]' />,
      bg: 'bg-[#EF3826]/20',
      color: 'text-[#EF3826]',
    },
    {
      label: 'Deactivated',
      value: stats?.Deactivated ?? 0,
      icon: <UserRoundMinus className='w-6 h-6 text-[#6226EF]' />,
      bg: 'bg-[#6226EF]/20',
      color: 'text-[#6226EF]',
    },
    {
      label: 'Pending',
      value: stats?.Pending ?? 0,
      icon: <UserSearch className='w-6 h-6 text-[#FFA756]' />,
      bg: 'bg-[#FFA756]/20',
      color: 'text-[#FFA756]',
    },
  ];

  const currentStatus = selectedUser?.status as Status | undefined;
  const visibleEditOptions = currentStatus
    ? getVisibleTargets(currentStatus, isSuperAdmin)
    : ALL_STATUSES;

  // Full-screen initial spinner (single loading at page load)
  if (initialLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fffff', minHeight: '100vh' }}>
      <style>
        {`
          @keyframes dropdownFadeIn {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        `}
      </style>
      <AdminHeader />
      <LayoutWrapper>
        <div ref={topRef} className='flex flex-1 flex-col lg:pl-8 py-6 overflow-x-hidden w-auto '>
          <div className='flex flex-col md:flex-row justify-between mb-4 gap-4'>
            {/* Search Bar */}
            <div style={{ width: '100%', maxWidth: 600 }}>
              <div style={{ display: 'flex', height: 40 }}>
                <Input
                  placeholder='Search accounts...'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
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
                {searchInput && (
                  <Button
                    type='text'
                    icon={<CloseCircleFilled style={{ fontSize: '12px', color: '#999' }} />}
                    onClick={clearSearchInput}
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
                  onClick={handleSearchSubmit}
                  style={{
                    backgroundColor: '#ff7a00',
                    border: '1px solid #d9d9d9',
                    borderRadius: searchInput ? '0 8px 8px 0' : '0 8px 8px 0',
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

            {/* Action Buttons */}
            <div className='flex gap-2'>
              <button
                onClick={() => setIsCreateOpen(true)}
                className='flex bg-[#FF7A00] text-white px-5 py-3 rounded-md font-medium shadow-lg hover:bg-[#e46b00] transition border-none items-center justify-center gap-1'
              >
                <Plus width={'15px'} height={'15px'} /> Create
              </button>
              <button
                onClick={() => setIsExportOpen(true)}
                className='flex bg-[#FF7A00] text-white px-4 py-2 rounded-md font-medium shadow-lg hover:bg-[#e46b00] transition border-none items-center justify-center gap-1'
              >
                <ClipboardPaste width={'15px'} height={'15px'} /> Export
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.role.length > 0 || filters.status.length > 0 || searchQuery) && (
            <div className='mb-4'>
              <div className='flex items-center gap-2 flex-wrap'>
                {filters.role.map((role) => (
                  <Tag
                    key={`role-${role}`}
                    closable
                    onClose={() => removeFilter('role', role)}
                    style={{
                      backgroundColor: '#f7dac8',
                      borderColor: '#FF7012',
                      color: '#FF6600',
                      fontSize: '14px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    Role: {role}
                  </Tag>
                ))}
                {filters.status.map((status) => (
                  <Tag
                    key={`status-${status}`}
                    closable
                    onClose={() => removeFilter('status', status)}
                    style={{
                      backgroundColor: '#f7dac8',
                      borderColor: '#FF7012',
                      color: '#FF6600',
                      fontSize: '14px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    Status: {status}
                  </Tag>
                ))}
                {searchQuery && (
                  <Tag
                    closable
                    onClose={() => {
                      setSearchInput('');
                      setSearchQuery('');
                    }}
                    style={{
                      backgroundColor: '#f7dac8',
                      borderColor: '#FF7012',
                      color: '#FF6600',
                      fontSize: '14px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    Search: {searchQuery}
                  </Tag>
                )}
                <button
                  onClick={resetFilters}
                  style={{
                    color: '#ff7a00',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    background: 'none',
                    border: 'none',
                    padding: '4px 8px',
                    outline: 'none',
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}

          <h3 className='my-5 text-lg font-semibold'>Overview</h3>

          <div className='flex flex-wrap md:grid md:grid-cols-5 justify-center gap-6 md:gap-6 md:justify-between mb-10 m-none w-full box-border '>
            {items.map((item) => (
              <div
                key={item.label}
                className={`flex flex-wrap gap-2 justify-between items-center rounded-xl px-4 lg:px-6 py-6 min-w-[150px] md:min-w-[160px] lg:min-w-[120px] bg-white`}
                style={{
                  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.06)',
                }}
              >
                <div className='flex flex-col items-start justify-between  w-1/2 h-[50px] '>
                  <p className={`text-sm ${item.color} font-semibold`}>{item.label}</p>
                  <p className='text-[23px] lg:text-[28px] font-semibold'>{item.value}</p>
                </div>
                <div
                  className={`flex h-[50px] w-[50px] lg:h-[60px] lg:w-[60px] items-center justify-center rounded-[17px] lg:rounded-[23px] ${item.bg}`}
                >
                  {item.icon}
                </div>
              </div>
            ))}
          </div>

          <h3 className='mb-4 text-lg font-semibold'>List of Accounts</h3>

          <CreateAccount
            open={isCreateOpen}
            onCancel={() => setIsCreateOpen(false)}
            onSubmit={async (values) => {
              try {
                const payload = {
                  name: values.name,
                  email: values.email,
                  job: values.role,
                };
                await axios.post('https://api.uniscout.dev.stunited.vn/api/users', payload);

                // Refresh list
                const res = await axios.get('https://api.uniscout.dev.stunited.vn/api/users');
                const users = res.data.data;
                const total = res.data.meta?.totalItems ?? users.length;
                const formattedUsers = users.map((user: any) => ({
                  key: String(user.id),
                  name: user.name,
                  role: user.job ?? '-',
                  email: user.email,
                  createdAt: user.createdAt,
                  status: mapBackendStatus(user.status),
                }));

                setAccounts(formattedUsers);
                setTotalCount(total);

                message.success('Account created successfully');
                setIsCreateOpen(false);
              } catch (error: any) {
                message.error(error.response?.data?.message || 'Failed to create account');
              }
            }}
            jobRoles={jobRoles}
          />
          <ExportAccountModal
            open={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            appliedFilters={{
              status: filters.status,
              role: filters.role,
              job: filters.role,
              search: searchQuery ? [searchQuery] : [],
            }}
          />

          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#FF842B',
              },
            }}
          >
            <Table
              columns={columns}
              dataSource={accounts}
              loading={{
                spinning: tableLoading,
                indicator: <Spin size='large' />,
              }}
              rowKey='key'
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: totalCount,
                onChange: (page) => setCurrentPage(page),
                showSizeChanger: false,
                className: 'custom-pagination',
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
                        className='flex items-center justify-center'
                      >
                        <ChevronLeft className='w-5 h-5' /> Previous
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
                        className='flex items-center justify-center'
                      >
                        Next <ChevronRight className='w-5 h-5' />
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
              scroll={{ x: '100%' }}
              bordered={false}
              className='px-5'
              onRow={(record: Account) => ({
                onClick: () => {
                  setSelectedUser(record);
                  setIsModalOpen(true);
                  setIsEditMode(false);
                },
                style: { cursor: 'pointer' },
              })}
            />
          </ConfigProvider>
          <Modal
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
            centered
            width={650}
            bodyStyle={{ borderRadius: 20, padding: 8 }}
          >
            <h2
              style={{
                fontWeight: 600,
                fontSize: 24,
                marginBottom: 16,
                borderBottom: '2px solid #e67c3f',
                paddingBottom: 8,
              }}
            >
              Edit Account
            </h2>
            <div style={{ marginBottom: 10 }}>
              <label htmlFor='edit-account-name'>Name</label>
              <Input
                id='edit-account-name'
                value={selectedUser?.name}
                onChange={(e) => {
                  if (selectedUser) {
                    setSelectedUser({ ...selectedUser, name: e.target.value });
                  }
                }}
                disabled={!isEditMode}
                style={{
                  marginTop: 4,
                  marginBottom: 10,
                  background: !isEditMode ? '#eee' : undefined,
                  height: 44,
                  fontSize: 15,
                }}
                placeholder='Example'
              />
              <label htmlFor='edit-account-email'>Email</label>
              <Input
                id='edit-account-email'
                value={selectedUser?.email}
                onChange={(e) => {
                  if (selectedUser) {
                    setSelectedUser({ ...selectedUser, email: e.target.value });
                  }
                }}
                disabled={!isEditMode}
                style={{
                  marginTop: 4,
                  marginBottom: 10,
                  background: !isEditMode ? '#eee' : undefined,
                  height: 44,
                  fontSize: 15,
                }}
                placeholder='example@gmail.com'
              />
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor='edit-account-role'>Department</label>
                  <Select
                    id='edit-account-role'
                    value={selectedUser?.role}
                    disabled={!isEditMode}
                    onChange={(value: string) => {
                      if (selectedUser) {
                        setSelectedUser({ ...selectedUser, role: value });
                      }
                    }}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      background: !isEditMode ? '#eee' : undefined,
                      height: 44,
                      fontSize: 14,
                      borderRadius: !isEditMode ? 8 : undefined,
                    }}
                  >
                    {jobRoles.map((role) => (
                      <Select.Option key={role} value={role}>
                        {role}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor='edit-account-status'>Status</label>
                  <Select
                    id='edit-account-status'
                    value={selectedUser?.status}
                    disabled={!isEditMode}
                    onChange={(value: Status) => {
                      if (!selectedUser || !currentStatus) return;
                      safeApplyStatus(currentStatus, value, isSuperAdmin, () => {
                        if (isEditMode && value === 'Deactivated') {
                          setShowStatusWarning(true);
                        } else {
                          setSelectedUser({ ...selectedUser, status: value });
                        }
                      });
                    }}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      background: !isEditMode ? '#eee' : undefined,
                      height: 44,
                      fontSize: 14,
                      borderRadius: !isEditMode ? 8 : undefined,
                    }}
                  >
                    {visibleEditOptions.map((opt) => (
                      <Select.Option key={opt} value={opt}>
                        {opt}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              {!isEditMode ? (
                <Button
                  type='primary'
                  style={{ background: '#e67c3f', borderColor: '#e67c3f' }}
                  onClick={() => setIsEditMode(true)}
                >
                  Edit
                </Button>
              ) : (
                <Button
                  type='primary'
                  style={{ background: '#e67c3f', borderColor: '#e67c3f' }}
                  onClick={async () => {
                    if (!selectedUser) return;
                    setIsSaving(true);
                    const statusMap = {
                      Active: 'active',
                      Blocked: 'blocked',
                      Deactivated: 'inactive',
                      Pending: 'pending',
                    };
                    const from =
                      (accounts.find((a) => a.key === selectedUser.key)?.status as
                        | Status
                        | undefined) ?? (selectedUser.status as Status);
                    if (
                      isSuperAdmin &&
                      isForbiddenTransitionForSuperAdmin(from, selectedUser.status as Status)
                    ) {
                      message.warning('This status change is not allowed.');
                      setIsSaving(false);
                      return;
                    }
                    const payload = {
                      name: selectedUser.name,
                      email: selectedUser.email,
                      job: selectedUser.role,
                      status:
                        statusMap[selectedUser.status as keyof typeof statusMap] ||
                        selectedUser.status,
                    };
                    try {
                      await axios.patch(
                        `https://api.uniscout.dev.stunited.vn/api/users/${selectedUser.key}`,
                        payload,
                      );
                      setAccounts((prev) =>
                        prev.map((acc) =>
                          acc.key === selectedUser.key ? { ...acc, ...selectedUser } : acc,
                        ),
                      );
                      setIsEditMode(false);
                      setIsModalOpen(false);
                      message.success('User updated successfully');
                    } catch (err) {
                      message.error('Failed to update user');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>
          </Modal>
          <Modal
            open={showStatusWarning}
            onCancel={() => setShowStatusWarning(false)}
            footer={null}
            centered
            width={450}
            bodyStyle={{ borderRadius: 24, padding: 32, textAlign: 'center' }}
            maskClosable={false}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  background: '#FFF2F0',
                  borderRadius: '50%',
                  width: 100,
                  height: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px auto',
                }}
              >
                <ExclamationCircleOutlined style={{ color: '#EF3826', fontSize: 48 }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Warning</div>
              <div style={{ fontSize: 16, marginBottom: 32 }}>
                This action will disable the admin&apos;s access. Do you want to continue?
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                <Button
                  onClick={() => setShowStatusWarning(false)}
                  style={{
                    minWidth: 120,
                    background: '#fff',
                    border: '1px solid #ddd',
                    color: '#444',
                    borderRadius: 8,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type='primary'
                  style={{
                    minWidth: 120,
                    background: '#e67c3f',
                    borderColor: '#e67c3f',
                    borderRadius: 8,
                  }}
                  onClick={() => {
                    if (selectedUser) {
                      setSelectedUser({ ...selectedUser, status: 'Deactivated' });
                    }
                    setShowStatusWarning(false);
                  }}
                >
                  OK
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </LayoutWrapper>
    </div>
  );
};

export default ManageAccount;
