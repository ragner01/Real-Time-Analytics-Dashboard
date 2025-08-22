import React from 'react';
import { motion } from 'framer-motion';
import { Metric } from '../../types/metric';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface MetricCardProps {
  metric: Metric;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Normal':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'Critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal':
        return 'from-green-500 to-green-600';
      case 'Warning':
        return 'from-yellow-500 to-yellow-600';
      case 'Critical':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getChangeIcon = (changePercentage?: number) => {
    if (!changePercentage) return null;
    if (changePercentage > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (changePercentage < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const cardVariants = {
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
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const iconVariants = {
    hidden: { rotate: -180, scale: 0 },
    visible: {
      rotate: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 overflow-hidden relative group"
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getStatusColor(metric.status)} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Status indicator */}
      <motion.div
        variants={iconVariants}
        className="absolute top-4 right-4"
      >
        {getStatusIcon(metric.status)}
      </motion.div>

      {/* Metric content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4">
          <motion.h3
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-semibold text-gray-800 mb-1 truncate"
          >
            {metric.name}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-500 capitalize"
          >
            {metric.category}
          </motion.p>
        </div>

        {/* Value display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">
              {metric.value.toLocaleString()}
            </span>
            <span className="text-lg text-gray-500">
              {metric.unit}
            </span>
          </div>
        </motion.div>

        {/* Change indicator */}
        {metric.changePercentage !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-2"
          >
            {getChangeIcon(metric.changePercentage)}
            <span className={`text-sm font-medium ${
              metric.changePercentage > 0 ? 'text-green-600' : 
              metric.changePercentage < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {metric.changePercentage > 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%
            </span>
          </motion.div>
        )}

        {/* Timestamp */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 pt-4 border-t border-gray-100"
        >
          <p className="text-xs text-gray-400">
            Last updated: {new Date(metric.timestamp).toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* Hover effect overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl pointer-events-none"
      />
    </motion.div>
  );
};

export default MetricCard;
