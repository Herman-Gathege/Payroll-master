import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./contexts/AuthContext";

/* Layout */
import Layout from "./components/Layout";

/* Public Pages */
import Login from "./pages/Login";
import OrganizationSignup from "./pages/OrganizationSignup";

/* Employer Pages */
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import EmployeeDetail from "./pages/EmployeeDetail";
import DepartmentsPage from "./pages/DepartmentsPage";
import Recruitment from "./pages/Recruitment";
import Leave from "./pages/Leave";
import Attendance from "./pages/Attendance";
import Payroll from "./pages/Payroll";
import Performance from "./pages/Performance";
import Training from "./pages/Training";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Security from "./pages/Security";
import PayslipView from "./pages/PayslipView";

/* Salary Structures */
import SalaryStructuresList from "./pages/SalaryStructures/SalaryStructuresList";
import SalaryStructureCreate from "./pages/SalaryStructures/SalaryStructureCreate";
import SalaryStructureEdit from "./pages/SalaryStructures/SalaryStructureEdit";

/* Bulk Upload */
import BulkEmployeeUploadPage from "./pages/BulkEmployeeUploadPage";

/* Employee Portal */
import EmployeePortal from "./pages/EmployeePortal";
import ChangePassword from "./pages/ChangePassword";
import MySalaryStructure from "./pages/employee/MySalaryStructure";
import EmployeeSalaryAssignment from "./pages/employee/EmployeeSalaryAssignment";

/* ================= ROUTE GUARDS ================= */

function EmployerRoute({ children }) {
  const { user, userType, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user && userType === "employer"
    ? children
    : <Navigate to="/login" replace />;
}

function EmployeeRoute({ children }) {
  const { user, userType, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user && userType === "employee"
    ? children
    : <Navigate to="/login" replace />;
}

/* ================= APP ================= */

function App() {
  return (
    <>
      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<OrganizationSignup />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Backward compatibility */}
        <Route path="/employer/login" element={<Navigate to="/login" replace />} />
        <Route path="/employee/login" element={<Navigate to="/login" replace />} />

        {/* ================= EMPLOYER PORTAL ================= */}
        <Route
          path="/employer/*"
          element={
            <EmployerRoute>
              <Layout />
            </EmployerRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="departments" element={<DepartmentsPage />} />

          <Route path="employees" element={<Employees />} />
          <Route path="employees/new" element={<AddEmployee />} />

          {/* ✅ BULK EMPLOYEE UPLOAD */}
          <Route
            path="employees/bulk-upload"
            element={<BulkEmployeeUploadPage />}
          />

          <Route path="employees/:id/edit" element={<EditEmployee />} />
          <Route path="employees/:id" element={<EmployeeDetail />} />
          <Route
            path="employees/:id/salary-structure"
            element={<EmployeeSalaryAssignment />}
          />

          <Route path="payroll" element={<Payroll />} />
          <Route path="payroll/:payrollId" element={<PayslipView />} />

          <Route path="recruitment" element={<Recruitment />} />
          <Route path="leave" element={<Leave />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="performance" element={<Performance />} />
          <Route path="training" element={<Training />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="security" element={<Security />} />

          <Route path="salary-structures" element={<SalaryStructuresList />} />
          <Route
            path="salary-structures/create"
            element={<SalaryStructureCreate />}
          />
          <Route
            path="salary-structures/:id/edit"
            element={<SalaryStructureEdit />}
          />

          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ================= EMPLOYEE PORTAL ================= */}
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

        <Route
          path="/employee/salary-structure"
          element={
            <EmployeeRoute>
              <MySalaryStructure />
            </EmployeeRoute>
          }
        />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
