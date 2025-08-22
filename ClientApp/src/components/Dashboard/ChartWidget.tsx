import React from 'react';
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
import { Metric } from '../../types/metric';

// Register Chart.js components
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

interface ChartWidgetProps {
  title: string;
  configuration: Record<string, any>;
  data: Metric[];
  onRemove: () => void;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ title, configuration, data, onRemove }) => {
  const chartType = configuration.chartType || 'line';

  const prepareChartData = () => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Group metrics by category for better visualization
    const groupedData = data.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category].push(metric);
      return acc;
    }, {} as Record<string, Metric[]>);

    const categories = Object.keys(groupedData);
    const colors = [
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(16, 185, 129, 0.8)',   // Green
      'rgba(245, 158, 11, 0.8)',   // Yellow
      'rgba(239, 68, 68, 0.8)',    // Red
      'rgba(139, 92, 246, 0.8)',   // Purple
    ];

    if (chartType === 'doughnut') {
      return {
        labels: categories,
        datasets: [{
          data: categories.map(cat => 
            groupedData[cat].reduce((sum: number, m: Metric) => sum + m.value, 0)
          ),
          backgroundColor: colors.slice(0, categories.length),
          borderWidth: 2,
          borderColor: '#fff',
        }]
      };
    }

    // For line and bar charts, use time series data
    const sortedData = data
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-10); // Last 10 data points

    return {
      labels: sortedData.map(m => new Date(m.timestamp).toLocaleTimeString()),
      datasets: categories.map((category, index) => ({
        label: category,
        data: sortedData.map(m => 
          m.category === category ? m.value : 0
        ),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length].replace('0.8', '0.2'),
        borderWidth: 2,
        fill: chartType === 'line',
        tension: 0.1,
      }))
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: chartType !== 'doughnut' ? {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        beginAtZero: true,
      },
    } : undefined,
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const renderChart = () => {
    const chartData = prepareChartData();

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />;
      default:
        return <Line data={chartData} options={chartOptions} />;
    }
  };

  return (
    <div className="chart-container h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Remove widget"
        >
          ×
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📈</div>
          <p className="text-gray-500 text-sm">No data available</p>
        </div>
      ) : (
        <div className="h-64">
          {renderChart()}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Chart type: {chartType} • Data points: {data.length}
      </div>
    </div>
  );
};

export default ChartWidget;
