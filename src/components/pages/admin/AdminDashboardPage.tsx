import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  ArrowUp, 
  ArrowDown, 
  Calendar, 
  Filter,
  ChevronDown
} from 'lucide-react';
import { useUniversity } from '../../contexts/UniversityContext';
import { mockStatistics } from '../../data/mockData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const formatValue = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
};

const AdminDashboardPage = () => {
  const { universities } = useUniversity();
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  
  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
  ];
  
  // Website traffic data
  const trafficData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'This Year',
        data: [12000, 14500, 11000, 15000, 21000, 18500, 22000, 24500, 23000, 19500, 21000, 23500],
        borderColor: '#E67E22',
        backgroundColor: 'rgba(230, 126, 34, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Last Year',
        data: [10000, 12000, 9500, 14000, 15000, 13500, 16000, 18000, 17500, 16000, 17000, 18000],
        borderColor: '#BDC3C7',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4,
      },
    ],
  };
  
  // Contact requests data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const contactRequestsData = {
    labels: months,
    datasets: [
      {
        label: 'Pending',
        data: [45, 25, 40, 20, 50, 30, 25, 35, 40, 30, 45, 35],
        backgroundColor: '#F1C40F',
      },
      {
        label: 'In Progress',
        data: [35, 45, 35, 50, 30, 40, 35, 30, 45, 40, 35, 40],
        backgroundColor: '#3498DB',
      },
      {
        label: 'Completed',
        data: [25, 30, 35, 25, 30, 35, 40, 25, 30, 35, 40, 30],
        backgroundColor: '#2ECC71',
      },
      {
        label: 'Rejected',
        data: [15, 20, 10, 15, 10, 15, 20, 10, 15, 20, 10, 15],
        backgroundColor: '#E74C3C',
      },
    ],
  };
  
  // Traffic by location data
  const trafficByLocationData = {
    labels: mockStatistics.trafficByCountry.map(item => item.country),
    datasets: [
      {
        label: 'Traffic Percentage',
        data: mockStatistics.trafficByCountry.map(item => item.percentage),
        backgroundColor: [
          '#2C3E50',  // Dark blue
          '#3498DB',  // Blue
          '#1ABC9C',  // Teal
          '#F1C40F',  // Yellow
          '#E67E22',  // Orange
          '#E74C3C',  // Red
        ],
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };
  
  // Stats cards
  const stats = [
    {
      id: 'universities',
      label: 'Total Universities',
      value: universities.length,
      icon: <BarChart3 size={24} />,
      color: 'bg-blue-500',
    },
    {
      id: 'visits',
      label: 'Visits',
      value: 7265,
      change: 10.1,
      isPositive: true,
      icon: <BarChart3 size={24} />,
      color: 'bg-orange-500',
    },
    {
      id: 'requests',
      label: 'Contact Requests',
      value: 156,
      change: 15.03,
      isPositive: true,
      icon: <BarChart3 size={24} />,
      color: 'bg-green-500',
    },
    {
      id: 'users',
      label: 'Active Users',
      value: 2318,
      change: -3.2,
      isPositive: false,
      icon: <BarChart3 size={24} />,
      color: 'bg-purple-500',
    },
  ];
  
  return (
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-4 md:mb-0">Admin Dashboard</h1>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none pl-10 pr-10 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-primary focus:border-primary"
              >
                {periods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.label}
                  </option>
                ))}
              </select>
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark">
              <Filter size={16} className="mr-2" />
              More Filters
            </button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="mt-1 text-3xl font-semibold">{formatValue(stat.value)}</p>
                  
                  {stat.change !== undefined && (
                    <div className={`mt-1 flex items-center ${
                      stat.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.isPositive ? (
                        <ArrowUp size={16} className="mr-1" />
                      ) : (
                        <ArrowDown size={16} className="mr-1" />
                      )}
                      <span className="text-sm font-medium">{stat.change}%</span>
                    </div>
                  )}
                </div>
                
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Website Traffic Tracking</h2>
              <div className="flex items-center text-sm font-medium">
                <span className="flex items-center mr-4">
                  <span className="w-3 h-3 inline-block bg-primary rounded-full mr-1"></span>
                  This year
                </span>
                <span className="flex items-center">
                  <span className="w-3 h-3 inline-block border border-gray-400 rounded-full mr-1"></span>
                  Last year
                </span>
              </div>
            </div>
            <div className="h-64">
              <Line 
                data={trafficData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return typeof value === 'number' ? formatValue(value) : value;
                        }
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }} 
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Traffic by Location</h2>
            </div>
            <div className="h-64 flex justify-center">
              <Pie 
                data={trafficByLocationData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }} 
              />
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Track Number of Contact Requests</h2>
          </div>
          <div className="h-64">
            <Bar 
              data={contactRequestsData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    stacked: false,
                  },
                  y: {
                    stacked: false,
                    beginAtZero: true,
                  },
                },
              }} 
            />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Top Search Universities</h2>
            <a href="/admin/universities" className="text-primary hover:text-primary-dark text-sm font-medium">
              View All
            </a>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    University
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Search Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {universities.slice(0, 5).map((university, index) => (
                  <tr key={university.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                          <img 
                            src={university.logo} 
                            alt={university.name} 
                            className="max-h-full max-w-full"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{university.name}</div>
                          <div className="text-sm text-gray-500">Rank #{university.ranking}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {university.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(1000 * (5 - index) + Math.floor(Math.random() * 200)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        index % 2 === 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                      }`}>
                        {index % 2 === 0 ? (
                          <ArrowUp size={12} className="mr-1" />
                        ) : (
                          <ArrowDown size={12} className="mr-1" />
                        )}
                        {index % 2 === 0 ? '+' : '-'}{Math.floor(Math.random() * 20) + 1}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminDashboardPage;