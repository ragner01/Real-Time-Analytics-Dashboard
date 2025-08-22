import { Metric } from '../types/metric';

// Sample metric categories and their typical ranges
const metricCategories = {
  'CPU Usage': {
    unit: '%',
    min: 0,
    max: 100,
    normalRange: [20, 80],
    criticalThreshold: 90,
    warningThreshold: 75,
  },
  'Memory Usage': {
    unit: '%',
    min: 0,
    max: 100,
    normalRange: [30, 85],
    criticalThreshold: 95,
    warningThreshold: 80,
  },
  'Disk Usage': {
    unit: '%',
    min: 0,
    max: 100,
    normalRange: [40, 90],
    criticalThreshold: 95,
    warningThreshold: 85,
  },
  'Network Traffic': {
    unit: 'MB/s',
    min: 0,
    max: 1000,
    normalRange: [10, 500],
    criticalThreshold: 800,
    warningThreshold: 600,
  },
  'Response Time': {
    unit: 'ms',
    min: 0,
    max: 5000,
    normalRange: [50, 500],
    criticalThreshold: 3000,
    warningThreshold: 1000,
  },
  'Error Rate': {
    unit: '%',
    min: 0,
    max: 10,
    normalRange: [0, 2],
    criticalThreshold: 5,
    warningThreshold: 3,
  },
  'Active Users': {
    unit: 'users',
    min: 0,
    max: 10000,
    normalRange: [100, 8000],
    criticalThreshold: 9500,
    warningThreshold: 8500,
  },
  'Database Connections': {
    unit: 'connections',
    min: 0,
    max: 1000,
    normalRange: [50, 800],
    criticalThreshold: 950,
    warningThreshold: 850,
  },
  'Queue Length': {
    unit: 'items',
    min: 0,
    max: 1000,
    normalRange: [0, 200],
    criticalThreshold: 800,
    warningThreshold: 500,
  },
  'Cache Hit Rate': {
    unit: '%',
    min: 0,
    max: 100,
    normalRange: [70, 98],
    criticalThreshold: 50,
    warningThreshold: 60,
  },
};

// Generate realistic time series data with trends and seasonality
// const generateTimeSeriesData = (
//   baseValue: number,
//   trend: number,
//   seasonality: number,
//   noise: number,
//   periods: number
// ): number[] => {
//   const data: number[] = [];
//   let currentValue = baseValue;

//   for (let i = 0; i < periods; i++) {
//     // Add trend
//     currentValue += trend;
    
//     // Add seasonality (daily pattern)
//     const hourOfDay = i % 24;
//     const seasonalFactor = 1 + seasonality * Math.sin((hourOfDay / 24) * 2 * Math.PI);
    
//     // Add noise
//     const noiseFactor = 1 + (Math.random() - 0.5) * noise;
    
//     data.push(Math.max(0, currentValue * seasonalFactor * noiseFactor));
//   }

//   return data;
// };

