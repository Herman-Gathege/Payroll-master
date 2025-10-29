import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
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

// Employer route protection
function EmployerRoute({ children }) {
  const { user, userType, loading } = useAuth()
  
  console.log('EmployerRoute check:', { user: !!user, userType, loading })
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  return user && userType === 'employer' ? children : <Navigate to="/login" replace />
}

// Employee route protection
function EmployeeRoute({ children }) {
  const { user, userType, loading } = useAuth()
  
  console.log('EmployeeRoute check:', { user: !!user, userType, loading })
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  return user && userType === 'employee' ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <>
      <Routes>
        {/* Unified Login Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<OrganizationSignup />} />
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Legacy routes for backward compatibility */}
        <Route path="/employer/login" element={<Navigate to="/login" replace />} />
        <Route path="/employee/login" element={<Navigate to="/login" replace />} />

        {/* Employer Portal Routes */}
        <Route
          path="/employer/*"
          element={
            <EmployerRoute>
              <Layout />
            </EmployerRoute>
          }
        >
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
          <Route index element={<Navigate to="dashboard" />} />
        </Route>

        {/* Employee Portal Routes */}
        <Route
          path="/employee/portal"
          element={
            <EmployeeRoute>
              <EmployeePortal />
            </EmployeeRoute>
          }
        />
        <Route
          path="/employee/change-password"
          element={
            <EmployeeRoute>
              <ChangePassword />
            </EmployeeRoute>
          }
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App

