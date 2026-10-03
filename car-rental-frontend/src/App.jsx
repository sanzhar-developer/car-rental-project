import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CarsPage from './pages/CarsPage';
import CarDetailPage from './pages/CarDetailPage';
import BookingsPage from './pages/BookingsPage';
import PenaltiesPage from './pages/PenaltiesPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminCarsPage from './pages/AdminCarsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminPenaltiesPage from './pages/AdminPenaltiesPage';
import AdminUsersPage from './pages/AdminUsersPage';
import useWebSocket from './hooks/useWebSocket';

const AppContent = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  // Initialize WebSocket connection
  useWebSocket();

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPath && <Header />}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/cars/:id" element={<CarDetailPage />} />

          {/* Protected Routes */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/penalties"
            element={
              <ProtectedRoute>
                <PenaltiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/cars"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminCarsPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminBookingsPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminCategoriesPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/penalties"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminPenaltiesPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminUsersPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      {!isAdminPath && <Footer />}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(22, 22, 42, 0.95)',
            color: '#fff',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            backdropFilter: 'blur(10px)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#34d399',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#f87171',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

