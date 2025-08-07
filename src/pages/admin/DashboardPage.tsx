import {
  DatePicker,
  Space,
  Dropdown,
  Button,
  ConfigProvider,
  Select,
  Popover,
  message,
} from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
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
  Sector,
  BarChart,
  Bar,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';

import AdminHeader from '../../components/AdminHeader';
import LayoutWrapper from '../../components/LayoutWrapper';
import Sidebar from '../../components/Sidebar';
import type { MenuProps } from 'antd';

dayjs.extend(isSameOrBefore);
interface ActiveShapeProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  name: string;
  count: number;
}

const COLORS = ['#DE5512', '#96E2D6', '#2E4EAF', '#FD8278', '#91DBAF', '#FDC078'];

const DashboardPage = () => {
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredData, setHoveredData] = useState<{ name: string; count: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent, data: { name: string; count: number }) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    setPopoverPosition({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    setHoveredData(data);
  };

  const handleMouseLeave = () => {
    setPopoverPosition(null);
    setHoveredData(null);
    setActiveIndex(null);
  };
  const [contactRequestData, setContactRequestData] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const fetchContactRequests = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();

      const months = Array.from({ length: now.getMonth() + 1 }, (_, i) => i + 1);

      const monthlyData = await Promise.all(
        months.map(async (month) => {
          const res = await axios.get(`/dashboard/contact-status?month=${month}&year=${year}`);
          const data = res.data || [];
          const statusCounts = {
            pending: 0,
            inProgress: 0,
            completed: 0,
            rejected: 0,
          };
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
      const allMonths = Array.from({ length: 12 }, (_, i) => {
        const monthName = new Date(2020, i).toLocaleString('en-US', { month: 'short' });
        return {
          month: monthName,
          pending: 0,
          inProgress: 0,
          completed: 0,
          rejected: 0,
        };
      });

      const filledData = allMonths.map((m) => {
        const found = monthlyData.find((d) => d.month === m.month);
        return found || m;
      });

      setContactRequestData(filledData);
    } catch (err) {
      message.error('Failed to load contact requests data');
    }
  };

  useEffect(() => {
    fetchContactRequests();
  }, []);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  type TrafficView = 'thisYear' | 'lastYear' | 'both';
  const [trafficView, setTrafficView] = useState<TrafficView>('both');
  const [customStartDate, setCustomStartDate] = useState<dayjs.Dayjs | null>(null);
  const [customEndDate, setCustomEndDate] = useState<dayjs.Dayjs | null>(null);
  const [contactStartDate, setContactStartDate] = useState<dayjs.Dayjs | null>(null);
  const [contactEndDate, setContactEndDate] = useState<dayjs.Dayjs | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const [monthlyTrafficData, setMonthlyTrafficData] = useState<any[]>([]);
  const isCustomDateApplied = customStartDate && customEndDate;

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
        message.error('Error loading summary data');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);
  const fetchMonthlyTrafficData = async (yearToLoad: number, mode: TrafficView) => {
    try {
      const now = new Date();
      const currentMonth = yearToLoad === now.getFullYear() ? now.getMonth() + 1 : 12;

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
      const months = Array.from({ length: currentMonth }, (_, i) =>
        (i + 1).toString().padStart(2, '0'),
      );

      let thisYearData: number[] = [];
      let lastYearData: number[] = [];

      if (mode === 'thisYear' || mode === 'both') {
        thisYearData = await Promise.all(
          months.map(async (month) => {
            const res = await axios.get(
              `/dashboard/visit-filter?month=${month}&year=${yearToLoad}`,
            );
            return Number(res.data) || 0;
          }),
        );
      }

      if (mode === 'lastYear' || mode === 'both') {
        lastYearData = await Promise.all(
          Array.from({ length: 12 }, (_, i) => {
            const paddedMonth = (i + 1).toString().padStart(2, '0');
            return axios
              .get(`/dashboard/visit-filter?month=${paddedMonth}&year=${yearToLoad - 1}`)
              .then((res) => Number(res.data) || 0);
          }),
        );
      }

      const traffic = monthLabels.map((label, i) => {
        const thisVal = thisYearData[i] ?? null;
        const lastVal = lastYearData[i] ?? null;

        return {
          month: label,
          thisYear: thisVal,
          lastYear: lastVal,
          areaBase: thisVal !== null && lastVal !== null && thisVal > lastVal ? lastVal : 0,
        };
      });

      setMonthlyTrafficData(traffic);
    } catch (err) {
      message.error('Error loading monthly traffic data');
    }
  };

  const fetchMonthlyTrafficDataByDateRange = async (start: string, end: string) => {
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    const monthsInRange = [];

    let current = startDate.startOf('month');
    while (current.isSameOrBefore(endDate, 'month')) {
      monthsInRange.push({ year: current.year(), month: current.month() + 1 });
      current = current.add(1, 'month');
    }

    try {
      const data = await Promise.all(
        monthsInRange.map(async ({ year, month }) => {
          const [thisYearRes, lastYearRes] = await Promise.all([
            axios.get(`/dashboard/visit-filter?month=${month}&year=${year}`),
            axios.get(`/dashboard/visit-filter?month=${month}&year=${year - 1}`),
          ]);

          const thisVal = Number(thisYearRes.data) || 0;
          const lastVal = Number(lastYearRes.data) || 0;

          return {
            month: dayjs(`${year}-${month}-01`).format('MMM'),
            thisYear: thisVal,
            lastYear: lastVal,
            areaBase: thisVal > lastVal ? lastVal : null,
          };
        }),
      );

      setMonthlyTrafficData(data);
    } catch (error) {
      message.error('Error loading custom traffic data');
    }
  };

  const fetchFilteredContactRequests = async () => {
    if (!contactStartDate || !contactEndDate) return;

    const monthsInRange = [];
    let current = contactStartDate.startOf('month');
    const end = contactEndDate.endOf('month');

    while (current.isSameOrBefore(end, 'month')) {
      monthsInRange.push({ month: current.month() + 1, year: current.year() });
      current = current.add(1, 'month');
    }

    try {
      const monthlyData = await Promise.all(
        monthsInRange.map(async ({ month, year }) => {
          const params = new URLSearchParams();
          params.append('month', month.toString());
          params.append('year', year.toString());
          if (statusFilter) params.append('status', statusFilter);

          const res = await axios.get(`/dashboard/contact-status?${params.toString()}`);
          const data = res.data || [];

          const statusCounts = {
            pending: 0,
            inProgress: 0,
            completed: 0,
            rejected: 0,
          };

          data.forEach((entry: any) => {
            const key = entry.status.toLowerCase().replace(/\s+/g, '');
            if (key in statusCounts) {
              statusCounts[key as keyof typeof statusCounts] = entry.count || 0;
            }
          });

          return {
            month: dayjs(`${year}-${month}-01`).format('MMM'),
            ...statusCounts,
          };
        }),
      );

      setContactRequestData(monthlyData);
    } catch (err) {
      message.error('Error loading contact request status data');
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
        message.error('Error loading traffic by country data');
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
      } catch (error) {
        message.error('Error loading top search data');
      }
    };

    fetchTopSearch();
  }, []);
  useEffect(() => {
    fetchMonthlyTrafficData(selectedYear, trafficView);
  }, [selectedYear, trafficView]);

  const totalTraffic = trafficData.reduce((sum, item) => sum + Number(item.count), 0);

  const trafficByLocation = trafficData.map((item) => ({
    name: item.country,
    value: Number(((Number(item.count) / totalTraffic) * 100).toFixed(1)),
    count: item.count,
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
              <div className=' relative py-10 bg-[#F9F9FA] rounded-3xl'>
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
                          <span className='w-2 h-2 rounded-full bg-[#2F3F99]'></span>
                          <span className='text-sm'>This year</span>
                        </div>
                      )}
                      {(trafficView === 'lastYear' || trafficView === 'both') && (
                        <div className='flex items-center space-x-1'>
                          <span className='w-2 h-2 rounded-full bg-[#AEC7ED]'></span>
                          <span className='text-sm'>Last year</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ConfigProvider
                    theme={{
                      token: {
                        colorPrimary: '#FE7743',
                      },
                    }}
                  >
                    <Dropdown
                      dropdownRender={() => (
                        <div className='p-4 w-72 space-y-4 bg-white shadow-lg rounded-lg'>
                          {/* Quick options */}
                          <div className='w-full space-y-2'>
                            <div className='text-sm font-semibold text-gray-600'>
                              Quick Traffic View
                            </div>
                            <Select
                              value={trafficView}
                              onChange={(value) => {
                                setTrafficView(value as TrafficView);

                                if (value === 'thisYear') {
                                  fetchMonthlyTrafficData(currentYear, 'thisYear');
                                } else if (value === 'lastYear') {
                                  fetchMonthlyTrafficData(currentYear, 'lastYear');
                                } else {
                                  fetchMonthlyTrafficData(currentYear, 'both');
                                }
                              }}
                              className='w-full'
                              options={[
                                { label: 'This year', value: 'thisYear' },
                                { label: 'Last year', value: 'lastYear' },
                                { label: 'All', value: 'both' },
                              ]}
                            />
                          </div>

                          <hr className=' border-solid border-[#FE7743] ' />

                          {/* Custom Date Filter */}
                          <div className='space-y-2'>
                            <div className='flex justify-between items-center'>
                              <div className='text-sm font-semibold text-gray-600'>
                                Custom Date Range
                              </div>
                              {isCustomDateApplied && (
                                <Button
                                  type='text'
                                  onClick={() => {
                                    setCustomStartDate(null);
                                    setCustomEndDate(null);
                                    fetchMonthlyTrafficData(currentYear, trafficView);
                                  }}
                                  className='text-xs text-orange-500 hover:underline'
                                >
                                  Reset
                                </Button>
                              )}
                            </div>

                            <div className='grid grid-cols-1 gap-2'>
                              <DatePicker
                                placeholder='Start date'
                                value={customStartDate}
                                onChange={(date) => setCustomStartDate(date)}
                                className='w-full'
                              />
                              <DatePicker
                                placeholder='End date'
                                value={customEndDate}
                                onChange={(date) => setCustomEndDate(date)}
                                className='w-full'
                              />
                              <Button
                                type='primary'
                                block
                                className='mt-2'
                                onClick={() => {
                                  if (customStartDate && customEndDate) {
                                    const start = customStartDate.format('YYYY-MM-DD');
                                    const end = customEndDate.format('YYYY-MM-DD');
                                    fetchMonthlyTrafficDataByDateRange(start, end);
                                    setTrafficView('both');
                                  }
                                }}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      overlayStyle={{ minWidth: '300px', zIndex: 1000 }}
                      placement='bottomRight'
                      trigger={['click']}
                    >
                      <div className='flex items-center space-x-1 text-gray-500 text-sm cursor-pointer px-4'>
                        <Filter className='w-4 h-4' />
                        <span>Filter</span>
                      </div>
                    </Dropdown>
                  </ConfigProvider>
                </div>

                <ResponsiveContainer width='100%' height={300}>
                  <ComposedChart
                    data={monthlyTrafficData}
                    margin={{ top: 60, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id='colorTraffic' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor='#FF6600' stopOpacity={0.1} />
                        <stop offset='100%' stopColor='#FF6600' stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <clipPath id='trafficClip'>
                      {monthlyTrafficData.map((entry, index) => {
                        const isAbove =
                          entry.thisYear != null &&
                          entry.lastYear != null &&
                          entry.thisYear > entry.lastYear;
                        const prev = monthlyTrafficData[index - 1];
                        const wasAbove =
                          prev &&
                          prev.thisYear != null &&
                          prev.lastYear != null &&
                          prev.thisYear > prev.lastYear;

                        if (isAbove || wasAbove) {
                          const barWidth = 100 / monthlyTrafficData.length;
                          return (
                            <rect
                              key={index}
                              x={`${index * barWidth}%`}
                              y='0'
                              width={`${barWidth}%`}
                              height='100%'
                            />
                          );
                        }
                        return null;
                      })}
                    </clipPath>

                    <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                    <XAxis
                      dataKey='month'
                      tick={{ fill: '#F97316', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[
                        0,
                        (dataMax: number) => {
                          if (!dataMax || isNaN(dataMax)) return 10;
                          const exponent = Math.floor(Math.log10(dataMax));
                          const step = Math.pow(10, exponent);
                          return Math.ceil(dataMax / step) * step;
                        },
                      ]}
                      ticks={(() => {
                        if (!monthlyTrafficData || monthlyTrafficData.length === 0) return [0, 10];

                        const maxVal = Math.max(
                          ...monthlyTrafficData.map((d) =>
                            Math.max(d.thisYear ?? 0, d.lastYear ?? 0),
                          ),
                        );

                        if (!maxVal || isNaN(maxVal)) return [0, 10];

                        const exponent = Math.floor(Math.log10(maxVal));
                        const step = Math.pow(10, exponent);
                        const upper = Math.ceil(maxVal / step) * step;
                        const tickCount = 5;
                        const interval = Math.ceil(upper / tickCount / step) * step;

                        return Array.from({ length: tickCount + 1 }, (_, i) => i * interval);
                      })()}
                      tickFormatter={(value) => (value >= 1000 ? `${value / 1000}K` : `${value}`)}
                      tick={{ fill: '#F97316', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const thisYear = payload.find((p) => p.dataKey === 'thisYear')?.value ?? 0;
                        const lastYear = payload.find((p) => p.dataKey === 'lastYear')?.value ?? 0;

                        return (
                          <div className='bg-white border border-gray-200 shadow-md rounded px-4 py-2 text-sm'>
                            <p className='font-semibold mb-1'>{label}</p>
                            <p className='text-[#2F3F99]'>This year: {thisYear.toLocaleString()}</p>
                            <p className='text-[#AEC7ED]'>Last year: {lastYear.toLocaleString()}</p>
                          </div>
                        );
                      }}
                    />

                    {trafficView !== 'lastYear' && (
                      <>
                        {/* Show the area only if this year's data is above last year's */}
                        <Area
                          type='monotone'
                          dataKey='thisYear'
                          stroke='none'
                          fill='url(#colorTraffic)'
                          fillOpacity={1}
                          isAnimationActive={true}
                          clipPath='url(#trafficClip)'
                        />

                        {/* Show the area base only if this year's data is above last year's */}
                        <Line
                          type='monotone'
                          dataKey='thisYear'
                          stroke='#2F3F99'
                          strokeWidth={1.5}
                          dot={false}
                          isAnimationActive={true}
                        />
                      </>
                    )}

                    {trafficView !== 'thisYear' && (
                      <Line
                        type='monotone'
                        dataKey='lastYear'
                        stroke='#AEC7ED'
                        strokeWidth={1.5}
                        strokeDasharray='6 3'
                        dot={false}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* Row for the two side-by-side charts */}

          <div className='flex flex-col md:flex-row gap-6 w-auto justify-between mb-8 flex-1'>
            {/* Track number of contact requests */}
            <div className='bg-[#F9F9FA] p-6 rounded-3xl shadow-sm border w-auto md:w-1/2 gap-6 '>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-base font-semibold text-gray-800'>
                  Track number of contact requests
                </h3>
                <ConfigProvider
                  theme={{
                    token: {
                      colorPrimary: '#FE7743',
                    },
                  }}
                >
                  <Dropdown
                    dropdownRender={() => (
                      <div className='p-4 w-72 space-y-4 bg-white shadow-lg rounded-lg'>
                        {/* Status Filter */}
                        <div className='space-y-1'>
                          <div className='flex justify-between items-center text-sm font-semibold text-gray-600'>
                            <span>Filter by status</span>
                            {statusFilter && (
                              <Button
                                type='text'
                                onClick={() => {
                                  setStatusFilter(null);
                                  fetchContactRequests();
                                }}
                                className='text-xs text-orange-500 hover:underline'
                              >
                                Reset
                              </Button>
                            )}
                          </div>

                          <Select
                            value={statusFilter}
                            className='w-full'
                            onChange={(val) => {
                              setStatusFilter(val);
                              if (contactStartDate && contactEndDate) {
                                fetchFilteredContactRequests();
                              }
                            }}
                            allowClear
                            placeholder='Select status'
                            options={[
                              { label: 'Pending', value: 'Pending' },
                              { label: 'In Progress', value: 'In Progress' },
                              { label: 'Completed', value: 'Completed' },
                              { label: 'Rejected', value: 'Rejected' },
                            ]}
                          />
                        </div>

                        {/* Date Filter */}
                        <div className='space-y-1'>
                          <div className='flex justify-between items-center text-sm font-semibold text-gray-600'>
                            <span>Filter by date</span>
                            {(contactStartDate || contactEndDate) && (
                              <Button
                                type='text'
                                onClick={() => {
                                  setContactStartDate(null);
                                  setContactEndDate(null);
                                  fetchContactRequests();
                                }}
                                className='text-xs text-orange-500 hover:underline'
                              >
                                Reset
                              </Button>
                            )}
                          </div>

                          <DatePicker
                            placeholder='Start date'
                            value={contactStartDate}
                            onChange={(d) => setContactStartDate(d)}
                            className='w-full'
                          />
                          <DatePicker
                            placeholder='End date'
                            value={contactEndDate}
                            onChange={(d) => setContactEndDate(d)}
                            className='w-full'
                          />
                          <Button type='primary' block onClick={fetchFilteredContactRequests}>
                            Apply
                          </Button>
                        </div>
                      </div>
                    )}
                    trigger={['click']}
                  >
                    <div className='flex items-center space-x-1 text-gray-500 text-sm cursor-pointer px-4'>
                      <Filter className='w-4 h-4' />
                      <span>Filter</span>
                    </div>
                  </Dropdown>
                </ConfigProvider>
              </div>

              <ResponsiveContainer width='100%' height={200}>
                <BarChart data={contactRequestData} barCategoryGap={10} barGap={4}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis
                    dataKey='month'
                    type='category'
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                  />

                  <YAxis
                    domain={[
                      0,
                      (dataMax: number) => {
                        if (!dataMax || isNaN(dataMax)) return 10;
                        const tickCount = 5;
                        const rawStep = dataMax / (tickCount - 1);
                        const niceStep = Math.ceil(rawStep);
                        return niceStep * (tickCount - 1);
                      },
                    ]}
                    ticks={(() => {
                      if (!contactRequestData || contactRequestData.length === 0) return [0, 10];

                      const tickCount = 5;

                      const maxValue = Math.max(
                        ...contactRequestData.map(
                          (d) =>
                            (d.pending ?? 0) +
                            (d.inProgress ?? 0) +
                            (d.completed ?? 0) +
                            (d.rejected ?? 0),
                        ),
                      );

                      if (!maxValue || isNaN(maxValue)) return [0, 10];

                      const rawStep = maxValue / (tickCount - 1);
                      const niceStep = Math.ceil(rawStep);

                      return Array.from({ length: tickCount }, (_, i) => i * niceStep);
                    })()}
                    tickFormatter={(value) => `${value}`}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;

                      const colors: Record<string, string> = {
                        pending: '#2259C7',
                        inProgress: '#FFAE4C',
                        completed: '#6FD195',
                        rejected: '#FF8479',
                      };

                      const labelMap: Record<string, string> = {
                        pending: 'Pending',
                        inProgress: 'In Progress',
                        completed: 'Completed',
                        rejected: 'Rejected',
                      };

                      return (
                        <div className='bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-3 text-sm min-w-[125px]'>
                          <p className='font-semibold text-gray-800 mb-2'>{label}</p>
                          <div className='space-y-1'>
                            {payload.map((entry, index) => {
                              const dataKey = entry.dataKey as string;
                              const color = colors[dataKey] || '#999';
                              const labelName = labelMap[dataKey] || dataKey;

                              return (
                                <div
                                  key={index}
                                  className='flex justify-between items-center text-gray-700'
                                >
                                  <div className='flex items-center space-x-2'>
                                    <span
                                      style={{
                                        display: 'inline-block',
                                        width: 8,
                                        height: 8,
                                        backgroundColor: color,
                                        borderRadius: '50%',
                                      }}
                                    />
                                    <span>{labelName}</span>
                                  </div>
                                  <span className='font-medium text-gray-900'>{entry.value}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }}
                  />

                  <Bar dataKey='pending' stackId='a' fill='#2259C7' barSize={12}></Bar>
                  <Bar dataKey='inProgress' stackId='a' fill='#FFAE4C' barSize={12} />
                  <Bar dataKey='completed' stackId='a' fill='#6FD195' barSize={12} />
                  <Bar
                    dataKey='rejected'
                    stackId='a'
                    fill='#FF8479'
                    radius={[0, 0, 0, 0]}
                    barSize={12}
                  />
                </BarChart>
              </ResponsiveContainer>

              <div className='w-full flex justify-center mt-4'>
                <div className='flex flex-wrap justify-center items-center gap-x-6 gap-y-2'>
                  <div className='flex items-center space-x-2'>
                    <div className='w-2 h-2 bg-[#2259C7]'></div>
                    <span className='text-xs text-gray-600'>Pending</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <div className='w-2 h-2 bg-[#FFAE4C]'></div>
                    <span className='text-xs text-gray-600'>In Progress</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <div className='w-2 h-2 bg-[#6FD195]'></div>
                    <span className='text-xs text-gray-600'>Completed</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <div className='w-2 h-2 bg-[#FF8479]'></div>
                    <span className='text-xs text-gray-600'>Rejected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Traffic by Location */}
            <div className='bg-[#F9F9FA] p-6 rounded-3xl border w-auto md:w-1/2'>
              <div className='flex justify-between items-center mb-4 lg:px-5'>
                <h3 className='text-base font-semibold text-gray-800'>Traffic by Location</h3>
              </div>
              {trafficLoading ? (
                <p className='text-gray-500'>loading...</p>
              ) : (
                <div className='flex flex-col lg:flex-row items-center lg:items-start justify-around gap-6 '>
                  <div
                    className='w-48 h-48 relative'
                    onMouseLeave={() => {
                      setActiveIndex(null);
                      setHoveredData(null);
                    }}
                  >
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
                          activeIndex={activeIndex ?? -1}
                          activeShape={(props: any) => {
                            const {
                              cx,
                              cy,
                              midAngle,
                              innerRadius,
                              outerRadius,
                              startAngle,
                              endAngle,
                              fill,
                              name,
                              count,
                            } = props;

                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) / 2;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);

                            return (
                              <>
                                <Sector
                                  cx={cx}
                                  cy={cy}
                                  innerRadius={innerRadius}
                                  outerRadius={outerRadius + 6}
                                  startAngle={startAngle}
                                  endAngle={endAngle}
                                  fill={fill}
                                />
                                <foreignObject
                                  x={x - 60}
                                  y={y}
                                  width={120}
                                  height={50}
                                  style={{ overflow: 'visible' }}
                                  pointerEvents='none'
                                >
                                  <Popover
                                    open={activeIndex !== null}
                                    content={
                                      hoveredData && (
                                        <div className='text-sm'>
                                          <p className='font-medium'>{hoveredData.name}</p>
                                          <p>{hoveredData.count} universities</p>
                                        </div>
                                      )
                                    }
                                    placement='top'
                                    trigger='click'
                                    onOpenChange={(open) => {
                                      if (!open) {
                                        setActiveIndex(null);
                                        setHoveredData(null);
                                      }
                                    }}
                                  >
                                    <div style={{ width: '100%', height: '100%' }} />
                                  </Popover>
                                </foreignObject>
                              </>
                            );
                          }}
                        >
                          {trafficByLocation.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              cursor='pointer'
                              onMouseEnter={() => {
                                setActiveIndex(index);
                                setHoveredData(entry);
                              }}
                              onMouseLeave={() => {
                                setActiveIndex(null);
                                setHoveredData(null);
                              }}
                            />
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
          <div className='flex flex-col bg-[#F9F9FA] rounded-3xl p-6 shadow-sm border w-auto md:w-1/3'>
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
