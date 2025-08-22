import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSignalR } from '../../contexts/SignalRContext';
import toast from 'react-hot-toast';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  refreshInterval: number;
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
    criticalAlerts: boolean;
  };
}

interface SystemConfig {
  dataRetention: number;
  maxDataPoints: number;
  autoBackup: boolean;
  backupFrequency: string;
  performanceMode: boolean;
  debugMode: boolean;
}

interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file' | 'stream';
  url: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  syncInterval: number;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { isConnected } = useSignalR();
  const [activeTab, setActiveTab] = useState<string>('preferences');
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    refreshInterval: 30,
    notifications: {
      email: true,
      push: true,
      sound: false,
      criticalAlerts: true,
    },
  });

  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    dataRetention: 90,
    maxDataPoints: 10000,
    autoBackup: true,
    backupFrequency: 'daily',
    performanceMode: false,
    debugMode: false,
  });

  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: '1',
      name: 'Primary Database',
      type: 'database',
      url: 'mongodb://localhost:27017',
      status: 'active',
      lastSync: new Date().toISOString(),
      syncInterval: 60,
    },
    {
      id: '2',
      name: 'External API',
      type: 'api',
      url: 'https://api.example.com/metrics',
      status: 'active',
      lastSync: new Date().toISOString(),
      syncInterval: 300,
    },
    {
      id: '3',
      name: 'File Import',
      type: 'file',
      url: '/uploads/metrics.csv',
      status: 'inactive',
      lastSync: new Date(Date.now() - 86400000).toISOString(),
      syncInterval: 1440,
    },
  ]);

  const [newDataSource, setNewDataSource] = useState<Partial<DataSource>>({
    name: '',
    type: 'api',
    url: '',
    syncInterval: 60,
  });

  const [showDataSourceModal, setShowDataSourceModal] = useState(false);

  // Save user preferences
  const saveUserPreferences = () => {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
    toast.success('User preferences saved successfully!');
  };

  // Save system configuration
  const saveSystemConfig = () => {
    localStorage.setItem('systemConfig', JSON.stringify(systemConfig));
    toast.success('System configuration saved successfully!');
  };

  // Add new data source
  const addDataSource = () => {
    if (!newDataSource.name || !newDataSource.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    const source: DataSource = {
      id: Date.now().toString(),
      name: newDataSource.name,
      type: newDataSource.type as DataSource['type'],
      url: newDataSource.url,
      status: 'inactive',
      lastSync: new Date().toISOString(),
      syncInterval: newDataSource.syncInterval || 60,
    };

    setDataSources(prev => [...prev, source]);
    setNewDataSource({ name: '', type: 'api', url: '', syncInterval: 60 });
    setShowDataSourceModal(false);
    toast.success('Data source added successfully!');
  };

  // Remove data source
  const removeDataSource = (id: string) => {
    setDataSources(prev => prev.filter(source => source.id !== id));
    toast.success('Data source removed successfully!');
  };

  // Test data source connection
  const testDataSource = (source: DataSource) => {
    // Simulate connection test
    toast.loading('Testing connection...');
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      if (success) {
        toast.success('Connection successful!');
        setDataSources(prev => prev.map(s => 
          s.id === source.id ? { ...s, status: 'active' } : s
        ));
      } else {
        toast.error('Connection failed. Please check your configuration.');
        setDataSources(prev => prev.map(s => 
          s.id === source.id ? { ...s, status: 'error' } : s
        ));
      }
    }, 2000);
  };

  // Export configuration
  const exportConfig = () => {
    const config = {
      userPreferences,
      systemConfig,
      dataSources,
      exportDate: new Date().toISOString(),
    };

    const data = JSON.stringify(config, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_config_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Configuration exported successfully!');
  };

  // Import configuration
  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        if (config.userPreferences) setUserPreferences(config.userPreferences);
        if (config.systemConfig) setSystemConfig(config.systemConfig);
        if (config.dataSources) setDataSources(config.dataSources);
        toast.success('Configuration imported successfully!');
      } catch (error) {
        toast.error('Invalid configuration file');
      }
    };
    reader.readAsText(file);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      setUserPreferences({
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        refreshInterval: 30,
        notifications: {
          email: true,
          push: true,
          sound: false,
          criticalAlerts: true,
        },
      });
      setSystemConfig({
        dataRetention: 90,
        maxDataPoints: 10000,
        autoBackup: true,
        backupFrequency: 'daily',
        performanceMode: false,
        debugMode: false,
      });
      toast.success('Settings reset to defaults');
    }
  };

  const tabs = [
    { id: 'preferences', name: 'User Preferences', icon: '👤' },
    { id: 'system', name: 'System Configuration', icon: '⚙️' },
    { id: 'datasources', name: 'Data Sources', icon: '🔗' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'security', name: 'Security', icon: '🔒' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select
                  value={userPreferences.theme}
                  onChange={(e) => setUserPreferences(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' | 'auto' }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={userPreferences.language}
                  onChange={(e) => setUserPreferences(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={userPreferences.timezone}
                  onChange={(e) => setUserPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                <select
                  value={userPreferences.dateFormat}
                  onChange={(e) => setUserPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Refresh Interval (seconds)</label>
                <input
                  type="number"
                  value={userPreferences.refreshInterval}
                  onChange={(e) => setUserPreferences(prev => ({ ...prev, refreshInterval: Number(e.target.value) }))}
                  min="5"
                  max="300"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={saveUserPreferences} className="btn-primary">
                Save Preferences
              </button>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention (days)</label>
                <input
                  type="number"
                  value={systemConfig.dataRetention}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, dataRetention: Number(e.target.value) }))}
                  min="1"
                  max="365"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Data Points</label>
                <input
                  type="number"
                  value={systemConfig.maxDataPoints}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, maxDataPoints: Number(e.target.value) }))}
                  min="1000"
                  max="100000"
                  step="1000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                <select
                  value={systemConfig.backupFrequency}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, backupFrequency: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoBackup"
                  checked={systemConfig.autoBackup}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, autoBackup: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoBackup" className="ml-2 block text-sm text-gray-900">
                  Enable automatic backups
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="performanceMode"
                  checked={systemConfig.performanceMode}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, performanceMode: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="performanceMode" className="ml-2 block text-sm text-gray-900">
                  Performance mode (reduces visual effects)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="debugMode"
                  checked={systemConfig.debugMode}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, debugMode: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="debugMode" className="ml-2 block text-sm text-gray-900">
                  Enable debug mode
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={saveSystemConfig} className="btn-primary">
                Save Configuration
              </button>
            </div>
          </div>
        );

      case 'datasources':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Data Sources</h3>
              <button
                onClick={() => setShowDataSourceModal(true)}
                className="btn-primary"
              >
                Add Data Source
              </button>
            </div>

            <div className="space-y-4">
              {dataSources.map((source) => (
                <div key={source.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        source.status === 'active' ? 'bg-green-500' :
                        source.status === 'inactive' ? 'bg-gray-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{source.name}</h4>
                        <p className="text-sm text-gray-500">{source.type} • {source.url}</p>
                        <p className="text-xs text-gray-400">
                          Last sync: {new Date(source.lastSync).toLocaleString()} • 
                          Interval: {source.syncInterval} minutes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => testDataSource(source)}
                        className="btn-secondary text-sm"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => removeDataSource(source.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={userPreferences.notifications.email}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, email: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                  Email notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pushNotifications"
                  checked={userPreferences.notifications.push}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, push: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-900">
                  Push notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="soundNotifications"
                  checked={userPreferences.notifications.sound}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, sound: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="soundNotifications" className="ml-2 block text-sm text-gray-900">
                  Sound notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="criticalAlerts"
                  checked={userPreferences.notifications.criticalAlerts}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, criticalAlerts: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="criticalAlerts" className="ml-2 block text-sm text-gray-900">
                  Critical alerts (always on)
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={saveUserPreferences} className="btn-primary">
                Save Notification Settings
              </button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Security Settings</h3>
                  <p className="mt-2 text-sm text-yellow-700">
                    Security settings are managed by your system administrator. Contact them for any changes.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <span className="text-sm text-gray-500">Enabled</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Session Timeout</h4>
                  <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                </div>
                <span className="text-sm text-gray-500">30 minutes</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Password Policy</h4>
                  <p className="text-sm text-gray-500">Requirements for strong passwords</p>
                </div>
                <span className="text-sm text-gray-500">Enforced</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your dashboard preferences and system settings</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportConfig}
            className="btn-secondary"
          >
            Export Config
          </button>
          <label className="btn-secondary cursor-pointer">
            Import Config
            <input
              type="file"
              accept=".json"
              onChange={importConfig}
              className="hidden"
            />
          </label>
          <button
            onClick={resetToDefaults}
            className="btn-secondary"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">U</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">User</p>
              <p className="text-2xl font-semibold text-gray-900">{user?.name || 'Guest'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                 isConnected ? 'bg-green-100' : 'bg-red-100'
               }`}>
                 <span className={`font-semibold ${
                   isConnected ? 'text-green-600' : 'text-red-600'
                 }`}>C</span>
               </div>
             </div>
             <div className="ml-4">
               <p className="text-sm font-medium text-gray-500">Connection</p>
               <p className="text-2xl font-semibold text-gray-900">{isConnected ? 'Connected' : 'Disconnected'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-semibold">V</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Version</p>
              <p className="text-2xl font-semibold text-gray-900">1.0.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Add Data Source Modal */}
      {showDataSourceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Data Source</h2>
                <button
                  onClick={() => setShowDataSourceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newDataSource.name}
                    onChange={(e) => setNewDataSource(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter data source name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newDataSource.type}
                    onChange={(e) => setNewDataSource(prev => ({ ...prev, type: e.target.value as DataSource['type'] }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="api">API</option>
                    <option value="database">Database</option>
                    <option value="file">File</option>
                    <option value="stream">Stream</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL/Connection String</label>
                  <input
                    type="text"
                    value={newDataSource.url}
                    onChange={(e) => setNewDataSource(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter URL or connection string"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sync Interval (minutes)</label>
                  <input
                    type="number"
                    value={newDataSource.syncInterval}
                    onChange={(e) => setNewDataSource(prev => ({ ...prev, syncInterval: Number(e.target.value) }))}
                    min="1"
                    max="1440"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDataSourceModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={addDataSource}
                  className="btn-primary"
                >
                  Add Source
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
