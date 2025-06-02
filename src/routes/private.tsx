import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/routes/ProtectedRoute';
import Dashboard from '../components/pages/Dashboard';
import Profile from '../components/pages/Profile';
import Universities from '../components/pages/Universities';
import UniversityDetails from '../components/pages/UniversityDetails';
import AdminDashboard from '../components/pages/admin/AdminDashboardPage';
import ManageUniversities from '../components/pages/admin/ManageUniversitiesPage';

export const privateRoutes = [
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    )
  },
  {
    path: '/universities',
    element: (
      <ProtectedRoute>
        <Universities />
      </ProtectedRoute>
    )
  },
  {
    path: '/universities/:id',
    element: (
      <ProtectedRoute>
        <UniversityDetails />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute roles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/universities',
    element: (
      <ProtectedRoute roles={['admin']}>
        <ManageUniversities />
      </ProtectedRoute>
    )
  }
];
