import React from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Metric } from '../../types/metric';

interface ChartWidgetProps {
  data: { metrics: Metric[]; type: string };
  type: string;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ data, type }) => {
  const { metrics } = data;

  if (!metrics || metrics.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-64 text-gray-500"
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No data available for chart</p>
        </div>
      </motion.div>
    );
  }

  // Prepare chart data based on type
  const getChartData = () => {
    switch (type) {
      case 'line':
        return {
          labels: metrics.slice(-20).map(m => new Date(m.timestamp).toLocaleTimeString()),
          datasets: [
            {
              label: 'Metric Values',
              data: metrics.slice(-20).map(m => m.value),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        };

      case 'bar':
        const categories = Array.from(new Set(metrics.map(m => m.category)));
        return {
          labels: categories.slice(0, 10),
          datasets: [
            {
              label: 'Metrics per Category',
              data: categories.slice(0, 10).map(cat => 
                metrics.filter(m => m.category === cat).length
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

      case 'doughnut':
        const statusCounts = {
          Normal: metrics.filter(m => m.status === 'Normal').length,
          Warning: metrics.filter(m => m.status === 'Warning').length,
          Critical: metrics.filter(m => m.status === 'Critical').length,
        };
        return {
          labels: Object.keys(statusCounts),
          datasets: [
            {
              data: Object.values(statusCounts),
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

      default:
        return {
          labels: [],
          datasets: [],
        };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: type === 'line' || type === 'bar' ? {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
      },
    } : {},
  };

  const renderChart = () => {
    const chartData = getChartData();

    switch (type) {
      case 'line':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="h-64"
          >
            <Line data={chartData} options={chartOptions} />
          </motion.div>
        );

      case 'bar':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-64"
          >
            <Bar data={chartData} options={chartOptions} />
          </motion.div>
        );

      case 'doughnut':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-64 flex items-center justify-center"
          >
            <div className="w-48 h-48">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </motion.div>
        );

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <p>Unsupported chart type: {type}</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {renderChart()}
      
      {/* Chart metadata */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 pt-4 border-t border-gray-100"
      >
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Data points: {metrics.length}</span>
          <span>Last updated: {new Date(metrics[0]?.timestamp || Date.now()).toLocaleTimeString()}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChartWidget;
