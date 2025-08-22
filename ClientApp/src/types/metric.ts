export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  category: string;
  status: 'Normal' | 'Warning' | 'Critical';
  timestamp: string;
  description?: string;
  source?: string;
  metadata?: Record<string, any>;
  threshold?: number;
  previousValue?: number;
  changePercentage?: number;
}

export interface MetricFilter {
  category?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  minValue?: number;
  maxValue?: number;
  source?: string;
}

export interface MetricAggregation {
  type: 'avg' | 'sum' | 'min' | 'max' | 'count';
  field: string;
  groupBy?: string;
}

export interface MetricTrend {
  metricId: string;
  metricName: string;
  values: Array<{
    timestamp: string;
    value: number;
  }>;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  period: string;
}

export interface MetricAlert {
  id: string;
  metricId: string;
  metricName: string;
  alertType: 'threshold_exceeded' | 'trend_change' | 'anomaly_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface MetricDashboard {
  id: string;
  name: string;
  description?: string;
  metrics: string[]; // Array of metric IDs
  layout: DashboardLayout;
  refreshInterval: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  widgets: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'gauge' | 'status';
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  configuration: Record<string, any>;
  dataSource: string; // Metric ID or query
}

export interface MetricReport {
  id: string;
  name: string;
  description?: string;
  metrics: string[];
  filters: MetricFilter[];
  aggregations: MetricAggregation[];
  format: 'pdf' | 'csv' | 'json' | 'excel';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    timezone: string;
  };
  recipients: string[];
  createdBy: string;
  createdAt: string;
  lastRunAt?: string;
  nextRunAt?: string;
}

export interface MetricPrediction {
  id: string;
  metricId: string;
  metricName: string;
  modelType: 'linear' | 'exponential' | 'moving_average' | 'trend' | 'ml';
  predictions: Array<{
    timestamp: string;
    predictedValue: number;
    confidence: number;
    lowerBound: number;
    upperBound: number;
  }>;
  accuracy: number;
  modelParameters: Record<string, any>;
  generatedAt: string;
  expiresAt: string;
}

export interface MetricComparison {
  metricId: string;
  metricName: string;
  currentValue: number;
  previousValue: number;
  changePercentage: number;
  changeDirection: 'increase' | 'decrease' | 'no_change';
  period: string;
  significance: 'low' | 'medium' | 'high';
}

export interface MetricCorrelation {
  metric1Id: string;
  metric1Name: string;
  metric2Id: string;
  metric2Name: string;
  correlationCoefficient: number;
  strength: 'weak' | 'moderate' | 'strong';
  direction: 'positive' | 'negative';
  confidence: number;
  sampleSize: number;
  analysisDate: string;
}

export interface MetricAnomaly {
  id: string;
  metricId: string;
  metricName: string;
  anomalyType: 'spike' | 'drop' | 'trend_change' | 'seasonal_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedValue: number;
  expectedValue: number;
  deviation: number;
  confidence: number;
  timestamp: string;
  duration?: number; // Duration in minutes
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface MetricHealth {
  metricId: string;
  metricName: string;
  overallHealth: 'healthy' | 'degraded' | 'critical';
  healthScore: number; // 0-100
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
    description: string;
  }>;
  lastUpdated: string;
  recommendations: string[];
}

export interface MetricPerformance {
  metricId: string;
  metricName: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  slaCompliance: number;
  performanceScore: number; // 0-100
  benchmark: {
    industry: string;
    percentile: number;
    value: number;
  };
  trends: {
    responseTime: 'improving' | 'stable' | 'degrading';
    throughput: 'improving' | 'stable' | 'degrading';
    errorRate: 'improving' | 'stable' | 'degrading';
  };
}

export interface MetricCost {
  metricId: string;
  metricName: string;
  resourceType: 'compute' | 'storage' | 'network' | 'database';
  costPerUnit: number;
  unitsConsumed: number;
  totalCost: number;
  currency: string;
  billingPeriod: string;
  costTrend: 'increasing' | 'decreasing' | 'stable';
  optimizationOpportunities: string[];
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
    utilization: number;
  };
}

export interface MetricCompliance {
  metricId: string;
  metricName: string;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending_review';
  regulations: string[];
  requirements: Array<{
    requirement: string;
    status: 'met' | 'not_met' | 'partially_met';
    description: string;
    lastChecked: string;
  }>;
  auditTrail: Array<{
    action: string;
    performedBy: string;
    timestamp: string;
    details: string;
  }>;
  nextReviewDate: string;
  riskLevel: 'low' | 'medium' | 'high';
}