// Generate sample metrics with realistic patterns
export const generateSampleMetrics = (count: number = 100): Metric[] => {
  const metrics: Metric[] = [];
  const now = new Date();
  const categoryNames = Object.keys(metricCategories);

  for (let i = 0; i < count; i++) {
    const category = categoryNames[Math.floor(Math.random() * categoryNames.length)];
    const config = metricCategories[category as keyof typeof metricCategories];
    
    // Generate base value with some randomness
    const baseValue = config.min + Math.random() * (config.max - config.min);
    
    // Generate time series data for the last 24 hours
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    
    // Add some realistic patterns
    let value = baseValue;
    
    // Add time-based variations
    const hourOfDay = timestamp.getHours();
    if (hourOfDay >= 9 && hourOfDay <= 17) {
      // Business hours - higher activity
      value *= 1.2 + Math.random() * 0.3;
    } else if (hourOfDay >= 22 || hourOfDay <= 6) {
      // Night hours - lower activity
      value *= 0.3 + Math.random() * 0.4;
    }
    
    // Add some random spikes and dips
    if (Math.random() < 0.05) {
      // 5% chance of a spike
      value *= 1.5 + Math.random() * 1.0;
    } else if (Math.random() < 0.03) {
      // 3% chance of a dip
      value *= 0.3 + Math.random() * 0.4;
    }
    
    // Ensure value is within bounds
    value = Math.max(config.min, Math.min(config.max, value));
    
    // Determine status based on thresholds
    let status: 'Normal' | 'Warning' | 'Critical' = 'Normal';
    if (value >= config.criticalThreshold) {
      status = 'Critical';
    } else if (value >= config.warningThreshold) {
      status = 'Warning';
    }
    
    // Calculate change percentage (simulate previous value)
    const previousValue = baseValue * (0.8 + Math.random() * 0.4);
    const changePercentage = ((value - previousValue) / previousValue) * 100;
    
    const metric: Metric = {
      id: `metric_${Date.now()}_${i}`,
      name: `${category} #${i + 1}`,
      value: Math.round(value * 100) / 100,
      unit: config.unit,
      category,
      status,
      timestamp: timestamp.toISOString(),
      description: `Sample ${category.toLowerCase()} metric for demonstration purposes`,
      source: 'Sample Data',
      metadata: {
        location: 'Server Room A',
        environment: 'Production',
        service: 'Web Application',
      },
      threshold: config.warningThreshold,
      previousValue: Math.round(previousValue * 100) / 100,
      changePercentage: Math.round(changePercentage * 100) / 100,
    };
    
    metrics.push(metric);
  }

  return metrics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Generate trending metrics (metrics with significant changes)
export const generateTrendingMetrics = (hours: number = 24, count: number = 10): Metric[] => {
  const metrics: Metric[] = [];
  const now = new Date();
  const categoryNames = Object.keys(metricCategories);

  for (let i = 0; i < count; i++) {
    const category = categoryNames[Math.floor(Math.random() * categoryNames.length)];
    const config = metricCategories[category as keyof typeof metricCategories];
    
    // Generate a metric with significant trend
    const baseValue = config.min + Math.random() * (config.max - config.min);
    const trendDirection = Math.random() > 0.5 ? 1 : -1;
    const trendStrength = 0.1 + Math.random() * 0.3; // 10-40% change
    
    const hoursAgo = Math.floor(Math.random() * hours);
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    
    // Apply trend
    let value = baseValue * (1 + trendDirection * trendStrength);
    value = Math.max(config.min, Math.min(config.max, value));
    
    // Ensure this is a trending metric by making change percentage significant
    const previousValue = baseValue;
    const changePercentage = ((value - previousValue) / previousValue) * 100;
    
    // Only include if change is significant (>5%)
    if (Math.abs(changePercentage) > 5) {
      const status: 'Normal' | 'Warning' | 'Critical' = 
        value >= config.criticalThreshold ? 'Critical' :
        value >= config.warningThreshold ? 'Warning' : 'Normal';
      
      const metric: Metric = {
        id: `trending_${Date.now()}_${i}`,
        name: `${category} Trend`,
        value: Math.round(value * 100) / 100,
        unit: config.unit,
        category,
        status,
        timestamp: timestamp.toISOString(),
        description: `Trending ${category.toLowerCase()} metric with ${changePercentage > 0 ? 'increasing' : 'decreasing'} pattern`,
        source: 'Sample Data',
        metadata: {
          location: 'Server Room A',
          environment: 'Production',
          service: 'Web Application',
          trend: changePercentage > 0 ? 'upward' : 'downward',
        },
        threshold: config.warningThreshold,
        previousValue: Math.round(previousValue * 100) / 100,
        changePercentage: Math.round(changePercentage * 100) / 100,
      };
      
      metrics.push(metric);
    }
  }

  return metrics.sort((a, b) => Math.abs(b.changePercentage || 0) - Math.abs(a.changePercentage || 0));
};

// Generate aggregated metrics by category
export const generateAggregatedMetrics = (category: string, aggregation: 'avg' | 'sum' | 'min' | 'max' = 'avg'): Record<string, number> => {
  const config = metricCategories[category as keyof typeof metricCategories];
  if (!config) return {};
  
  const baseValue = config.min + Math.random() * (config.max - config.min);
  let aggregatedValue = baseValue;
  
  switch (aggregation) {
    case 'sum':
      aggregatedValue = baseValue * (10 + Math.random() * 20); // Sum of multiple instances
      break;
    case 'min':
      aggregatedValue = baseValue * (0.3 + Math.random() * 0.4); // Minimum value
      break;
    case 'max':
      aggregatedValue = baseValue * (1.2 + Math.random() * 0.8); // Maximum value
      break;
    default: // avg
      aggregatedValue = baseValue;
  }
  
  return {
    [category]: Math.round(aggregatedValue * 100) / 100,
  };
};

// Generate metrics by time range
export const generateMetricsByTimeRange = (
  startDate: Date,
  endDate: Date,
  category?: string
): Metric[] => {
  const metrics: Metric[] = [];
  const timeDiff = endDate.getTime() - startDate.getTime();
  const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
  
  // Generate metrics for each hour in the range
  for (let i = 0; i <= hoursDiff; i++) {
    const timestamp = new Date(startDate.getTime() + i * 60 * 60 * 1000);
    const categoryNames = category ? [category] : Object.keys(metricCategories);
    
    categoryNames.forEach(cat => {
      const config = metricCategories[cat as keyof typeof metricCategories];
      const baseValue = config.min + Math.random() * (config.max - config.min);
      
      // Add time-based patterns
      let value = baseValue;
      const hourOfDay = timestamp.getHours();
      
      if (hourOfDay >= 9 && hourOfDay <= 17) {
        value *= 1.1 + Math.random() * 0.2;
      } else if (hourOfDay >= 22 || hourOfDay <= 6) {
        value *= 0.4 + Math.random() * 0.3;
      }
      
      value = Math.max(config.min, Math.min(config.max, value));
      
      const status: 'Normal' | 'Warning' | 'Critical' = 
        value >= config.criticalThreshold ? 'Critical' :
        value >= config.warningThreshold ? 'Warning' : 'Normal';
      
      const metric: Metric = {
        id: `time_${timestamp.getTime()}_${cat}`,
        name: `${cat} at ${timestamp.toLocaleTimeString()}`,
        value: Math.round(value * 100) / 100,
        unit: config.unit,
        category: cat,
        status,
        timestamp: timestamp.toISOString(),
        description: `Hourly ${cat.toLowerCase()} metric`,
        source: 'Sample Data',
        metadata: {
          location: 'Server Room A',
          environment: 'Production',
          service: 'Web Application',
          timeSlot: `${timestamp.getHours()}:00`,
        },
        threshold: config.warningThreshold,
        previousValue: Math.round(baseValue * 100) / 100,
        changePercentage: Math.round(((value - baseValue) / baseValue) * 100 * 100) / 100,
      };
      
      metrics.push(metric);
    });
  }
  
  return metrics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Generate metrics by status
export const generateMetricsByStatus = (status: 'Normal' | 'Warning' | 'Critical', count: number = 20): Metric[] => {
  const metrics: Metric[] = [];
  const categoryNames = Object.keys(metricCategories);
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const category = categoryNames[Math.floor(Math.random() * categoryNames.length)];
    const config = metricCategories[category as keyof typeof metricCategories];
    
    let value: number;
    
    // Generate value based on status
    switch (status) {
      case 'Critical':
        value = config.criticalThreshold + Math.random() * (config.max - config.criticalThreshold);
        break;
      case 'Warning':
        value = config.warningThreshold + Math.random() * (config.criticalThreshold - config.warningThreshold);
        break;
      default: // Normal
        value = config.min + Math.random() * (config.warningThreshold - config.min);
    }
    
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    
    const metric: Metric = {
      id: `status_${status}_${Date.now()}_${i}`,
      name: `${category} (${status})`,
      value: Math.round(value * 100) / 100,
      unit: config.unit,
      category,
      status,
      timestamp: timestamp.toISOString(),
      description: `${status} status ${category.toLowerCase()} metric`,
      source: 'Sample Data',
      metadata: {
        location: 'Server Room A',
        environment: 'Production',
        service: 'Web Application',
        alertLevel: status,
      },
      threshold: config.warningThreshold,
      previousValue: Math.round((value * 0.8) * 100) / 100,
      changePercentage: Math.round(25 * 100) / 100, // Simulate 25% increase
    };
    
    metrics.push(metric);
  }
  
  return metrics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Get distinct categories
export const getDistinctCategories = (): string[] => {
  return Object.keys(metricCategories);
};

// Get total count of metrics
export const getTotalMetricsCount = (): number => {
  return 1000; // Simulate large dataset
};

// Generate sample data for specific use cases
export const generateSampleDataForUseCase = (useCase: string): Metric[] => {
  switch (useCase) {
    case 'performance':
      return generateSampleMetrics(50).filter(m => 
        ['CPU Usage', 'Memory Usage', 'Response Time'].includes(m.category)
      );
    case 'infrastructure':
      return generateSampleMetrics(50).filter(m => 
        ['Disk Usage', 'Network Traffic', 'Database Connections'].includes(m.category)
      );
    case 'user_activity':
      return generateSampleMetrics(50).filter(m => 
        ['Active Users', 'Queue Length', 'Cache Hit Rate'].includes(m.category)
      );
    case 'errors':
      return generateSampleMetrics(50).filter(m => 
        ['Error Rate', 'Response Time'].includes(m.category)
      );
    default:
      return generateSampleMetrics(50);
  }
};
