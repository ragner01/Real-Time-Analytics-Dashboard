import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
  Filler,
} from 'chart.js';
import { fetchMetrics, fetchTrendingMetrics } from '../../services/metricService';
// import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Metrics: React.FC = () => {
  // const { user } = useAuth(); // User context available if needed
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  console.log('Metrics component rendering...'); // Debug log

  // Fetch metrics data
  const { data: metrics, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useQuery(
    ['metrics', 'latest', selectedCategory, timeRange],
    () => fetchMetrics('latest', 100),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      onError: (error) => {
        console.error('Metrics fetch error:', error); // Debug log
      },
    }
  );

  const { data: trendingMetrics, error: trendingError } = useQuery(
    ['metrics', 'trending', timeRange],
    () => fetchTrendingMetrics(24, 20),
    {
      refetchInterval: 60000, // Refresh every minute
      onError: (error) => {
        console.error('Trending metrics fetch error:', error); // Debug log
      },
    }
  );

  console.log('Metrics data:', metrics); // Debug log
  console.log('Trending metrics:', trendingMetrics); // Debug log
  console.log('Loading state:', metricsLoading); // Debug log
  console.log('Error state:', metricsError); // Debug log

  // Show loading state
  if (metricsLoading) {
    console.log('Metrics: Showing loading state'); // Debug log
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading metrics...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (metricsError) {
    console.log('Metrics: Showing error state:', metricsError); // Debug log
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error loading metrics</h3>
          <p className="text-red-600 mt-1">Please try refreshing the page.</p>
          <button 
            onClick={() => refetchMetrics()}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if we have data
  if (!metrics || metrics.length === 0) {
    console.log('Metrics: No data available, showing empty state'); // Debug log
    return (
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-gray-800 font-medium">No metrics available</h3>
          <p className="text-gray-600 mt-1">No metrics data could be loaded.</p>
          <button 
            onClick={() => refetchMetrics()}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  console.log('Metrics: Rendering with data, count:', metrics.length); // Debug log

  // Filter metrics based on selection
  const filteredMetrics = metrics?.filter(metric => 
    selectedCategory === 'all' || metric.category === selectedCategory
  ) || [];

  // Get unique categories
  const categories = Array.from(new Set(metrics?.map(m => m.category) || []));

  // Calculate summary statistics
  const summaryStats = {
    total: filteredMetrics.length,
    average: filteredMetrics.length > 0 ? filteredMetrics.reduce((sum, m) => sum + m.value, 0) / filteredMetrics.length : 0,
    critical: filteredMetrics.filter(m => m.status === 'Critical').length,
    warning: filteredMetrics.filter(m => m.status === 'Warning').length,
    normal: filteredMetrics.filter(m => m.status === 'Normal').length,
  };

  // Prepare chart data
  const lineChartData = {
    labels: filteredMetrics.slice(-20).map(m => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Metric Values',
        data: filteredMetrics.slice(-20).map(m => m.value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const barChartData = {
    labels: categories.slice(0, 10),
    datasets: [
      {
        label: 'Metrics per Category',
        data: categories.slice(0, 10).map(cat => 
          filteredMetrics.filter(m => m.category === cat).length
        ),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
      },
    ],
  };

  const doughnutData = {
    labels: ['Normal', 'Warning', 'Critical'],
    datasets: [
      {
        data: [summaryStats.normal, summaryStats.warning, summaryStats.critical],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Real-Time Metrics Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleRefresh = () => {
    refetchMetrics();
    toast.success('Metrics refreshed!');
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Metrics Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring and analysis of your system metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="metric-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">T</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Metrics</p>
              <p className="text-2xl font-semibold text-gray-900">{summaryStats.total}</p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold">A</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Value</p>
              <p className="text-2xl font-semibold text-gray-900">{summaryStats.average.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold">N</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Normal</p>
              <p className="text-2xl font-semibold text-gray-900">{summaryStats.normal}</p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">W</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Warning</p>
              <p className="text-2xl font-semibold text-gray-900">{summaryStats.warning}</p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-semibold">C</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Critical</p>
              <p className="text-2xl font-semibold text-gray-900">{summaryStats.critical}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Metric Trends</h3>
          <Line data={lineChartData} options={chartOptions} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Overview</h3>
          <Doughnut data={doughnutData} options={chartOptions} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Metrics</h3>
          <div className="space-y-3">
            {trendingMetrics && trendingMetrics.length > 0 ? (
              trendingMetrics.slice(0, 5).map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{metric.name}</p>
                    <p className="text-sm text-gray-500">{metric.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{metric.value}</p>
                    <p className="text-sm text-gray-500">{metric.unit}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No trending metrics available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics List/Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Metrics</h3>
        </div>
        <div className="p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMetrics.map((metric, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{metric.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      metric.status === 'Critical' ? 'bg-red-100 text-red-800' :
                      metric.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {metric.status}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value} {metric.unit}</p>
                  <p className="text-sm text-gray-500 mb-2">{metric.category}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(metric.timestamp).toLocaleString()}
                  </p>
                  {metric.changePercentage && (
                    <div className={`text-sm ${metric.changePercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.changePercentage > 0 ? '↗' : '↘'} {Math.abs(metric.changePercentage).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMetrics.map((metric, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{metric.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.value} {metric.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          metric.status === 'Critical' ? 'bg-red-100 text-red-800' :
                          metric.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {metric.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(metric.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Metrics;
