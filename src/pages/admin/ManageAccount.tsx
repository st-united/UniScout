import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Table, Select, Modal, Input, Button, message } from 'antd';
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
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import CreateAccount from './modals/CreateAccount';
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

const ManageAccount: React.FC = () => {
  const [createAccountModal, setCreateAccountModal] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [stats, setStats] = useState<{
    total: number;
    Active: number;
    Blocked: number;
    Deactivated: number;
    Pending: number;
  } | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Account | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showStatusWarning, setShowStatusWarning] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [jobRoles, setJobRoles] = useState<string[]>([]);

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/dashboard/users-overview');
        const data = res.data.data;
        setStats({
          total: data.totalUsers,
          Active: data.activeUsers,
          Blocked: data.blockedUsers,
          Deactivated: data.deactivatedUsers,
          Pending: data.pendingUsers,
        });
      } catch (error) {
        message.error('Error fetching overview stats');
      }
    };

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/users');

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
      } catch (error) {
        message.error('Error fetching users');
      } finally {
        setLoading(false);
      }
    };

    const fetchJobRoles = async () => {
      try {
        const res = await axios.get('/users/job-roles');
        if (Array.isArray(res.data)) {
          setJobRoles(res.data);
        } else if (Array.isArray(res.data.data)) {
          setJobRoles(res.data.data);
        }
      } catch (error) {
        setJobRoles([]);
      }
    };
    fetchJobRoles();

    fetchStats();
    fetchUsers();
  }, [currentPage, pageSize]);

  const columns: ColumnsType<Account> = [
    {
      title: 'NAME',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text,
    },
    {
      title: (
        <div className='flex items-center gap-1'>
          <span>ROLE</span>
          <ChevronDown className='w-4 h-4 text-gray-400' />
        </div>
      ),
      dataIndex: 'role',
      key: 'role',
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
    },
    {
      title: (
        <div className='flex items-center gap-1'>
          <span>STATUS</span>
          <ChevronDown className='w-4 h-4 text-gray-400' />
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

        return (
          <div
            className='flex items-center justify-center rounded-md'
            style={{ backgroundColor: bg }}
          >
            <Select
              value={status}
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
              onDropdownVisibleChange={(open: boolean) => {
                if (open) {
                  Modal.confirm({
                    title: 'Warning',
                    icon: <ExclamationCircleOutlined />,
                    content: (
                      <div style={{ fontSize: 16, marginBottom: 32 }}>
                        This action will disable the admin&apos;s access. Do you want to continue?
                      </div>
                    ),
                    okText: 'Yes',
                    cancelText: 'No',
                    onOk() {
                      console.log('OK');
                    },
                    onCancel() {
                      console.log('Cancel');
                    },
                  });
                }
              }}
            >
              {Object.entries(colorMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  <span
                    className='text-sm font-bold'
                    style={{
                      color: key === status ? value.text : '#000',
                      fontWeight: key === status ? 600 : 400,
                    }}
                  >
                    {key}
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

  if (loading || !stats) {
    return (
      <div className='flex justify-center items-center py-10'>
        <p className='text-gray-500'>Loading stats...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fffff', minHeight: '100vh' }}>
      <AdminHeader />
      <LayoutWrapper>
        <div className='flex flex-1 flex-col lg:pl-8 py-6 overflow-x-hidden w-auto '>
          <div className='flex justify-end mb-4 flex-row gap-2'>
            <button
              onClick={() => setIsCreateOpen(true)}
              className='flex bg-[#FF7A00] text-white px-5 py-3 rounded-md font-medium shadow-lg hover:bg-[#e46b00] transition border-none items-center justify-center gap-1'
            >
              <Plus width={'15px'} height={'15px'} /> Create
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className='flex bg-[#FF7A00] text-white px-4 py-2 rounded-md font-medium shadow-lg hover:bg-[#e46b00] transition border-none items-center justify-center gap-1'
            >
              <ClipboardPaste width={'15px'} height={'15px'} /> Export
            </button>
          </div>

          <h3 className='my-5 text-lg font-semibold'>Overview</h3>

          <div className='flex flex-wrap gap-2 lg:gap-6 mb-10 items-center justify-center m-none w-full '>
            {items.map((item) => (
              <div
                key={item.label}
                className={`flex flex-wrap gap-2 justify-between items-center rounded-xl px-4 lg:px-6 py-6 w-[130px] lg:w-[200px] bg-white`}
                style={{
                  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.06)',
                }}
              >
                <div className='flex flex-col items-start justify-between  w-1/2 h-[50px] '>
                  <p className={`text-sm ${item.color} font-semibold`}>{item.label}</p>
                  <p className='text-[23px] lg:text-[28px] font-semibold'>{item.value}</p>
                </div>
                <div
                  className={`flex h-[50px] w-[50px] lg:h-[70px] lg:w-[70px] items-center justify-center rounded-[17px] lg:rounded-[23px] ${item.bg}`}
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
                await axios.post('/users', payload);

                // Refresh list
                const res = await axios.get('/users');
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
          />

          <Table
            columns={columns}
            dataSource={accounts}
            loading={loading}
            rowKey='id'
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              onChange: (page: number) => setCurrentPage(page),
              position: ['bottomCenter'],
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
                  <label htmlFor='edit-account-role'>Role</label>
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
                    open={statusDropdownOpen}
                    onDropdownVisibleChange={(open: boolean) => {
                      if (isEditMode && open) {
                        setShowStatusWarning(true);
                      } else {
                        setStatusDropdownOpen(open);
                      }
                    }}
                    onChange={(value: string) => {
                      if (selectedUser) {
                        setSelectedUser({ ...selectedUser, status: value });
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
                    <Select.Option value='Active'>Active</Select.Option>
                    <Select.Option value='Blocked'>Blocked</Select.Option>
                    <Select.Option value='Deactivated'>Deactivated</Select.Option>
                    <Select.Option value='Pending'>Pending</Select.Option>
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
                    try {
                      await axios.patch(
                        `https://api.uniscout.dev.stunited.vn/api/users/${selectedUser.key}`,
                        {
                          name: selectedUser.name,
                          email: selectedUser.email,
                          job: selectedUser.role,
                          status: selectedUser.status?.toLowerCase(),
                        },
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
                    setShowStatusWarning(false);
                    setStatusDropdownOpen(true);
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
