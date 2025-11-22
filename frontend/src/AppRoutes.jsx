import { Routes, Route, Navigate } from 'react-router-dom'
import Employees from './pages/Employees'
import EmployeeDetail from './pages/EmployeeDetail'
import AddEmployee from './pages/AddEmployee'
import UpdateEmployee from './pages/UpdateEmployee'
import EmployeePortal from './pages/EmployeePortal'
import ESSProfile from './pages/ESSProfile'
import ESSEditProfile from './pages/ESSEditProfile'
import ESSDocuments from './pages/ESSDocuments'
import Login from './pages/Login'

/**
 * Authentication Guard
 */
const PrivateRoute = ({ children, allowedRoles }) => {
  const userType = localStorage.getItem('userType')
  if (!userType || (allowedRoles && !allowedRoles.includes(userType))) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Employer Routes */}
      <Route
        path="/employees"
        element={
          <PrivateRoute allowedRoles={['employer']}>
            <Employees />
          </PrivateRoute>
        }
      />
      <Route
        path="/employees/new"
        element={
          <PrivateRoute allowedRoles={['employer']}>
            <AddEmployee />
          </PrivateRoute>
        }
      />
      <Route
        path="/employees/:id"
        element={
          <PrivateRoute allowedRoles={['employer']}>
            <UpdateEmployee />
          </PrivateRoute>
        }
      />
      <Route
        path="/employee-portal/:id"
        element={
          <PrivateRoute allowedRoles={['employer']}>
            <EmployeeDetail />
          </PrivateRoute>
        }
      />

      {/* Employee (ESS) Routes */}
      <Route
        path="/ess/home"
        element={
          <PrivateRoute allowedRoles={['employee']}>
            <EmployeePortal />
          </PrivateRoute>
        }
      />
      <Route
        path="/ess/profile"
        element={
          <PrivateRoute allowedRoles={['employee']}>
            <ESSProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/ess/edit"
        element={
          <PrivateRoute allowedRoles={['employee']}>
            <ESSEditProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/ess/documents"
        element={
          <PrivateRoute allowedRoles={['employee']}>
            <ESSDocuments />
          </PrivateRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
