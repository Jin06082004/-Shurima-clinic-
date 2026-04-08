import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sidebar, Header } from '@/components/layout';
import { ToastProvider } from '@/components/ui';
import { canManageUsers } from '@/lib/permissions';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  AppointmentsPage,
  UsersPage,
  SchedulePage,
  NotificationsPage,
  ProfilePage,
} from '@/pages';
import { cn } from '@/lib/utils';

function AppLayout({ children, sidebarOpen }) {

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <Header />
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

function AuthRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PageRouter({ sidebarOpen }) {
  const location = useLocation();

  const renderPage = () => {
    switch (true) {
      case location.pathname === '/dashboard':
        return <DashboardPage />;
      case location.pathname === '/appointments':
        return <AppointmentsPage />;
      case location.pathname === '/users':
        if (!canManageUsers()) {
          return <Navigate to="/dashboard" replace />;
        }
        return <UsersPage />;
      case location.pathname === '/schedule':
        return <SchedulePage />;
      case location.pathname === '/notifications':
        return <NotificationsPage />;
      case location.pathname === '/profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return <AppLayout sidebarOpen={sidebarOpen}>{renderPage()}</AppLayout>;
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <RegisterPage />
          </AuthRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PageRouter sidebarOpen={sidebarOpen} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <PageRouter sidebarOpen={sidebarOpen} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <PageRouter sidebarOpen={sidebarOpen} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <PageRouter sidebarOpen={sidebarOpen} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <PageRouter sidebarOpen={sidebarOpen} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <PageRouter sidebarOpen={sidebarOpen} />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  console.log('🚀 App.jsx - Initializing app...');
  const token = localStorage.getItem('accessToken');
  console.log('🔐 App.jsx - Token exists:', token ? '✅ Yes' : '❌ No');

  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}