import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Login } from './pages/auth/Login';
import { RegisterTrainer } from './pages/auth/RegisterTrainer';
import { ChangePassword } from './pages/auth/ChangePassword';

import { TrainerDashboard } from './pages/trainer/TrainerDashboard';
import { ClientManagement } from './pages/trainer/ClientManagement';
import { ClientDetail } from './pages/trainer/ClientDetail';
import { RevenueDashboard } from './pages/trainer/RevenueDashboard';
import { NotificationsManager } from './pages/trainer/NotificationsManager';

import { ClientDashboard } from './pages/client/ClientDashboard';
import { MyWorkouts } from './pages/client/MyWorkouts';
import { MyDiet } from './pages/client/MyDiet';
import { DailyCheckInPage } from './pages/client/DailyCheckInPage';
import { MyProgress } from './pages/client/MyProgress';
import { MyPhotos } from './pages/client/MyPhotos';
import { MyPayments } from './pages/client/MyPayments';

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <Navbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex flex-1 relative">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl w-full">
          <Routes>
            {/* Shared Authenticated Routes */}
            <Route element={<ProtectedRoute allowedRoles={['TRAINER', 'CLIENT']} />}>
              <Route path="/change-password" element={<ChangePassword />} />
            </Route>

            {/* Trainer Routes */}
            <Route element={<ProtectedRoute allowedRoles={['TRAINER']} />}>
              <Route path="/trainer" element={<TrainerDashboard />} />
              <Route path="/trainer/clients" element={<ClientManagement />} />
              <Route path="/trainer/clients/:id" element={<ClientDetail />} />
              <Route path="/trainer/payments" element={<RevenueDashboard />} />
              <Route path="/trainer/notifications" element={<NotificationsManager />} />
            </Route>

            {/* Client Routes */}
            <Route element={<ProtectedRoute allowedRoles={['CLIENT']} />}>
              <Route path="/client" element={<ClientDashboard />} />
              <Route path="/client/workouts" element={<MyWorkouts />} />
              <Route path="/client/diet" element={<MyDiet />} />
              <Route path="/client/checkin" element={<DailyCheckInPage />} />
              <Route path="/client/progress" element={<MyProgress />} />
              <Route path="/client/photos" element={<MyPhotos />} />
              <Route path="/client/payments" element={<MyPayments />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'TRAINER' ? '/trainer' : '/client'} replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register-trainer" element={<RegisterTrainer />} />
          <Route path="/" element={<RootRedirect />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
