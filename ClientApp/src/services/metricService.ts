import axios from 'axios';
import { Metric } from '../types/metric';
import { 
  generateSampleMetrics, 
  generateTrendingMetrics, 
  generateMetricsByTimeRange,
  generateMetricsByStatus,
  generateAggregatedMetrics,
  getDistinctCategories,
  getTotalMetricsCount,
  generateSampleDataForUseCase
} from './sampleDataService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5089/api';

// Check if backend is available
const isBackendAvailable = async (): Promise<boolean> => {
  try {
    await axios.get(`${API_BASE_URL}/health`, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
};

// Fetch metrics from backend or fallback to sample data
export const fetchMetrics = async (type: string = 'latest', limit: number = 100): Promise<Metric[]> => {
  try {
    const backendAvailable = await isBackendAvailable();
    
    if (backendAvailable) {
      const response = await axios.get(`${API_BASE_URL}/metrics`, {
        params: { type, limit }
      });
      return response.data;
    } else {
      // Fallback to sample data
      console.log('Backend not available, using sample data');
      return generateSampleMetrics(limit);
    }
  } catch (error) {
    console.log('Error fetching metrics from backend, using sample data:', error);
    return generateSampleMetrics(limit);
  }
};

// Fetch trending metrics
export const fetchTrendingMetrics = async (hours: number = 24, limit: number = 10): Promise<Metric[]> => {
  try {
    const backendAvailable = await isBackendAvailable();
    
    if (backendAvailable) {
      const response = await axios.get(`${API_BASE_URL}/metrics/trending`, {
        params: { hours, limit }
      });
      return response.data;
    } else {
      return generateTrendingMetrics(hours, limit);
    }
  } catch (error) {
    console.log('Error fetching trending metrics, using sample data:', error);
    return generateTrendingMetrics(hours, limit);
  }
};

// Fetch metrics by category
export const fetchMetricsByCategory = async (category: string, limit: number = 50): Promise<Metric[]> => {
  try {
    const backendAvailable = await isBackendAvailable();
    
    if (backendAvailable) {
      const response = await axios.get(`${API_BASE_URL}/metrics/category/${category}`, {
        params: { limit }
      });
      return response.data;
    } else {
      const allMetrics = generateSampleMetrics(200);
      return allMetrics.filter(m => m.category === category).slice(0, limit);
    }
  } catch (error) {
    console.log('Error fetching metrics by category, using sample data:', error);
    const allMetrics = generateSampleMetrics(200);
    return allMetrics.filter(m => m.category === category).slice(0, limit);
  }
};

// Fetch metrics by time range
export const fetchMetricsByTimeRange = async (
  startDate: Date,
  endDate: Date,
  category?: string
): Promise<Metric[]> => {
  try {
    const backendAvailable = await isBackendAvailable();
    
    if (backendAvailable) {
      const response = await axios.get(`${API_BASE_URL}/metrics/range`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          category
        }
      });
      return response.data;
    } else {
      return generateMetricsByTimeRange(startDate, endDate, category);
    }
  } catch (error) {
    console.log('Error fetching metrics by time range, using sample data:', error);
    return generateMetricsByTimeRange(startDate, endDate, category);
  }
};

// Fetch metrics by status
export const fetchMetricsByStatus = async (status: string, limit: number = 50): Promise<Metric[]> => {
  try {
    const backendAvailable = await isBackendAvailable();
    
    if (backendAvailable) {
      const response = await axios.get(`${API_BASE_URL}/metrics/status/${status}`, {
        params: { limit }
      });
      return response.data;
    } else {
      return generateMetricsByStatus(status as 'Normal' | 'Warning' | 'Critical', limit);
    }
  } catch (error) {
    console.log('Error fetching metrics by status, using sample data:', error);
    return generateMetricsByStatus(status as 'Normal' | 'Warning' | 'Critical', limit);
  }
};

