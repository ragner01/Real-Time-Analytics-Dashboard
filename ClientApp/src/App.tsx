import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Metrics from './pages/Metrics/Metrics';
import Reports from './pages/Reports/Reports';
import Predictions from './pages/Predictions/Predictions';
import Settings from './pages/Settings/Settings';
import { SignalRProvider } from './contexts/SignalRContext';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SignalRProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </SignalRProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
