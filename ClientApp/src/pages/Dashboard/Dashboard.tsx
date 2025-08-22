import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { useSignalR } from '../../contexts/SignalRContext';
import { fetchMetrics, fetchTrendingMetrics } from '../../services/metricService';
import MetricCard from '../../components/Dashboard/MetricCard';
import ChartWidget from '../../components/Dashboard/ChartWidget';
import { 
  TrendingUp, 
  Activity, 
  BarChart3, 
  PieChart, 
  Settings, 
  RefreshCw,
  Plus,
  Grid3X3,
  List
} from 'lucide-react';

interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'summary';
  title: string;
  data: any;
  position: { x: number; y: number; w: number; h: number };
}

const Dashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const { isConnected } = useSignalR();

  // Fetch dashboard data
  const { data: metrics, isLoading: metricsLoading } = useQuery(
    ['dashboard-metrics'],
    () => fetchMetrics('latest', 50),
    { refetchInterval: 30000 }
  );

  const { data: trendingMetrics } = useQuery(
    ['dashboard-trending'],
    () => fetchTrendingMetrics(24, 10),
    { refetchInterval: 60000 }
  );

  // Initialize default widgets
  useEffect(() => {
    if (metrics && trendingMetrics) {
      const defaultWidgets: DashboardWidget[] = [
        {
          id: '1',
          type: 'summary',
          title: 'System Overview',
          data: { metrics, trending: trendingMetrics },
          position: { x: 0, y: 0, w: 12, h: 2 }
        },
        {
          id: '2',
          type: 'chart',
          title: 'Performance Trends',
          data: { metrics, type: 'line' },
          position: { x: 0, y: 2, w: 6, h: 4 }
        },
        {
          id: '3',
          type: 'chart',
          title: 'Category Distribution',
          data: { metrics, type: 'doughnut' },
          position: { x: 6, y: 2, w: 6, h: 4 }
        },
        {
          id: '4',
          type: 'metric',
          title: 'Key Metrics',
          data: { metrics: metrics?.slice(0, 4) },
          position: { x: 0, y: 6, w: 12, h: 2 }
        }
      ];
      setWidgets(defaultWidgets);
    }
  }, [metrics, trendingMetrics]);

  const addWidget = () => {
    const newWidget: DashboardWidget = {
      id: Date.now().toString(),
      type: 'chart',
      title: 'New Widget',
      data: { metrics, type: 'bar' },
      position: { x: 0, y: widgets.length * 4, w: 6, h: 4 }
    };
    setWidgets([...widgets, newWidget]);
    setIsAddingWidget(false);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const widgetVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  if (metricsLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-gray-800 mb-2"
          >
            Loading Dashboard
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600"
          >
            Preparing your analytics view...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6"
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Analytics Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 mt-2"
            >
              Real-time insights and performance monitoring
            </motion.p>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex bg-white rounded-lg shadow-lg p-1"
            >
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List size={20} />
              </button>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddingWidget(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Widget</span>
            </motion.button>
          </div>
        </div>

        {/* Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-4 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity size={16} className="text-blue-500" />
                <span className="text-sm text-gray-600">
                  {metrics?.length || 0} metrics active
                </span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw size={20} />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Widgets Grid */}
      <motion.div
        variants={containerVariants}
        className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-12 gap-6' 
            : 'space-y-6'
        }`}
      >
        <AnimatePresence>
          {widgets.map((widget) => (
            <motion.div
              key={widget.id}
              variants={widgetVariants}
              layout
              className={`${
                viewMode === 'grid' 
                  ? `col-span-${widget.position.w}` 
                  : 'w-full'
              }`}
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">{widget.title}</h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeWidget(widget.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      ×
                    </motion.button>
                  </div>
                </div>
                
                <div className="p-6">
                  {widget.type === 'metric' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {widget.data.metrics?.map((metric: any, index: number) => (
                        <MetricCard key={index} metric={metric} />
                      ))}
                    </div>
                  )}
                  
                  {widget.type === 'chart' && (
                    <ChartWidget 
                      data={widget.data} 
                      type={widget.data.type} 
                    />
                  )}
                  
                  {widget.type === 'summary' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center"
                        >
                          <TrendingUp size={24} className="mx-auto mb-2" />
                          <div className="text-2xl font-bold">{metrics?.length || 0}</div>
                          <div className="text-sm opacity-90">Total Metrics</div>
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center"
                        >
                          <BarChart3 size={24} className="mx-auto mb-2" />
                          <div className="text-2xl font-bold">
                            {metrics?.filter((m: any) => m.status === 'Normal').length || 0}
                          </div>
                          <div className="text-sm opacity-90">Healthy</div>
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center"
                        >
                          <PieChart size={24} className="mx-auto mb-2" />
                          <div className="text-2xl font-bold">
                            {trendingMetrics?.length || 0}
                          </div>
                          <div className="text-sm opacity-90">Trending</div>
                        </motion.div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Add Widget Modal */}
      <AnimatePresence>
        {isAddingWidget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setIsAddingWidget(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-96 max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Add New Widget</h3>
              <div className="space-y-4">
                <button
                  onClick={addWidget}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Chart Widget
                </button>
                <button
                  onClick={() => setIsAddingWidget(false)}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
