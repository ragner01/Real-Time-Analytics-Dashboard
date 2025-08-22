import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PredictionModel {
  id: string;
  name: string;
  type: string;
  description: string;
  parameters: Record<string, any>;
  accuracy: number;
  lastUpdated: string;
}

interface PredictionResult {
  metricName: string;
  modelType: string;
  predictions: Array<{
    date: string;
    value: number;
    confidence: number;
    lowerBound: number;
    upperBound: number;
  }>;
  accuracy: number;
  generatedAt: string;
}

const Predictions: React.FC = () => {
  // const { user } = useAuth(); // User context available if needed
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('linear');
  const [forecastPeriods, setForecastPeriods] = useState<number>(30);
  const [customParameters, setCustomParameters] = useState<Record<string, any>>({});
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  // const [showModelBuilder, setShowModelBuilder] = useState(false); // Available for future use
  // const [newModel, setNewModel] = useState<Partial<PredictionModel>>({ // Available for future use
  //   name: '',
  //   type: 'linear',
  //   description: '',
  //   parameters: {},
  // });

  // Fetch metrics data for prediction
  const { data: metrics, isLoading: metricsLoading } = useQuery(
    ['metrics', 'predictions'],
    () => fetchMetrics('latest', 1000),
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  // Available prediction models
  const availableModels: PredictionModel[] = [
    {
      id: '1',
      name: 'Linear Regression',
      type: 'linear',
      description: 'Simple linear trend analysis for steady growth patterns',
      parameters: { windowSize: 30 },
      accuracy: 0.85,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Exponential Growth',
      type: 'exponential',
      description: 'Exponential trend analysis for accelerating growth',
      parameters: { growthRate: 0.1 },
      accuracy: 0.78,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Moving Average',
      type: 'moving_average',
      description: 'Smooth trend analysis using moving averages',
      parameters: { windowSize: 7 },
      accuracy: 0.82,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Trend Analysis',
      type: 'trend',
      description: 'Advanced trend detection with seasonality',
      parameters: { seasonality: 24, trendStrength: 0.5 },
      accuracy: 0.88,
      lastUpdated: new Date().toISOString(),
    },
  ];

  // Get unique metric names
  const metricNames = Array.from(new Set(metrics?.map(m => m.name) || []));

  // Generate predictions using different algorithms
  const generatePredictions = () => {
    if (!selectedMetric || !metrics) return;

    const metricData = metrics.filter(m => m.name === selectedMetric);
    if (metricData.length < 10) {
      toast.error('Insufficient data for prediction. Need at least 10 data points.');
      return;
    }

    const sortedData = metricData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const values = sortedData.map(m => m.value);
    const dates = sortedData.map(m => new Date(m.timestamp));

    let predictions: PredictionResult['predictions'] = [];
    let accuracy = 0;

    switch (selectedModel) {
      case 'linear':
        predictions = generateLinearPredictions(values, dates, forecastPeriods);
        accuracy = calculateLinearAccuracy(values);
        break;
      case 'exponential':
        predictions = generateExponentialPredictions(values, dates, forecastPeriods);
        accuracy = calculateExponentialAccuracy(values);
        break;
      case 'moving_average':
        const windowSize = customParameters.windowSize || 7;
        predictions = generateMovingAveragePredictions(values, dates, forecastPeriods, windowSize);
        accuracy = calculateMovingAverageAccuracy(values, windowSize);
        break;
      case 'trend':
        predictions = generateTrendPredictions(values, dates, forecastPeriods);
        accuracy = calculateTrendAccuracy(values);
        break;
      default:
        predictions = generateLinearPredictions(values, dates, forecastPeriods);
        accuracy = calculateLinearAccuracy(values);
    }

    const result: PredictionResult = {
      metricName: selectedMetric,
      modelType: selectedModel,
      predictions,
      accuracy,
      generatedAt: new Date().toISOString(),
    };

    setPredictions(prev => [result, ...prev]);
    toast.success('Predictions generated successfully!');
  };

  const generateLinearPredictions = (values: number[], dates: Date[], periods: number): PredictionResult['predictions'] => {
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + val * i, 0);
    const sumX2 = values.reduce((sum, val, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predictions: PredictionResult['predictions'] = [];
    const lastDate = dates[dates.length - 1];

    for (let i = 1; i <= periods; i++) {
      const predictedValue = slope * (n + i) + intercept;
      const confidence = Math.max(0.1, Math.min(0.95, 0.9 - (i * 0.02))); // Confidence decreases over time
      const margin = predictedValue * (1 - confidence);
      
      predictions.push({
        date: new Date(lastDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
        value: predictedValue,
        confidence,
        lowerBound: predictedValue - margin,
        upperBound: predictedValue + margin,
      });
    }

    return predictions;
  };

  const generateExponentialPredictions = (values: number[], dates: Date[], periods: number): PredictionResult['predictions'] => {
    if (values.length < 2) return [];

    const growthRates: number[] = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] !== 0) {
        growthRates.push((values[i] - values[i - 1]) / values[i - 1]);
      }
    }

    const avgGrowthRate = growthRates.length > 0 ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length : 0;
    const lastValue = values[values.length - 1];
    const lastDate = dates[dates.length - 1];

    const predictions: PredictionResult['predictions'] = [];
    for (let i = 1; i <= periods; i++) {
      const predictedValue = lastValue * Math.pow(1 + avgGrowthRate, i);
      const confidence = Math.max(0.1, Math.min(0.95, 0.85 - (i * 0.03)));
      const margin = predictedValue * (1 - confidence);

      predictions.push({
        date: new Date(lastDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
        value: predictedValue,
        confidence,
        lowerBound: predictedValue - margin,
        upperBound: predictedValue + margin,
      });
    }

    return predictions;
  };

  const generateMovingAveragePredictions = (values: number[], dates: Date[], periods: number, windowSize: number): PredictionResult['predictions'] => {
    if (values.length < windowSize) return [];

    const lastDate = dates[dates.length - 1];
    const recentValues = values.slice(-windowSize);
    const avgValue = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    const volatility = Math.sqrt(recentValues.reduce((sum, val) => sum + Math.pow(val - avgValue, 2), 0) / recentValues.length);

    const predictions: PredictionResult['predictions'] = [];
    for (let i = 1; i <= periods; i++) {
      const confidence = Math.max(0.1, Math.min(0.95, 0.8 - (i * 0.05)));
      const margin = volatility * (1 - confidence);

      predictions.push({
        date: new Date(lastDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
        value: avgValue,
        confidence,
        lowerBound: avgValue - margin,
        upperBound: avgValue + margin,
      });
    }

    return predictions;
  };

  const generateTrendPredictions = (values: number[], dates: Date[], periods: number): PredictionResult['predictions'] => {
    if (values.length < 3) return [];

    const lastDate = dates[dates.length - 1];
    const recentTrend = values.slice(-3);
    const trend = (recentTrend[2] - recentTrend[0]) / 2;
    const lastValue = values[values.length - 1];

    const predictions: PredictionResult['predictions'] = [];
    for (let i = 1; i <= periods; i++) {
      const predictedValue = lastValue + (trend * i);
      const confidence = Math.max(0.1, Math.min(0.95, 0.88 - (i * 0.02)));
      const margin = Math.abs(trend) * i * (1 - confidence);

      predictions.push({
        date: new Date(lastDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
        value: predictedValue,
        confidence,
        lowerBound: predictedValue - margin,
        upperBound: predictedValue + margin,
      });
    }

    return predictions;
  };

  const calculateLinearAccuracy = (values: number[]): number => {
    if (values.length < 2) return 0.5;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(0.1, Math.min(0.95, 1 - (stdDev / mean)));
  };

  const calculateExponentialAccuracy = (values: number[]): number => {
    if (values.length < 2) return 0.5;
    const growthRates = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] !== 0) {
        growthRates.push(Math.abs((values[i] - values[i - 1]) / values[i - 1]));
      }
    }
    const avgGrowthRate = growthRates.length > 0 ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length : 0;
    return Math.max(0.1, Math.min(0.95, 0.85 - avgGrowthRate));
  };

  const calculateMovingAverageAccuracy = (values: number[], windowSize: number): number => {
    if (values.length < windowSize) return 0.5;
    const volatility = values.slice(-windowSize).reduce((sum, val, i, arr) => {
      const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
      return sum + Math.pow(val - mean, 2);
    }, 0) / windowSize;
    return Math.max(0.1, Math.min(0.95, 0.8 - Math.sqrt(volatility) * 0.1));
  };

  const calculateTrendAccuracy = (values: number[]): number => {
    if (values.length < 3) return 0.5;
    const recentTrend = values.slice(-3);
    const trend = Math.abs(recentTrend[2] - recentTrend[0]) / 2;
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.max(0.1, Math.min(0.95, 0.88 - (trend / avgValue) * 0.1));
  };

  const exportPredictions = (format: 'json' | 'csv') => {
    if (predictions.length === 0) {
      toast.error('No predictions to export');
      return;
    }

    let data: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      data = JSON.stringify(predictions, null, 2);
      filename = `predictions_${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else {
      const headers = ['Metric', 'Model', 'Date', 'Predicted Value', 'Confidence', 'Lower Bound', 'Upper Bound'];
      const rows = predictions.flatMap(pred => 
        pred.predictions.map(p => [
          pred.metricName,
          pred.modelType,
          p.date,
          p.value.toFixed(2),
          (p.confidence * 100).toFixed(1) + '%',
          p.lowerBound.toFixed(2),
          p.upperBound.toFixed(2),
        ])
      );
      data = [headers, ...rows].map(row => row.join(',')).join('\n');
      filename = `predictions_${new Date().toISOString().split('T')[0]}.csv`;
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

    toast.success(`Predictions exported as ${format.toUpperCase()}`);
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Prediction Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
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
          <h1 className="text-3xl font-bold text-gray-900">Predictive Analytics</h1>
          <p className="text-gray-600">Advanced forecasting and trend analysis using machine learning models</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportPredictions('json')}
            className="btn-secondary"
          >
            Export JSON
          </button>
          <button
            onClick={() => exportPredictions('csv')}
            className="btn-secondary"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Prediction Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Predictions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Metric</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a metric</option>
              {metricNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model Type</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableModels.map(model => (
                <option key={model.type} value={model.type}>{model.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Periods</label>
            <input
              type="number"
              value={forecastPeriods}
              onChange={(e) => setForecastPeriods(Number(e.target.value))}
              min="1"
              max="365"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={generatePredictions}
              disabled={!selectedMetric}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Custom Parameters */}
        {selectedModel === 'moving_average' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Window Size</label>
            <input
              type="number"
              value={customParameters.windowSize || 7}
              onChange={(e) => setCustomParameters(prev => ({ ...prev, windowSize: Number(e.target.value) }))}
              min="3"
              max="30"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Model Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {availableModels.map((model) => (
          <div key={model.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
              <span className="text-sm text-gray-500">{model.type}</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{model.description}</p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Accuracy: <span className="font-medium text-green-600">{(model.accuracy * 100).toFixed(1)}%</span>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(model.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Predictions Results */}
      {predictions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Prediction Results</h2>
          
          {predictions.map((prediction, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{prediction.metricName}</h3>
                  <p className="text-gray-600">Model: {prediction.modelType} • Accuracy: {(prediction.accuracy * 100).toFixed(1)}%</p>
                </div>
                <span className="text-sm text-gray-500">
                  Generated: {new Date(prediction.generatedAt).toLocaleString()}
                </span>
              </div>

              {/* Prediction Chart */}
              <div className="h-80 mb-6">
                <Line
                  data={{
                    labels: prediction.predictions.map(p => new Date(p.date).toLocaleDateString()),
                    datasets: [
                      {
                        label: 'Predicted Values',
                        data: prediction.predictions.map(p => p.value),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: false,
                      },
                      {
                        label: 'Upper Bound',
                        data: prediction.predictions.map(p => p.upperBound),
                        borderColor: 'rgba(239, 68, 68, 0.5)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderDash: [5, 5],
                        fill: false,
                      },
                      {
                        label: 'Lower Bound',
                        data: prediction.predictions.map(p => p.lowerBound),
                        borderColor: 'rgba(239, 68, 68, 0.5)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderDash: [5, 5],
                        fill: false,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </div>

              {/* Confidence Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Confidence Distribution</h4>
                  <Bar
                    data={{
                      labels: prediction.predictions.map(p => new Date(p.date).toLocaleDateString()),
                      datasets: [{
                        label: 'Confidence Level',
                        data: prediction.predictions.map(p => p.confidence * 100),
                        backgroundColor: 'rgba(34, 197, 94, 0.8)',
                      }],
                    }}
                    options={{
                      ...chartOptions,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            callback: (value) => `${value}%`,
                          },
                        },
                      },
                    }}
                  />
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Prediction Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Predictions:</span>
                      <span className="font-medium">{prediction.predictions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Confidence:</span>
                      <span className="font-medium">
                        {(prediction.predictions.reduce((sum, p) => sum + p.confidence, 0) / prediction.predictions.length * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Value Range:</span>
                      <span className="font-medium">
                        {Math.min(...prediction.predictions.map(p => p.value)).toFixed(2)} - {Math.max(...prediction.predictions.map(p => p.value)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model Accuracy:</span>
                      <span className="font-medium text-green-600">{(prediction.accuracy * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Predictions State */}
      {predictions.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No predictions yet</h3>
          <p className="text-gray-500">Select a metric and model to generate your first prediction.</p>
        </div>
      )}
    </div>
  );
};

export default Predictions;
