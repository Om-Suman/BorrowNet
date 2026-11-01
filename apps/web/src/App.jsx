import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminPage from './pages/AdminPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import ItemFormPage from './pages/ItemFormPage';
import NotFoundPage from './pages/NotFoundPage';
import ScrollToTop from './components/utils/ScrollToTop';

function ProfileRedirect() {
  const { user } = useAuth();
  if (user?.id) {
    return <Navigate to={`/users/${user.id}`} replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        
        {/* Listing Management Routes */}
        <Route path="/items/new" element={
          <ProtectedRoute>
            <ItemFormPage />
          </ProtectedRoute>
        } />
        <Route path="/items/:id" element={<ItemDetailsPage />} />
        <Route path="/items/:id/edit" element={
          <ProtectedRoute>
            <ItemFormPage />
          </ProtectedRoute>
        } />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />

        <Route path="/transactions" element={
          <ProtectedRoute>
            <TransactionsPage />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={<ProfileRedirect />} />
        <Route path="/users/:id" element={<UserProfilePage />} />
        
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminPage />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
    </>
  );
}
