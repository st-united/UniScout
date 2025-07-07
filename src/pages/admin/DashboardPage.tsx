import axios from 'axios';
import { Filter, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
  LabelList,
  LabelProps,
} from 'recharts';

import AdminSearchFilter from '../../components/AdminSearchFilter';
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
};

const renderDot = (props: LabelProps, color: string) => {
  const { x, y } = props;
  return <circle cx={Number(x) + 6} cy={Number(y) + 1} r={6} fill={color} />;
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const DashboardPage = () => {
  const [summary, setSummary] = useState<{ universityCount: number; contactCount: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get('/dashboard/summary');
        setSummary({
          universityCount: res.data.universityCount,
          contactCount: res.data.contactCount,
        });
      } catch (error) {
        console.error('Error :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const [trafficData, setTrafficData] = useState<{ country: string; count: number }[]>([]);
  const [trafficLoading, setTrafficLoading] = useState(true);

  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        const res = await axios.get('/dashboard/country-distribution');
        setTrafficData(res.data);
      } catch (err) {
        console.error('Erreur chargement trafic par pays :', err);
      } finally {
        setTrafficLoading(false);
      }
    };

    fetchTraffic();
  }, []);
  type TopSearchItem = {
    name: string;
    logo?: string | null;
    country?: string;
    count: number;
  };
  const [topSearch, setTopSearch] = useState<TopSearchItem[]>([]);

  useEffect(() => {
    const fetchTopSearch = async () => {
      try {
        const res = await axios.get('/dashboard/top-searched');
        setTopSearch(res.data);
      } catch (error) {
        console.error('Erreur chargement top search :', error);
      }
    };

    fetchTopSearch();
  }, []);

  const totalTraffic = trafficData.reduce((sum, item) => sum + Number(item.count), 0);

  const trafficByLocation = trafficData.map((item) => ({
    name: item.country,
    value: Number(((Number(item.count) / totalTraffic) * 100).toFixed(1)),
  }));

  const [activeTab, setActiveTab] = React.useState('Manage University');
  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-gray-500'>Loading data...</p>
      </div>
    );
  }

  if (!summary || (!summary.universityCount && !summary.contactCount)) {
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
    <div className='flex min-h-screen bg-gray-50 flex-col px-5 '>
      {/* Sidebar on the left */}
      <AdminSearchFilter className='relative [&_.ant-input-affix-wrapper]:hidden p-absolute [&_.ant-dropdown-trigger]:absolute [&_.ant-dropdown-trigger]:top-4 [&_.ant-dropdown-trigger]:right-0 p-absolute' />

      {/* Main Content Area */}
      <div className='flex-1 py-3 px-auto overflow-y-auto w-full'>
        <div className='mb-6'>
          <h1 className='text-xl font-bold text-gray-800 mb-2'>Overview</h1>
        </div>

        {/* Top Stats */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          <div className='bg-blue-50 p-8 rounded-2xl border border-blue-100 h-18'>
            <h3 className='text-sm font-medium text-gray-600 mb-2'>Total of Universities</h3>
            <p className='text-4xl font-bold text-gray-900'>
              {summary.universityCount.toLocaleString()}
            </p>
          </div>
          <div className='bg-orange-50 p-8 rounded-2xl border border-orange-100 h-18'>
            <h3 className='text-sm font-medium text-gray-600 mb-2'>Total of Contact Request</h3>
            <p className='text-4xl font-bold text-gray-900'>{summary.contactCount}</p>
          </div>
        </div>
        {/* Charts Section */}
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6'>
          {/* Website Traffic - full width */}
          <div className='col-span-1 xl:col-span-3 bg-white p-6 rounded-lg shadow-sm border'>
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

          {/* Row for the two side-by-side charts */}

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
            {/* Track number of contact requests */}
            <div className='bg-white p-6 rounded-lg shadow-sm border'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold text-gray-800'>
                  Track number of contact requests
                </h3>
                <Filter className='w-4 h-4 text-gray-400' />
              </div>
              <ResponsiveContainer width='100%' height={200}>
                <BarChart data={dashboardData.requestData} barCategoryGap={10} barGap={4}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis dataKey='month' axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 200]} axisLine={false} tickLine={false} />
                  <Tooltip />

                  <Bar
                    dataKey='pending'
                    stackId='a'
                    fill='rgba(59, 130, 246, 1)'
                    barSize={12}
                  ></Bar>

                  <Bar dataKey='inProgress' stackId='a' fill='rgba(245, 158, 11, 1)' barSize={12} />
                  <Bar dataKey='completed' stackId='a' fill='rgba(16, 185, 129, 1)' barSize={12} />
                  <Bar
                    dataKey='rejected'
                    stackId='a'
                    fill='rgba(239, 68, 68, 1)'
                    radius={[0, 0, 0, 0]}
                    barSize={12}
                  />
                </BarChart>
              </ResponsiveContainer>

              <div className='flex justify-center space-x-6 mt-4'>
                <div className='flex items-center space-x-2'>
                  <div className='w-3 h-3 rounded-full bg-blue-500'></div>
                  <span className='text-xs text-gray-600'>Pending</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
                  <span className='text-xs text-gray-600'>In Progress</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <div className='w-3 h-3 rounded-full bg-green-500'></div>
                  <span className='text-xs text-gray-600'>Completed</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <div className='w-3 h-3 rounded-full bg-red-500'></div>
                  <span className='text-xs text-gray-600'>Rejected</span>
                </div>
              </div>
            </div>

            {/* Traffic by Location */}
            <div className='bg-white p-6 rounded-lg shadow-sm border'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold text-gray-800'>Traffic by Location</h3>
                <Filter className='w-4 h-4 text-gray-400' />
              </div>
              {trafficLoading ? (
                <p className='text-gray-500'>loading...</p>
              ) : (
                <div className='flex items-center justify-between'>
                  <div className='w-48 h-48'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={trafficByLocation}
                          cx='50%'
                          cy='50%'
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey='value'
                        >
                          {trafficByLocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='flex-1 ml-6 space-y-3'>
                    {trafficByLocation.map((item, index) => (
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
              )}
            </div>
          </div>

          {/* Top Search University - full width below, aligned left */}
          <div className='w-1/2 col-span-1 xl:col-span-1 bg-white p-6 rounded-lg shadow-sm border bg-gray-500'>
            <h3 className='text-lg font-semibold text-gray-800 mb-6'>Top Search University</h3>
            <div className='space-y-4'>
              {topSearch.map((item, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='text-lg font-bold text-gray-400'>#{index + 1}</div>
                    <div className='w-12 h-12 bg-red-600 rounded flex items-center justify-center flex-shrink-0'>
                      {item.logo ? (
                        <img
                          src={item.logo}
                          alt='University logo'
                          className='w-8 h-8 object-contain'
                        />
                      ) : (
                        <span className='text-white font-bold text-xs'>
                          {item.name.slice(0, 4).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className='font-medium text-gray-900 text-sm'>{item.name}</h4>
                      <p className='text-yellow-500 text-xs'>{item.country || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className='text-sm text-gray-500 font-medium'>
                    {item.count} search{item.count > 1 ? 'es' : ''}
                  </div>
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
