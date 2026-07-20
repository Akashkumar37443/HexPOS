import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { PortalSelection } from './pages/Login/PortalSelection.js';
import { ManagementLogin } from './pages/Login/ManagementLogin.js';
import { StaffLogin } from './pages/Login/StaffLogin.js';
import { POSView } from './pages/POS/POSView.js';
import { ManagementLayout } from './components/layout/ManagementLayout.js';
import { SuperAdminDashboard } from './pages/SuperAdmin/SuperAdminDashboard.js';
import { AdminDashboard } from './pages/Admin/AdminDashboard.js';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    if (allowedRoles.includes('server') || allowedRoles.includes('cashier')) {
      return <Navigate to="/login/staff" replace />;
    }
    if (allowedRoles.includes('admin') || allowedRoles.includes('super_admin')) {
      return <Navigate to="/login/management" replace />;
    }
    return <Navigate to="/" replace />;
  }

  if (user && !allowedRoles.includes(user.role as string)) {
    // If not allowed, redirect to portal selection
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Login Routes */}
          <Route path="/" element={<PortalSelection />} />
          <Route path="/login/management" element={<ManagementLogin />} />
          <Route path="/login/staff" element={<StaffLogin />} />

          {/* Protected POS Routes */}
          <Route 
            path="/pos" 
            element={
              <ProtectedRoute allowedRoles={['server', 'cashier']}>
                <POSView />
              </ProtectedRoute>
            } 
          />

          {/* Protected Management Routes */}
          <Route 
            path="/super-admin" 
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <ManagementLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperAdminDashboard />} />
            {/* Other super admin sub-routes would go here */}
            <Route path="*" element={<Navigate to="/super-admin" replace />} />
          </Route>

          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManagementLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="staff" element={<AdminDashboard />} /> {/* Temp alias */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* Catch all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
