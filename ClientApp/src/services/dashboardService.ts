import axios from 'axios';

const API_BASE_URL = 'https://localhost:7001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  configuration: Record<string, any>;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  isVisible: boolean;
}

export interface Dashboard {
  id?: string;
  name: string;
  description: string;
  userId: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
  settings: Record<string, any>;
}

export const fetchDashboard = async (userId: string): Promise<Dashboard | null> => {
  try {
    const response = await api.get(`/dashboards/user/${userId}/default`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // No default dashboard found, create one
      return createDefaultDashboard(userId);
    }
    console.error('Error fetching dashboard:', error);
    throw error;
  }
};

export const fetchUserDashboards = async (userId: string): Promise<Dashboard[]> => {
  try {
    const response = await api.get(`/dashboards/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user dashboards:', error);
    throw error;
  }
};

export const createDashboard = async (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> => {
  try {
    const response = await api.post('/dashboards', dashboard);
    return response.data;
  } catch (error) {
    console.error('Error creating dashboard:', error);
    throw error;
  }
};

export const updateDashboard = async (id: string, dashboard: Partial<Dashboard>): Promise<boolean> => {
  try {
    await api.put(`/dashboards/${id}`, dashboard);
    return true;
  } catch (error) {
    console.error('Error updating dashboard:', error);
    throw error;
  }
};

export const deleteDashboard = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/dashboards/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting dashboard:', error);
    throw error;
  }
};

export const updateWidget = async (
  dashboardId: string,
  widgetId: string,
  widget: Partial<DashboardWidget>
): Promise<boolean> => {
  try {
    await api.put(`/dashboards/${dashboardId}/widgets/${widgetId}`, widget);
    return true;
  } catch (error) {
    console.error('Error updating widget:', error);
    throw error;
  }
};

const createDefaultDashboard = async (userId: string): Promise<Dashboard> => {
  const defaultDashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'> = {
    name: 'Default Dashboard',
    description: 'Your default analytics dashboard',
    userId,
    isDefault: true,
    widgets: [
      {
        id: 'default-metrics',
        type: 'metric',
        title: 'Key Metrics',
        configuration: {},
        positionX: 0,
        positionY: 0,
        width: 6,
        height: 4,
        isVisible: true,
      },
      {
        id: 'default-chart',
        type: 'chart',
        title: 'Trends Overview',
        configuration: { chartType: 'line' },
        positionX: 6,
        positionY: 0,
        width: 6,
        height: 4,
        isVisible: true,
      },
    ],
    settings: {},
  };

  try {
    return await createDashboard(defaultDashboard);
  } catch (error) {
    console.error('Error creating default dashboard:', error);
    // Return a local fallback dashboard
    return {
      id: 'local-fallback',
      name: 'Local Dashboard',
      description: 'Local fallback dashboard',
      userId,
      isDefault: true,
      widgets: defaultDashboard.widgets,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {},
    };
  }
};
