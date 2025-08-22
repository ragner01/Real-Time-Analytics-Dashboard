import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import MetricCard from '../../components/Dashboard/MetricCard';
import ChartWidget from '../../components/Dashboard/ChartWidget';
import { fetchMetrics, fetchTrendingMetrics } from '../../services/metricService';
import { fetchDashboard } from '../../services/dashboardService';
import { useAuth } from '../../contexts/AuthContext';
import { useSignalR } from '../../contexts/SignalRContext';
import toast from 'react-hot-toast';

const ResponsiveGridLayout = WidthProvider(Responsive);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { joinDashboardGroup, leaveDashboardGroup } = useSignalR();
  const [layout, setLayout] = useState<any[]>([]);
  const [widgets, setWidgets] = useState<any[]>([]);

  // Fetch dashboard configuration
  const { data: dashboard, isLoading: dashboardLoading } = useQuery(
    ['dashboard', user?.id],
    () => fetchDashboard(user?.id || ''),
    {
      enabled: !!user?.id,
      onSuccess: (data) => {
        if (data) {
          setWidgets(data.widgets || []);
          setLayout(data.widgets?.map((widget: any, index: number) => ({
            i: widget.id,
            x: widget.positionX || (index % 2) * 6,
            y: widget.positionY || Math.floor(index / 2) * 4,
            w: widget.width || 6,
            h: widget.height || 4,
            minW: 3,
            minH: 2,
          })) || []);
        }
      }
    }
  );

  // Fetch metrics data
  const { data: metrics, isLoading: metricsLoading } = useQuery(
    ['metrics', 'latest'],
    () => fetchMetrics('latest', 10),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const { data: trendingMetrics } = useQuery(
    ['metrics', 'trending'],
    () => fetchTrendingMetrics(24, 5),
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  useEffect(() => {
    if (dashboard?.id) {
      joinDashboardGroup(dashboard.id);
      return () => {
        if (dashboard.id) {
          leaveDashboardGroup(dashboard.id);
        }
      };
    }
  }, [dashboard?.id, joinDashboardGroup, leaveDashboardGroup]);

  const onLayoutChange = (newLayout: any[]) => {
    setLayout(newLayout);
    // Here you would save the new layout to the backend
  };

  const addWidget = (type: string) => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: `New ${type} Widget`,
      configuration: {},
      positionX: 0,
      positionY: 0,
      width: 6,
      height: 4,
      isVisible: true,
    };

    setWidgets([...widgets, newWidget]);
    setLayout([
      ...layout,
      {
        i: newWidget.id,
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        minW: 3,
        minH: 2,
      }
    ]);

    toast.success(`${type} widget added`);
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    setLayout(layout.filter(l => l.i !== widgetId));
    toast.success('Widget removed');
  };

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case 'metric':
        return (
          <MetricCard
            key={widget.id}
            title={widget.title}
            metrics={metrics || []}
            onRemove={() => removeWidget(widget.id)}
          />
        );
      case 'chart':
        return (
          <ChartWidget
            key={widget.id}
            title={widget.title}
            configuration={widget.configuration}
            data={trendingMetrics || []}
            onRemove={() => removeWidget(widget.id)}
          />
        );
      default:
        return (
          <div key={widget.id} className="chart-container">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
              <button
                onClick={() => removeWidget(widget.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-gray-500">Widget type: {widget.type}</p>
          </div>
        );
    }
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Monitor your key metrics and insights in real-time</p>
        </div>
        
        {/* Widget controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => addWidget('metric')}
            className="btn-primary"
          >
            Add Metric
          </button>
          <button
            onClick={() => addWidget('chart')}
            className="btn-secondary"
          >
            Add Chart
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">M</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Metrics</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metricsLoading ? '...' : (metrics?.length || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold">T</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Trending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {trendingMetrics?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-semibold">W</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Widgets</p>
              <p className="text-2xl font-semibold text-gray-900">{widgets.length}</p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">U</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Widgets grid */}
      {widgets.length > 0 ? (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          onLayoutChange={onLayoutChange}
          isDraggable={true}
          isResizable={true}
        >
          {widgets.map(renderWidget)}
        </ResponsiveGridLayout>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No widgets</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first widget.</p>
          <div className="mt-6">
            <button
              onClick={() => addWidget('metric')}
              className="btn-primary"
            >
              Add Widget
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
