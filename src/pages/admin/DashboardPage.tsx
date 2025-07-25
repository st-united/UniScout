import { Dropdown } from 'antd';
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
  Area,
} from 'recharts';

import AdminHeader from '../../components/AdminHeader';
import LayoutWrapper from '../../components/LayoutWrapper';
import Sidebar from '../../components/Sidebar';
import type { MenuProps } from 'antd';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const DashboardPage = () => {
  const [contactRequestData, setContactRequestData] = useState<any[]>([]);

  const fetchContactRequests = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();

      const months = Array.from({ length: now.getMonth() + 1 }, (_, i) => i + 1);

      const monthlyData = await Promise.all(
        months.map(async (month) => {
          const res = await axios.get(`/dashboard/contact-status?month=${month}&year=${year}`);

          const data = res.data || [];

          // Initialiser chaque statut à 0
          const statusCounts = {
            pending: 0,
            inProgress: 0,
            completed: 0,
            rejected: 0,
          };

          // Remplir selon les réponses de l’API
          data.forEach((entry: any) => {
            const key = entry.status.toLowerCase().replace(/\s+/g, '');
            if (Object.prototype.hasOwnProperty.call(statusCounts, key)) {
              statusCounts[key as keyof typeof statusCounts] = entry.count;
            }
          });

          return {
            month: new Date(2020, month - 1).toLocaleString('en-US', { month: 'short' }),
            ...statusCounts,
          };
        }),
      );

      setContactRequestData(monthlyData);
    } catch (err) {
      console.error('Erreur chargement requêtes contact :', err);
    }
  };

  useEffect(() => {
    fetchContactRequests();
  }, []);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  type TrafficView = 'thisYear' | 'lastYear' | 'both';
  const [trafficView, setTrafficView] = useState<TrafficView>('both');
  const [monthlyTrafficData, setMonthlyTrafficData] = useState<any[]>([]);

  const locationFilterItems: MenuProps['items'] = [{ key: 'all', label: 'All Regions' }];
  const filterMenuItems: MenuProps['items'] = [
    {
      key: '1',
      label: 'Last 7 days',
    },
    {
      key: '2',
      label: 'Last 30 days',
    },
    {
      key: '3',
      label: 'This Year',
    },
  ];

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
  const fetchMonthlyTrafficData = async (year: number) => {
    try {
      const now = new Date();
      const isCurrentYear = year === now.getFullYear();
      const currentMonth = isCurrentYear ? now.getMonth() + 1 : 12;

      const monthLabels = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const monthsToFetch = Array.from({ length: currentMonth }, (_, i) =>
        (i + 1).toString().padStart(2, '0'),
      );
      const allMonths = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

      const thisYearData = await Promise.all(
        monthsToFetch.map(async (month) => {
          const res = await axios.get(`/dashboard/visit-filter?month=${month}&year=${year}`);
          return Number(res.data) || 0;
        }),
      );

      const lastYearData = await Promise.all(
        allMonths.map(async (month) => {
          const res = await axios.get(`/dashboard/visit-filter?month=${month}&year=${year - 1}`);
          return Number(res.data) || 0;
        }),
      );

      const traffic = monthLabels.map((label, i) => ({
        month: label,
        thisYear: i < thisYearData.length ? thisYearData[i] : null,
        lastYear: lastYearData[i],
      }));

      setMonthlyTrafficData(traffic);
      console.log('monthlyTrafficData', traffic);
    } catch (err) {
      console.error('Erreur chargement données trafic :', err);
    }
  };

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
    location?: string;
    count: number;
  };
  const [topSearch, setTopSearch] = useState<TopSearchItem[]>([]);

  useEffect(() => {
    const fetchTopSearch = async () => {
      try {
        const res = await axios.get('/dashboard/top-searched');
        setTopSearch(res.data);
        console.log('Top Search Data:', res.data);
      } catch (error) {
        console.error('Erreur chargement top search :', error);
      }
    };

    fetchTopSearch();
  }, []);
  useEffect(() => {
    fetchMonthlyTrafficData(selectedYear);
  }, [selectedYear]);

  const totalTraffic = trafficData.reduce((sum, item) => sum + Number(item.count), 0);

  const trafficByLocation = trafficData.map((item) => ({
    name: item.country,
    value: Number(((Number(item.count) / totalTraffic) * 100).toFixed(1)),
  }));

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
    <div className='flex min-h-screen bg-gray-50 flex-col px-8 relative h-auto'>
      {/* Sidebar on the left */}
      <AdminHeader />
      <LayoutWrapper>
        {/* Main Content Area */}
        <div className='flex-1 py-3 px-auto  w-full'>
          <div className='mb-6'>
            <h1 className='text-xl font-bold text-gray-800 mb-2'>Overview</h1>
          </div>

          {/* Top Stats */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 flex-1'>
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
          <div className='grid grid-cols-1 gap-6 flex-1'>
            {/* Website Traffic - full width */}
            <div className='col-span-1 xl:col-span-3 bg-white p-0 rounded-xl shadow-sm border overflow-hidden mb-8 flex-1'>
              <div className=' relative py-10 bg-[#f9fafb] rounded-3xl'>
                {/* Title + Legend inside the chart */}
                <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-4'>
                  <div className='flex items-center space-x-4 text-sm font-medium text-gray-700 gap-8 px-4'>
                    <span className='text-orange-600 text-base font-semibold'>
                      Website traffic tracking
                    </span>
                    <span className='text-[#ccc] text-lg'>|</span>
                    <div className='flex items-center space-x-4'>
                      {(trafficView === 'thisYear' || trafficView === 'both') && (
                        <div className='flex items-center space-x-1'>
                          <span className='w-2 h-2 rounded-full bg-blue-500'></span>
                          <span className='text-sm'>This year</span>
                        </div>
                      )}
                      {(trafficView === 'lastYear' || trafficView === 'both') && (
                        <div className='flex items-center space-x-1'>
                          <span className='w-2 h-2 rounded-full bg-[#cbd5e1]'></span>
                          <span className='text-sm'>Last year</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'thisYear',
                          label: 'This year',
                          onClick: () => setTrafficView('thisYear'),
                        },
                        {
                          key: 'lastYear',
                          label: 'Last year',
                          onClick: () => setTrafficView('lastYear'),
                        },
                        { key: 'both', label: 'Both', onClick: () => setTrafficView('both') },
                      ],
                    }}
                    trigger={['click']}
                  >
                    <div className='flex items-center space-x-1 text-gray-500 text-sm cursor-pointer px-4'>
                      <Filter className='w-4 h-4' />
                      <span>
                        {trafficView === 'thisYear'
                          ? 'This year'
                          : trafficView === 'lastYear'
                          ? 'Last year'
                          : 'Both'}
                      </span>
                    </div>
                  </Dropdown>
                </div>

                <ResponsiveContainer width='100%' height={300}>
                  <ResponsiveContainer width='100%' height={300}>
                    <LineChart
                      data={monthlyTrafficData}
                      margin={{ top: 60, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id='colorTraffic' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='0%' stopColor='#ff7a00' stopOpacity={1} />
                          <stop offset='100%' stopColor='#ff7a00' stopOpacity={0.2} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                      <XAxis
                        dataKey='month'
                        tick={{ fill: '#F97316', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
                        tick={{ fill: '#F97316', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v >= 1000 ? v / 1000 + 'K' : v}`}
                      />

                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          const thisYear =
                            payload.find((p) => p.dataKey === 'thisYear')?.value ?? 0;
                          const lastYear =
                            payload.find((p) => p.dataKey === 'lastYear')?.value ?? 0;

                          return (
                            <div className='bg-white border border-gray-200 shadow-md rounded px-4 py-2 text-sm'>
                              <p className='font-semibold mb-1'>{label}</p>
                              <p className='text-orange-500'>
                                thisYear: {thisYear.toLocaleString()}
                              </p>
                              <p className='text-gray-400'>lastYear: {lastYear.toLocaleString()}</p>
                            </div>
                          );
                        }}
                      />

                      {trafficView !== 'lastYear' && (
                        <>
                          <Area
                            type='monotone'
                            dataKey='thisYear'
                            stroke='none'
                            fill='url(#colorTraffic)'
                          />
                          <Line
                            type='monotone'
                            dataKey='thisYear'
                            stroke='#3b82f6'
                            strokeWidth={2}
                            dot={false}
                          />
                        </>
                      )}

                      {trafficView !== 'thisYear' && (
                        <Line
                          type='monotone'
                          dataKey='lastYear'
                          stroke='#cbd5e1'
                          strokeWidth={2}
                          strokeDasharray='6 3'
                          dot={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* Row for the two side-by-side charts */}

          <div className='flex flex-col md:flex-row gap-6 w-auto justify-between mb-8 flex-1'>
            {/* Track number of contact requests */}
            <div className='bg-[#f9fafb] p-6 rounded-3xl shadow-sm border w-auto md:w-1/2 gap-6'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-base font-semibold text-gray-800'>
                  Track number of contact requests
                </h3>
                <Dropdown menu={{ items: filterMenuItems }} trigger={['click']}>
                  <div className='flex items-center space-x-1 text-gray-500 text-sm cursor-pointer px-4'>
                    <Filter className='w-4 h-4' />
                    <span>Filter</span>
                  </div>
                </Dropdown>
              </div>
              <ResponsiveContainer width='100%' height={200}>
                <BarChart data={contactRequestData} barCategoryGap={10} barGap={4}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis dataKey='month' axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis
                    domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                  />

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

              <div className='w-full flex justify-center mt-4'>
                <div className='flex flex-wrap justify-center items-center gap-x-6 gap-y-2'>
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
            </div>

            {/* Traffic by Location */}
            <div className='bg-[#f9fafb] p-6 rounded-3xl border w-auto md:w-1/2'>
              <div className='flex justify-between items-center mb-4 lg:px-5'>
                <h3 className='text-base font-semibold text-gray-800'>Traffic by Location</h3>
                <Dropdown menu={{ items: locationFilterItems }} trigger={['click']}>
                  <div className='flex items-center space-x-1 text-gray-500 text-sm cursor-pointer'>
                    <Filter className='w-4 h-4' />
                    <span>Filter</span>
                  </div>
                </Dropdown>
              </div>
              {trafficLoading ? (
                <p className='text-gray-500'>loading...</p>
              ) : (
                <div className='flex flex-col lg:flex-row items-center lg:items-start justify-around gap-6 '>
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
                  <div className='w-full lg:w-auto flex flex-col space-y-3'>
                    {trafficByLocation.map((item, index) => (
                      <div key={item.name} className='flex justify-between items-center space-x-24'>
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

          {/* Top Search University  */}
          <div className='flex flex-col bg-[#f9fafb] rounded-3xl p-6 shadow-sm border w-auto md:w-1/3'>
            <h3 className='text-base font-semibold text-gray-800 mb-6'>Top Search University</h3>

            <div className='flex flex-col gap-3'>
              {topSearch.map((item, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between bg-white p-4 rounded-xl border border-solid border-gray-300 hover:shadow-md transition-shadow cursor-pointer min-w-0'
                >
                  <div className='flex items-center gap-8 flex-grow min-w-0'>
                    {/* Rank */}
                    <div className='text-lg font-bold text-gray-500 shrink-0'>#{index + 1}</div>

                    {/* Logo */}
                    <div className='w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0'>
                      {item.logo ? (
                        <img
                          src={item.logo}
                          alt='University logo'
                          className='w-8 h-8 object-contain'
                        />
                      ) : (
                        <span className='text-xs font-bold text-gray-500'>
                          {item.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Name and location */}
                    <div className='flex flex-col min-w-0 '>
                      <h4 className='text-sm font-medium text-gray-900 underline truncate max-w-[160px] sm:max-w-full'>
                        {item.name}
                      </h4>
                      <p className='text-xs text-orange-500'>
                        {item.location || 'Unknown'}, {item.country || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className='w-4 h-4 text-gray-400 shrink-0' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </LayoutWrapper>
    </div>
  );
};

export default DashboardPage;
