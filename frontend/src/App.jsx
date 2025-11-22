import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'

// Pages
import Login from './pages/Login'
import OrganizationSignup from './pages/OrganizationSignup'
import ChangePassword from './pages/ChangePassword'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import AddEmployee from './pages/AddEmployee'
import EmployeeDetail from './pages/EmployeeDetail'
import Recruitment from './pages/Recruitment'
import Leave from './pages/Leave'
import Attendance from './pages/Attendance'
import Payroll from './pages/Payroll'
import Performance from './pages/Performance'
import Training from './pages/Training'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import EmployeePortal from './pages/EmployeePortal'
import Security from './pages/Security'

// -------------------
// Protected Route
// -------------------
function ProtectedRoute({ allowedRoles, children }) {
  const { user, userType, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div> // can replace with a spinner later
  }

  if (!user || (allowedRoles && !allowedRoles.includes(userType))) {
    return <Navigate to="/login" replace />
  }

  return children ? children : <Outlet />
}

// -------------------
// App Component
// -------------------
function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<OrganizationSignup />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Legacy redirect routes */}
        <Route path="/employer/login" element={<Navigate to="/login" replace />} />
        <Route path="/employee/login" element={<Navigate to="/login" replace />} />

        {/* Employer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['employer']} />}>
          <Route path="/employer" element={<Layout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/new" element={<AddEmployee />} />
            <Route path="employees/:id" element={<EmployeeDetail />} />
            <Route path="recruitment" element={<Recruitment />} />
            <Route path="leave" element={<Leave />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="performance" element={<Performance />} />
            <Route path="training" element={<Training />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="security" element={<Security />} />
          </Route>
        </Route>

        {/* Employee (ESS) Routes */}
        <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
          <Route path="/employee/portal" element={<EmployeePortal />} />
          <Route path="/employee/change-password" element={<ChangePassword />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Global Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App
