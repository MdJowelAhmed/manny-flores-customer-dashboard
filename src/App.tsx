import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute'
import { UserRole } from '@/types/roles'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { loadUserFromStorage } from '@/redux/slices/authSlice'

// Auth Pages
import { Login, SignUp, ForgotPassword, VerifyEmail, ResetPassword } from '@/pages/Auth'

// Dashboard Pages
import Dashboard from '@/pages/Dashboard'
import UserList from '@/pages/Users/UserList'
import ProductList from '@/pages/Products/ProductList'
import CategoryList from '@/pages/Categories/CategoryList'
import ProfileSettings from '@/pages/Settings/Profile/ProfileSettings'
import ChangePassword from '@/pages/Settings/ChangePassword/ChangePassword'
import TermsSettings from '@/pages/Settings/Terms/TermsSettings'
import PrivacySettings from '@/pages/Settings/Privacy/PrivacySettings'
import AboutUsSettings from '@/pages/Settings/AboutUs/AboutUsSettings'
import BookingManagement from './pages/Booking/BookingManagement'
// import AddCar from './pages/carlist/AddCar'
import ClientManagement from './pages/ClientManagement/ClientManagement'
import Calender from './pages/calender/Calender'
import NotFound from './pages/NotFound/NotFound'

import Vehicles from './pages/Vehicles'
import Equipment from './pages/Equipment'
  import Communication from './pages/Communication/Communication'
import ManageMaterials from './pages/ManageMaterials/ManageMaterials'
import Attendance from './pages/Attendance/Attendance'
import Payroll from './pages/Payroll'
import Notifications from './pages/Notifications/Notifications'
import MyTask from './pages/MyTask'
import SafetyCompliance from './pages/SafetyCompliance/SafetyCompliance'

function AppEntryRedirect() {
  const { user } = useAppSelector((state) => state.auth)

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  return <Navigate to="/dashboard" replace />
}

function App() {
  const dispatch = useAppDispatch()

  // Load user from storage on app mount
  useEffect(() => {
    dispatch(loadUserFromStorage())
  }, [dispatch])

  return (
    <TooltipProvider>
      <Routes>
        {/* Auth Routes - No sidebar/header */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="/auth/login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AppEntryRedirect />} />

          {/* Dashboard - Employee */}
          <Route
            path="dashboard"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                <Dashboard />
              </RoleBasedRoute>
            }
          />

          {/* Notifications - Employee */}
          <Route
            path="notifications"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                <Notifications />
              </RoleBasedRoute>
            }
          />

          {/* Recent Projects - Employee */}
        

          {/* My Task - Employee */}
          <Route
            path="my-task"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                <MyTask />
              </RoleBasedRoute>
            }
          />

          {/* Attendance - Employee */}
          <Route
            path="attendance"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                <Attendance />
              </RoleBasedRoute>
            }
          />

          {/* Communication - Employee */}
          <Route
            path="communication"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                <Communication />
              </RoleBasedRoute>
            }
          />

       

        

          {/* Payroll - Employee */}
          <Route
            path="payroll"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                <Payroll />
              </RoleBasedRoute>
            }
          />

          {/* Safety Compliance - Employee */}
          <Route
            path="safety-compliance"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                <SafetyCompliance />
              </RoleBasedRoute>
            }
          />

          {/* Admin-only routes - Redirect to dashboard (no employee access) */}
          <Route path="users" element={<RoleBasedRoute allowedRoles={[]}><UserList /></RoleBasedRoute>} />
          <Route path="vehicles" element={<RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}><Vehicles /></RoleBasedRoute>} />
          <Route path="equipment" element={<RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}><Equipment /></RoleBasedRoute>} />
          <Route
            path="manage-materials"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                <ManageMaterials />
              </RoleBasedRoute>
            }
          />

          {/* Admin-only routes (no employee access) */}
          <Route path="calender" element={<RoleBasedRoute allowedRoles={[]}><Calender /></RoleBasedRoute>} />
          <Route path="clients" element={<RoleBasedRoute allowedRoles={[]}><ClientManagement /></RoleBasedRoute>} />
          <Route path="products" element={<RoleBasedRoute allowedRoles={[]}><ProductList /></RoleBasedRoute>} />
          <Route path="categories" element={<RoleBasedRoute allowedRoles={[]}><CategoryList /></RoleBasedRoute>} />
            

          {/* Settings - Employee */}
          <Route path="settings">
            <Route
              path="profile"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                  <ProfileSettings />
                </RoleBasedRoute>
              }
            />
            <Route
              path="password"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                  <ChangePassword />
                </RoleBasedRoute>
              }
            />
            <Route
              path="terms"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                  <TermsSettings />
                </RoleBasedRoute>
              }
            />
            <Route
              path="privacy"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                  <PrivacySettings />
                </RoleBasedRoute>
              }
            />
            <Route
              path="about-us"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                  <AboutUsSettings />
                </RoleBasedRoute>
              }
            />
          
          </Route>
        </Route>

        {/* Catch all - 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </TooltipProvider>
  )
}

export default App
