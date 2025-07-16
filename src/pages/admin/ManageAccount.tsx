import { Table, Select } from 'antd';
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
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

interface Account {
  key: string;
  name: string;
  role: string;
  email: string;
  createdAt: string;
  status: 'Active' | 'Deactivated' | 'Blocked' | 'Pending';
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
        console.error('Error fetching overview stats:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/users');
        console.log('RESPONSE /users:', res.data);

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
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    fetchUsers();
  }, [currentPage, pageSize]);

  const columns: ColumnsType<Account> = [
    {
      title: 'NAME',
      dataIndex: 'name',
      key: 'name',
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
              getPopupContainer={(trigger) => trigger.parentNode}
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
    <div className='flex flex-1 flex-col px-4 py-6 overflow-x-hidden w-auto'>
      <div className='flex justify-end mb-4 flex-row gap-2'>
        <button
          onClick={() => setIsCreateOpen(true)}
          className='flex bg-[#FF7A00] text-white px-4 py-2 rounded-md font-medium shadow-lg hover:bg-[#e46b00] transition border-none items-center justify-center gap-1'
        >
          <Plus width={'15px'} height={'15px'} /> Create Account
        </button>
        <button
          onClick={() => setIsCreateOpen(true)}
          className='flex bg-[#FF7A00] text-white px-4 py-2 rounded-md font-medium shadow-lg hover:bg-[#e46b00] transition border-none items-center justify-center gap-1'
        >
          <ClipboardPaste width={'15px'} height={'15px'} /> Export
        </button>
      </div>

      <h3 className='my-5 text-lg font-semibold'>Overview</h3>

      <div className='flex flex-1 flex-wrap gap-2 mb-10 items-center justify-center'>
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex flex-wrap justify-between items-center rounded-xl px-0 sm:px-6 py-4 w-[150px] bg-white sm:scale-[1] scale-[0.8]`}
            style={{
              boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div className='flex flex-col items-start justify-center gap-1 w-1/2 h-[60px]'>
              <p className={`text-sm ${item.color} font-semibold`}>{item.label}</p>
              <p className='text-[28px] font-semibold text-gray-500'>{item.value}</p>
            </div>
            <div
              className={`flex h-[60px] w-[60px] items-center justify-center rounded-[23px] ${item.bg}`}
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
            setIsCreateOpen(false);
          } catch (error: any) {
            console.error('Error creating account:', error);
            alert(error.response?.data?.message || 'Failed to create account.');
          }
        }}
      />

      <Table
        columns={columns}
        dataSource={accounts}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalCount,
          onChange: (page) => setCurrentPage(page),
          position: ['bottomCenter'],
        }}
        scroll={{ x: '100%' }}
        bordered
        className='px-5'
      />
    </div>
  );
};

export default ManageAccount;