// Fetch aggregated metrics
export const fetchAggregatedMetrics = async (
  startDate: Date,
  endDate: Date,
  aggregation: string = 'avg'
): Promise<Record<string, number>> => {
  try {
    const backendAvailable = await isBackendAvailable();
    
    if (backendAvailable) {
      const response = await axios.get(`${API_BASE_URL}/metrics/aggregated`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          aggregation
        }
      });
      return response.data;
    } else {
      // Generate aggregated data for sample categories
      const categories = getDistinctCategories();
      const aggregated: Record<string, number> = {};
      
      categories.forEach(category => {
        const result = generateAggregatedMetrics(category, aggregation as 'avg' | 'sum' | 'min' | 'max');
        Object.assign(aggregated, result);
      });
      
      return aggregated;
    }
  } catch (error) {
    console.log('Error fetching aggregated metrics, using sample data:', error);
    const categories = getDistinctCategories();
    const aggregated: Record<string, number> = {};
    
    categories.forEach(category => {
      const result = generateAggregatedMetrics(category, aggregation as 'avg' | 'sum' | 'min' | 'max');
      Object.assign(aggregated, result);
    });
    
    return aggregated;
  }
};

// Fetch distinct categories
export const fetchDistinctCategories = async (): Promise<string[]> => {
  try {
    const backendAvailable = await isBackendAvailable();
    
    if (backendAvailable) {
      const response = await axios.get(`${API_BASE_URL}/metrics/categories`);
      return response.data;
    } else {
      return getDistinctCategories();
    }
  } catch (error) {
    console.log('Error fetching categories, using sample data:', error);
    return getDistinctCategories();
  }
};

// Fetch total metrics count
export const fetchTotalMetricsCount = async (): Promise<number> => {
  try {
    const backendAvailable = await isBackendAvailable();
    
    if (backendAvailable) {
      const response = await axios.get(`${API_BASE_URL}/metrics/count`);
      return response.data;
    } else {
      return getTotalMetricsCount();
    }
  } catch (error) {
    console.log('Error fetching metrics count, using sample data:', error);
    return getTotalMetricsCount();
  }
};

