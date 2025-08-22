import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import { Line, Bar, Pie } from 'react-chartjs-2';
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
import { fetchMetrics } from '../../services/metricService';
import { useAuth } from '../../contexts/AuthContext';
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

interface ReportFilter {
  field: string;
  operator: string;
  value: string | number;
}

interface ReportChart {
  type: string;
  title: string;
  xAxis: string;
  yAxis: string;
  data: any;
}

interface Report {
  id: string;
  name: string;
  description: string;
  filters: ReportFilter[];
  charts: ReportChart[];
  createdAt: string;
  lastRunAt?: string;
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [newReport, setNewReport] = useState<Partial<Report>>({
    name: '',
    description: '',
    filters: [],
    charts: [],
  });

  // Fetch metrics data for report generation
  const { data: metrics, isLoading: metricsLoading } = useQuery(
    ['metrics', 'reports'],
    () => fetchMetrics('latest', 1000),
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  // Sample reports (in a real app, these would come from the backend)
  useEffect(() => {
    const sampleReports: Report[] = [
      {
        id: '1',
        name: 'System Performance Overview',
        description: 'Comprehensive analysis of system performance metrics',
        filters: [
          { field: 'category', operator: 'equals', value: 'Performance' },
        ],
        charts: [
          {
            type: 'line',
            title: 'Performance Trends',
            xAxis: 'Time',
            yAxis: 'Value',
            data: null,
          },
        ],
        createdAt: new Date().toISOString(),
        lastRunAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Resource Utilization',
        description: 'Analysis of CPU, memory, and disk usage',
        filters: [
          { field: 'category', operator: 'equals', value: 'Resources' },
        ],
        charts: [
          {
            type: 'bar',
            title: 'Resource Usage by Category',
            xAxis: 'Category',
            yAxis: 'Usage %',
            data: null,
          },
        ],
        createdAt: new Date().toISOString(),
      },
    ];
    setReports(sampleReports);
  }, []);

  const generateReport = (report: Report) => {
    if (!metrics) return;

    // Apply filters
    let filteredData = [...metrics];
    report.filters.forEach(filter => {
      filteredData = filteredData.filter(metric => {
        const metricValue = (metric as any)[filter.field];
        switch (filter.operator) {
          case 'equals':
            return metricValue === filter.value;
          case 'contains':
            return String(metricValue).includes(String(filter.value));
          case 'greater':
            return Number(metricValue) > Number(filter.value);
          case 'less':
            return Number(metricValue) < Number(filter.value);
          default:
            return true;
        }
      });
    });

    // Generate chart data
    const updatedCharts = report.charts.map(chart => {
      let chartData = null;
      
      switch (chart.type) {
        case 'line':
          chartData = {
            labels: filteredData.slice(-20).map(m => new Date(m.timestamp).toLocaleTimeString()),
            datasets: [{
              label: chart.yAxis,
              data: filteredData.slice(-20).map(m => m.value),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true,
            }],
          };
          break;
        case 'bar':
          const categories = [...new Set(filteredData.map(m => m.category))];
          chartData = {
            labels: categories,
            datasets: [{
              label: chart.yAxis,
              data: categories.map(cat => 
                filteredData.filter(m => m.category === cat).length
              ),
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
              ],
            }],
          };
          break;
        case 'pie':
          const statusCounts = filteredData.reduce((acc, m) => {
            acc[m.status] = (acc[m.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          chartData = {
            labels: Object.keys(statusCounts),
            datasets: [{
              data: Object.values(statusCounts),
              backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(251, 191, 36, 0.8)',
                'rgba(239, 68, 68, 0.8)',
              ],
            }],
          };
          break;
                       case 'area':
                 chartData = {
                   labels: filteredData.slice(-20).map(m => new Date(m.timestamp).toLocaleTimeString()),
                   datasets: [{
                     label: chart.yAxis,
                     data: filteredData.slice(-20).map(m => m.value),
                     backgroundColor: 'rgba(75, 192, 192, 0.2)',
                     borderColor: 'rgb(75, 192, 192)',
                     fill: true,
                     tension: 0.4,
                   }],
                 };
                 break;
      }

      return { ...chart, data: chartData };
    });

    const updatedReport = {
      ...report,
      charts: updatedCharts,
      lastRunAt: new Date().toISOString(),
    };

    setReports(prev => prev.map(r => r.id === report.id ? updatedReport : r));
    setSelectedReport(updatedReport);
    toast.success('Report generated successfully!');
  };

  const exportReport = (report: Report, format: 'json' | 'csv') => {
    if (!selectedReport) return;

    let data: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      data = JSON.stringify(selectedReport, null, 2);
      filename = `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else {
      // Simple CSV export
      const headers = ['Name', 'Value', 'Category', 'Status', 'Timestamp'];
      const rows = metrics?.map(m => [m.name, m.value, m.category, m.status, new Date(m.timestamp).toISOString()]) || [];
      data = [headers, ...rows].map(row => row.join(',')).join('\n');
      filename = `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Report exported as ${format.toUpperCase()}`);
  };

  const addFilter = () => {
    setNewReport(prev => ({
      ...prev,
      filters: [...(prev.filters || []), { field: 'name', operator: 'equals', value: '' }],
    }));
  };

  const removeFilter = (index: number) => {
    setNewReport(prev => ({
      ...prev,
      filters: prev.filters?.filter((_, i) => i !== index) || [],
    }));
  };

  const updateFilter = (index: number, field: string, value: string | number) => {
    setNewReport(prev => ({
      ...prev,
      filters: prev.filters?.map((f, i) => 
        i === index ? { ...f, [field]: value } : f
      ) || [],
    }));
  };

  const addChart = () => {
    setNewReport(prev => ({
      ...prev,
      charts: [...(prev.charts || []), { type: 'line', title: '', xAxis: '', yAxis: '', data: null }],
    }));
  };

  const removeChart = (index: number) => {
    setNewReport(prev => ({
      ...prev,
      charts: prev.charts?.filter((_, i) => i !== index) || [],
    }));
  };

  const updateChart = (index: number, field: string, value: string) => {
    setNewReport(prev => ({
      ...prev,
      charts: prev.charts?.map((c, i) => 
        i === index ? { ...c, [field]: value } : c
      ) || [],
    }));
  };

  const saveReport = () => {
    if (!newReport.name || !newReport.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const report: Report = {
      id: Date.now().toString(),
      name: newReport.name,
      description: newReport.description,
      filters: newReport.filters || [],
      charts: newReport.charts || [],
      createdAt: new Date().toISOString(),
    };

    setReports(prev => [...prev, report]);
    setNewReport({ name: '', description: '', filters: [], charts: [] });
    setShowReportBuilder(false);
    toast.success('Report saved successfully!');
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const renderChart = (chart: ReportChart) => {
    if (!chart.data) return <div className="text-gray-500 text-center py-8">No data available</div>;

    switch (chart.type) {
      case 'line':
        return <Line data={chart.data} options={chartOptions} />;
      case 'bar':
        return <Bar data={chart.data} options={chartOptions} />;
      case 'pie':
        return <Pie data={chart.data} options={chartOptions} />;
                   case 'area':
               return <Line data={chart.data} options={chartOptions} />;
      default:
        return <div className="text-gray-500">Unsupported chart type</div>;
    }
  };

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
          <p className="text-gray-600">Create, generate, and export custom reports</p>
        </div>
        <button
          onClick={() => setShowReportBuilder(true)}
          className="btn-primary"
        >
          Create New Report
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                <span className="text-xs text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{report.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Filters:</span> {report.filters.length}
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Charts:</span> {report.charts.length}
                </div>
                {report.lastRunAt && (
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Last run:</span> {new Date(report.lastRunAt).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => generateReport(report)}
                  className="btn-secondary flex-1"
                >
                  Generate
                </button>
                <button
                  onClick={() => setSelectedReport(report)}
                  className="btn-primary flex-1"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Builder Modal */}
      {showReportBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Report</h2>
                <button
                  onClick={() => setShowReportBuilder(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                  <input
                    type="text"
                    value={newReport.name}
                    onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter report name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newReport.description}
                    onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter report description"
                  />
                </div>

                {/* Filters */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                    <button
                      onClick={addFilter}
                      className="btn-secondary text-sm"
                    >
                      Add Filter
                    </button>
                  </div>
                  <div className="space-y-3">
                    {newReport.filters?.map((filter, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <select
                          value={filter.field}
                          onChange={(e) => updateFilter(index, 'field', e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="name">Name</option>
                          <option value="category">Category</option>
                          <option value="status">Status</option>
                          <option value="value">Value</option>
                        </select>
                        <select
                          value={filter.operator}
                          onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="equals">Equals</option>
                          <option value="contains">Contains</option>
                          <option value="greater">Greater Than</option>
                          <option value="less">Less Than</option>
                        </select>
                        <input
                          type="text"
                          value={filter.value}
                          onChange={(e) => updateFilter(index, 'value', e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Value"
                        />
                        <button
                          onClick={() => removeFilter(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Charts */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Charts</h3>
                    <button
                      onClick={addChart}
                      className="btn-secondary text-sm"
                    >
                      Add Chart
                    </button>
                  </div>
                  <div className="space-y-3">
                    {newReport.charts?.map((chart, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
                            <select
                              value={chart.type}
                              onChange={(e) => updateChart(index, 'type', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="line">Line Chart</option>
                              <option value="bar">Bar Chart</option>
                              <option value="pie">Pie Chart</option>
                                                                   <option value="area">Area Chart (Line)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                              type="text"
                              value={chart.title}
                              onChange={(e) => updateChart(index, 'title', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Chart title"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">X-Axis</label>
                            <input
                              type="text"
                              value={chart.xAxis}
                              onChange={(e) => updateChart(index, 'xAxis', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="X-axis label"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Y-Axis</label>
                            <input
                              type="text"
                              value={chart.yAxis}
                              onChange={(e) => updateChart(index, 'yAxis', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Y-axis label"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => removeChart(index)}
                          className="mt-3 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove Chart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    onClick={() => setShowReportBuilder(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveReport}
                    className="btn-primary"
                  >
                    Save Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Viewer */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedReport.name}</h2>
                  <p className="text-gray-600">{selectedReport.description}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => exportReport(selectedReport, 'json')}
                    className="btn-secondary text-sm"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => exportReport(selectedReport, 'csv')}
                    className="btn-secondary text-sm"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedReport.charts.map((chart, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{chart.title}</h3>
                    <div className="h-64">
                      {renderChart(chart)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
