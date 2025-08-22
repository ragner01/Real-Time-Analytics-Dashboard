import React from 'react';
import { Metric } from '../../types/metric';
import { formatDistanceToNow } from 'date-fns';

interface MetricCardProps {
  title: string;
  metrics: Metric[];
  onRemove: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, metrics, onRemove }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical':
        return 'text-red-600 bg-red-100';
      case 'Warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'Normal':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Critical':
        return '🔴';
      case 'Warning':
        return '🟡';
      case 'Normal':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div className="metric-card h-full">
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

      {metrics.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-gray-500 text-sm">No metrics available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {metrics.slice(0, 5).map((metric) => (
            <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{metric.name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(metric.status)}`}>
                    {getStatusIcon(metric.status)} {metric.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-semibold text-lg text-gray-900">
                    {metric.value.toFixed(2)}
                  </span>
                  {metric.unit && <span>{metric.unit}</span>}
                  {metric.category && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {metric.category}
                    </span>
                  )}
                </div>
                {metric.changePercentage !== undefined && (
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={`text-xs font-medium ${
                        metric.changePercentage > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {metric.changePercentage > 0 ? '↗' : '↘'} {Math.abs(metric.changePercentage).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">from previous</span>
                  </div>
                )}
              </div>
              <div className="text-right text-xs text-gray-500">
                <div>{formatDistanceToNow(new Date(metric.timestamp), { addSuffix: true })}</div>
                <div className="text-gray-400">{metric.source}</div>
              </div>
            </div>
          ))}
          
          {metrics.length > 5 && (
            <div className="text-center py-2">
              <span className="text-sm text-gray-500">
                +{metrics.length - 5} more metrics
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
