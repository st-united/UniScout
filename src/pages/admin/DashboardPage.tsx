import { Filter, ChevronRight } from 'lucide-react';
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';

import Sidebar from '../../components/Sidebar';

// Mock data - replace with your actual data source
const dashboardData = {
  totalUniversities: 600,
  totalContactRequests: 156,
  trafficData: [
    { month: 'Jan', thisYear: 15000, lastYear: 12000 },
    { month: 'Feb', thisYear: 8000, lastYear: 18000 },
    { month: 'Mar', thisYear: 12000, lastYear: 16000 },
    { month: 'Apr', thisYear: 25000, lastYear: 14000 },
    { month: 'May', thisYear: 28000, lastYear: 20000 },
    { month: 'Jun', thisYear: 22000, lastYear: 24000 },
    { month: 'Jul', thisYear: 26000, lastYear: 22000 },
  ],
  requestData: [
    { month: 'Jan', pending: 80, inProgress: 60, completed: 40, rejected: 20 },
    { month: 'Feb', pending: 100, inProgress: 80, completed: 60, rejected: 30 },
    { month: 'Mar', pending: 90, inProgress: 100, completed: 80, rejected: 25 },
    { month: 'Apr', pending: 110, inProgress: 90, completed: 70, rejected: 35 },
    { month: 'May', pending: 160, inProgress: 120, completed: 90, rejected: 40 },
    { month: 'Jun', pending: 140, inProgress: 110, completed: 85, rejected: 30 },
    { month: 'Jul', pending: 180, inProgress: 130, completed: 100, rejected: 45 },
    { month: 'Aug', pending: 170, inProgress: 140, completed: 95, rejected: 38 },
    { month: 'Sep', pending: 120, inProgress: 100, completed: 80, rejected: 42 },
    { month: 'Oct', pending: 150, inProgress: 120, completed: 90, rejected: 35 },
    { month: 'Nov', pending: 130, inProgress: 110, completed: 85, rejected: 40 },
    { month: 'Dec', pending: 160, inProgress: 125, completed: 95, rejected: 45 },
  ],
  trafficByLocation: [
    { name: 'United States', value: 52.1, color: '#3B82F6' },
    { name: 'Viet Nam', value: 22.8, color: '#10B981' },
    { name: 'Australia', value: 13.9, color: '#F59E0B' },
    { name: 'Korea', value: 13.9, color: '#EF4444' },
    { name: 'Japan', value: 52.1, color: '#8B5CF6' },
    { name: 'India', value: 52.1, color: '#06B6D4' },
  ],
  topUniversities: [
    {
      rank: 1,
      name: 'Massachusetts Institute of Technology',
      location: 'London, United Kingdom',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/100px-MIT_logo.svg.png',
    },
    {
      rank: 2,
      name: 'Massachusetts Institute of Technology',
      location: 'London, United Kingdom',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/100px-MIT_logo.svg.png',
    },
    {
      rank: 3,
      name: 'Massachusetts Institute of Technology',
      location: 'London, United Kingdom',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/100px-MIT_logo.svg.png',
    },
    {
      rank: 4,
      name: 'Massachusetts Institute of Technology',
      location: 'London, United Kingdom',
      logo: null,
    },
    {
      rank: 5,
      name: 'Massachusetts Institute of Technology',
      location: 'London, United Kingdom',
      logo: null,
    },
  ],
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const DashboardPage = () => {
  const [activeTab, setActiveTab] = React.useState('Manage University');
  const hasData = dashboardData.totalUniversities > 0 || dashboardData.totalContactRequests > 0;

  if (!hasData) {
    return (
      <div className='flex items-center justify-center h-full bg-gray-50'>
        <div className='text-center'>
          <p className='text-xl text-gray-600'>No data available.</p>
          <p className='text-sm text-gray-400 mt-2'>
            University records will appear here once data is available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen bg-gray-50'>
      {/* Sidebar on the left */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className='flex-1 p-6 overflow-y-auto'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-gray-800 mb-2'>Overview</h1>
        </div>

        {/* Top Stats */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          <div className='bg-blue-50 p-6 rounded-lg border border-blue-100'>
            <h3 className='text-sm font-medium text-gray-600 mb-2'>Total of Universities</h3>
            <p className='text-3xl font-bold text-gray-900'>
              {dashboardData.totalUniversities.toLocaleString()}
            </p>
          </div>
          <div className='bg-orange-50 p-6 rounded-lg border border-orange-100'>
            <h3 className='text-sm font-medium text-gray-600 mb-2'>Total of Contact Request</h3>
            <p className='text-3xl font-bold text-gray-900'>{dashboardData.totalContactRequests}</p>
          </div>
        </div>

        {/* Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          {/* Traffic Line Chart */}
          <div className='bg-white p-6 rounded-lg shadow-sm border'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-orange-600'>Website traffic tracking</h3>
              <div className='flex items-center space-x-4'>
                <div className='flex items-center space-x-2'>
                  <div className='w-3 h-3 rounded-full bg-blue-500'></div>
                  <span className='text-sm text-gray-600'>This year</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <div className='w-3 h-3 rounded-full bg-gray-400'></div>
                  <span className='text-sm text-gray-600'>Last year</span>
                </div>
                <Filter className='w-4 h-4 text-gray-400' />
              </div>
            </div>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={dashboardData.trafficData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis dataKey='month' axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line
                  type='monotone'
                  dataKey='thisYear'
                  stroke='#3B82F6'
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type='monotone'
                  dataKey='lastYear'
                  stroke='#D1D5DB'
                  strokeWidth={2}
                  strokeDasharray='5 5'
                  dot={{ fill: '#D1D5DB', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Traffic by Location */}
          <div className='bg-white p-6 rounded-lg shadow-sm border'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-gray-800'>Traffic by Location</h3>
              <Filter className='w-4 h-4 text-gray-400' />
            </div>
            <div className='flex items-center justify-between'>
              <div className='w-48 h-48'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={dashboardData.trafficByLocation}
                      cx='50%'
                      cy='50%'
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey='value'
                    >
                      {dashboardData.trafficByLocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className='flex-1 ml-6 space-y-3'>
                {dashboardData.trafficByLocation.map((item, index) => (
                  <div key={item.name} className='flex justify-between items-center'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className='w-3 h-3 rounded-full'
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className='text-sm text-gray-700'>{item.name}</span>
                    </div>
                    <span className='text-sm font-medium text-gray-900'>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Bar Chart - Contact Requests */}
          <div className='bg-white p-6 rounded-lg shadow-sm border'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-gray-800'>
                Track number of contact requests
              </h3>
              <Filter className='w-4 h-4 text-gray-400' />
            </div>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={dashboardData.requestData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis dataKey='month' axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey='pending' fill='#3B82F6' name='Pending' />
                <Bar dataKey='inProgress' fill='#10B981' name='In Progress' />
                <Bar dataKey='completed' fill='#F59E0B' name='Completed' />
                <Bar dataKey='rejected' fill='#EF4444' name='Rejected' />
              </BarChart>
            </ResponsiveContainer>
            <div className='flex justify-center space-x-6 mt-4'>
              <div className='flex items-center space-x-2'>
                <div className='w-3 h-3 rounded-full bg-blue-500'></div>
                <span className='text-xs text-gray-600'>Pending</span>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='w-3 h-3 rounded-full bg-green-500'></div>
                <span className='text-xs text-gray-600'>In Progress</span>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
                <span className='text-xs text-gray-600'>Completed</span>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='w-3 h-3 rounded-full bg-red-500'></div>
                <span className='text-xs text-gray-600'>Rejected</span>
              </div>
            </div>
          </div>

          {/* Top Universities */}
          <div className='bg-white p-6 rounded-lg shadow-sm border'>
            <h3 className='text-lg font-semibold text-gray-800 mb-6'>Top Search University</h3>
            <div className='space-y-4'>
              {dashboardData.topUniversities.map((university) => (
                <div
                  key={university.rank}
                  className='flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='text-lg font-bold text-gray-400'>#{university.rank}</div>
                    <div className='w-12 h-12 bg-red-600 rounded flex items-center justify-center flex-shrink-0'>
                      {university.logo ? (
                        <img src={university.logo} alt='University logo' className='w-8 h-8' />
                      ) : (
                        <span className='text-white font-bold text-sm'>
                          {university.rank === 4 ? 'IMPERIAL' : 'MIT'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className='font-medium text-gray-900 text-sm'>{university.name}</h4>
                      <p className='text-yellow-500 text-xs'>{university.location}</p>
                    </div>
                  </div>
                  <ChevronRight className='w-5 h-5 text-gray-400' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
