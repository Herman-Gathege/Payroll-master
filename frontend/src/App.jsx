// File: frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
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

// 🧩 Import your new onboarding pages
import AgentRegister from './pages/AgentOnboarding/AgentRegister'
import AgentProfile from './pages/AgentOnboarding/AgentProfile'
import AgentDocuments from './pages/AgentOnboarding/AgentDocuments'
import AgentReview from './pages/AgentOnboarding/AgentReview'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* 🧩 Agent Onboarding Flow (Public entry, then private steps) */}
        <Route path="/agent/onboarding/register" element={<AgentRegister />} />
        <Route
          path="/agent/onboarding/profile"
          element={
            <PrivateRoute>
              <AgentProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/agent/onboarding/documents"
          element={
            <PrivateRoute>
              <AgentDocuments />
            </PrivateRoute>
          }
        />
        <Route
          path="/agent/onboarding/review"
          element={
            <PrivateRoute>
              <AgentReview />
            </PrivateRoute>
          }
        />

        {/* 🧭 Main HR system (Protected) */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
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
          <Route path="employee-portal" element={<EmployeePortal />} />
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App