// Create new metric
export const createMetric = async (metric: Omit<Metric, 'id' | 'timestamp'>): Promise<Metric> => {
  try {
    const backendAvailable = await isBackendAvailable();
    
    if (backendAvailable) {
      const response = await axios.post(`${API_BASE_URL}/metrics`, metric);
      return response.data;
    } else {
      // Simulate creation with sample data
      const newMetric: Metric = {
        ...metric,
        id: `new_metric_${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      
      // In a real app, you might want to store this in localStorage or IndexedDB
      console.log('Backend not available, metric created locally:', newMetric);
      return newMetric;
    }
  } catch (error) {
    console.log('Error creating metric, creating locally:', error);
    const newMetric: Metric = {
      ...metric,
      id: `new_metric_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    return newMetric;
  }
};

// Create multiple metrics
export const createBatchMetrics = async (metrics: Omit<Metric, 'id' | 'timestamp'>[]): Promise<Metric[]> => {
  try {
    const backendAvailable = await isBackendAvailable();
    
    if (backendAvailable) {
      const response = await axios.post(`${API_BASE_URL}/metrics/batch`, metrics);
      return response.data;
    } else {
      // Simulate batch creation
      const newMetrics: Metric[] = metrics.map((metric, index) => ({
        ...metric,
        id: `batch_metric_${Date.now()}_${index}`,
        timestamp: new Date().toISOString(),
      }));
      
      console.log('Backend not available, batch metrics created locally:', newMetrics);
      return newMetrics;
    }
  } catch (error) {
    console.log('Error creating batch metrics, creating locally:', error);
    const newMetrics: Metric[] = metrics.map((metric, index) => ({
      ...metric,
      id: `batch_metric_${Date.now()}_${index}`,
      timestamp: new Date().toISOString(),
    }));
    return newMetrics;
  }
};

// Fetch metrics for specific use case
export const fetchMetricsForUseCase = async (useCase: string): Promise<Metric[]> => {
  try {
    const backendAvailable = await isBackendAvailable();
    
    if (backendAvailable) {
      const response = await axios.get(`${API_BASE_URL}/metrics/usecase/${useCase}`);
      return response.data;
    } else {
      return generateSampleDataForUseCase(useCase);
    }
  } catch (error) {
    console.log('Error fetching metrics for use case, using sample data:', error);
    return generateSampleDataForUseCase(useCase);
  }
};

// Search metrics
export const searchMetrics = async (query: string, limit: number = 50): Promise<Metric[]> => {
  try {
    const backendAvailable = await isBackendAvailable();
    
    if (backendAvailable) {
      const response = await axios.get(`${API_BASE_URL}/metrics/search`, {
        params: { q: query, limit }
      });
      return response.data;
    } else {
      // Simulate search with sample data
      const allMetrics = generateSampleMetrics(200);
      const searchTerm = query.toLowerCase();
      
      return allMetrics.filter(metric => 
        metric.name.toLowerCase().includes(searchTerm) ||
        metric.category.toLowerCase().includes(searchTerm) ||
        metric.description?.toLowerCase().includes(searchTerm)
      ).slice(0, limit);
    }
  } catch (error) {
    console.log('Error searching metrics, using sample data:', error);
    const allMetrics = generateSampleMetrics(200);
    const searchTerm = query.toLowerCase();
    
    return allMetrics.filter(metric => 
      metric.name.toLowerCase().includes(searchTerm) ||
      metric.category.toLowerCase().includes(searchTerm) ||
      metric.description?.toLowerCase().includes(searchTerm)
    ).slice(0, limit);
  }
};

// Get metric statistics
export const getMetricStatistics = async (): Promise<{
  total: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  recentActivity: number;
}> => {
  try {
    const backendAvailable = await isBackendAvailable();
    
    if (backendAvailable) {
      const response = await axios.get(`${API_BASE_URL}/metrics/statistics`);
      return response.data;
    } else {
      // Generate statistics from sample data
      const allMetrics = generateSampleMetrics(200);
      const byCategory: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      
      allMetrics.forEach(metric => {
        byCategory[metric.category] = (byCategory[metric.category] || 0) + 1;
        byStatus[metric.status] = (byStatus[metric.status] || 0) + 1;
      });
      
      return {
        total: allMetrics.length,
        byCategory,
        byStatus,
        recentActivity: allMetrics.filter(m => {
          const hoursAgo = (Date.now() - new Date(m.timestamp).getTime()) / (1000 * 60 * 60);
          return hoursAgo <= 1; // Last hour
        }).length,
      };
    }
  } catch (error) {
    console.log('Error fetching metric statistics, using sample data:', error);
    const allMetrics = generateSampleMetrics(200);
    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    
    allMetrics.forEach(metric => {
      byCategory[metric.category] = (byCategory[metric.category] || 0) + 1;
      byStatus[metric.status] = (byStatus[metric.status] || 0) + 1;
    });
    
    return {
      total: allMetrics.length,
      byCategory,
      byStatus,
      recentActivity: allMetrics.filter(m => {
        const hoursAgo = (Date.now() - new Date(m.timestamp).getTime()) / (1000 * 60 * 60);
        return hoursAgo <= 1;
      }).length,
    };
  }
};

// Export metrics
export const exportMetrics = async (
  format: 'csv' | 'json' | 'excel',
  filters?: {
    category?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<string> => {
  try {
    const backendAvailable = await isBackendAvailable();
    
    if (backendAvailable) {
      const response = await axios.post(`${API_BASE_URL}/metrics/export`, {
        format,
        filters
      });
      return response.data.downloadUrl;
    } else {
      // Simulate export with sample data
      let metrics = generateSampleMetrics(100);
      
      if (filters) {
        if (filters.category) {
          metrics = metrics.filter(m => m.category === filters.category);
        }
        if (filters.status) {
          metrics = metrics.filter(m => m.status === filters.status);
        }
        if (filters.startDate && filters.endDate) {
          metrics = metrics.filter(m => {
            const timestamp = new Date(m.timestamp);
            return timestamp >= filters.startDate! && timestamp <= filters.endDate!;
          });
        }
      }
      
      if (format === 'json') {
        return `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(metrics, null, 2))}`;
      } else if (format === 'csv') {
        const headers = ['Name', 'Value', 'Unit', 'Category', 'Status', 'Timestamp'];
        const csvContent = [headers, ...metrics.map(m => [
          m.name,
          m.value,
          m.unit,
          m.category,
          m.status,
          m.timestamp
        ])].map(row => row.join(',')).join('\n');
        
        return `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
      }
      
      return '';
    }
  } catch (error) {
    console.log('Error exporting metrics, using sample data:', error);
    return '';
  }
};
