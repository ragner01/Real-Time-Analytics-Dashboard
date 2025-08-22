import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import toast from 'react-hot-toast';

interface SignalRContextType {
  connection: HubConnection | null;
  isConnected: boolean;
  joinDashboardGroup: (dashboardId: string) => Promise<void>;
  leaveDashboardGroup: (dashboardId: string) => Promise<void>;
  joinMetricGroup: (metricName: string) => Promise<void>;
  leaveMetricGroup: (metricName: string) => Promise<void>;
  joinReportGroup: (reportId: string) => Promise<void>;
  leaveReportGroup: (reportId: string) => Promise<void>;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (context === undefined) {
    throw new Error('useSignalR must be used within a SignalRProvider');
  }
  return context;
};

interface SignalRProviderProps {
  children: ReactNode;
}

export const SignalRProvider: React.FC<SignalRProviderProps> = ({ children }) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:7001/hub/analytics')
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          setIsConnected(true);
          console.log('SignalR Connected');
          toast.success('Real-time connection established');
        })
        .catch(err => {
          console.error('SignalR Connection Error: ', err);
          toast.error('Failed to establish real-time connection');
        });

      connection.onclose(() => {
        setIsConnected(false);
        console.log('SignalR Disconnected');
        toast.error('Real-time connection lost');
      });

      // Set up event handlers
      connection.on('metricAdded', (metric) => {
        console.log('New metric received:', metric);
        toast.success(`New metric: ${metric.name} = ${metric.value}`);
      });

      connection.on('metricsBatchAdded', (metrics) => {
        console.log('Batch metrics received:', metrics);
        toast.success(`${metrics.length} new metrics received`);
      });

      connection.on('widgetUpdated', (widgetId, widgetData) => {
        console.log('Widget updated:', widgetId, widgetData);
      });

      connection.on('dashboardRefresh', () => {
        console.log('Dashboard refresh requested');
      });

      connection.on('reportReady', (reportData) => {
        console.log('Report ready:', reportData);
        toast.success('Report generation completed');
      });

      connection.on('predictionReady', (predictionData) => {
        console.log('Prediction ready:', predictionData);
        toast.success('Prediction calculation completed');
      });
    }
  }, [connection]);

  const joinDashboardGroup = async (dashboardId: string) => {
    if (connection && isConnected) {
      try {
        await connection.invoke('JoinDashboardGroup', dashboardId);
        console.log(`Joined dashboard group: ${dashboardId}`);
      } catch (err) {
        console.error('Error joining dashboard group:', err);
      }
    }
  };

  const leaveDashboardGroup = async (dashboardId: string) => {
    if (connection && isConnected) {
      try {
        await connection.invoke('LeaveDashboardGroup', dashboardId);
        console.log(`Left dashboard group: ${dashboardId}`);
      } catch (err) {
        console.error('Error leaving dashboard group:', err);
      }
    }
  };

  const joinMetricGroup = async (metricName: string) => {
    if (connection && isConnected) {
      try {
        await connection.invoke('JoinMetricGroup', metricName);
        console.log(`Joined metric group: ${metricName}`);
      } catch (err) {
        console.error('Error joining metric group:', err);
      }
    }
  };

  const leaveMetricGroup = async (metricName: string) => {
    if (connection && isConnected) {
      try {
        await connection.invoke('LeaveMetricGroup', metricName);
        console.log(`Left metric group: ${metricName}`);
      } catch (err) {
        console.error('Error leaving metric group:', err);
      }
    }
  };

  const joinReportGroup = async (reportId: string) => {
    if (connection && isConnected) {
      try {
        await connection.invoke('JoinReportGroup', reportId);
        console.log(`Joined report group: ${reportId}`);
      } catch (err) {
        console.error('Error joining report group:', err);
      }
    }
  };

  const leaveReportGroup = async (reportId: string) => {
    if (connection && isConnected) {
      try {
        await connection.invoke('LeaveReportGroup', reportId);
        console.log(`Left report group: ${reportId}`);
      } catch (err) {
        console.error('Error leaving report group:', err);
      }
    }
  };

  const value: SignalRContextType = {
    connection,
    isConnected,
    joinDashboardGroup,
    leaveDashboardGroup,
    joinMetricGroup,
    leaveMetricGroup,
    joinReportGroup,
    leaveReportGroup,
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
};
