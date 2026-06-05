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
import ProfileSettings from '@/pages/Settings/Profile/ProfileSettings'
import ChangePassword from '@/pages/Settings/ChangePassword/ChangePassword'
import TermsSettings from '@/pages/Settings/Terms/TermsSettings'
import PrivacySettings from '@/pages/Settings/Privacy/PrivacySettings'
import AboutUsSettings from '@/pages/Settings/AboutUs/AboutUsSettings'
import NotFound from './pages/NotFound/NotFound'

  import Communication from './pages/Communication/Communication'
import Attendance from './pages/Attendance/Attendance'
import Notifications from './pages/Notifications/Notifications'
import MyTask from './pages/MyTask'
import Projects from './pages/Projects'
import EstimatesApprovals from './pages/EstimatesApprovals'
import InvoicePage from './pages/Invoice'
import PublicEstimatePage from './pages/PublicEstimate'
import ReviewList from './pages/Reviews/ReviewList'
import Payment from './pages/Payment'
import ChangeOrders from './pages/ChangeOrders/ChangeOrders'
import PermitsInspections from './pages/PermitsInspections/PermitsInspections'
import Documents from './pages/Documents'

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
        {/* Public Routes - No login required */}
        <Route path="/estimate/review/:id" element={<PublicEstimatePage />} />

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
              <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                <Dashboard />
              </RoleBasedRoute>
            }
          />

          {/* Notifications - Employee */}
          <Route
            path="notifications"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                <Notifications />
              </RoleBasedRoute>
            }
          />

   

          {/* Projects - Employee */}
          <Route
            path="projects"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                <Projects />
              </RoleBasedRoute>
            }
          />

          {/* Estimates & Approvals - Employee */}
          <Route
            path="estimates-approvals"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                <EstimatesApprovals />
              </RoleBasedRoute>
            }
          />

          {/* Invoice - Employee */}
          <Route
            path="invoice"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                <InvoicePage />
              </RoleBasedRoute>
            }
          />

          {/* My Task - Employee */}
          <Route
            path="my-task"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                <MyTask />
              </RoleBasedRoute>
            }
          />

          {/* Attendance - Employee */}
          <Route
            path="attendance"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                <Attendance />
              </RoleBasedRoute>
            }
          />

          {/* Communication - Employee */}
          <Route
            path="communication"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                <Communication />
              </RoleBasedRoute>
            }
          />

       

        

    

          {/* Payment - Employee */}
          <Route
            path="payment"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                <Payment />
              </RoleBasedRoute>
            }
          />

          {/* Documents - Employee */}
          <Route
            path="documents"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                <Documents />
              </RoleBasedRoute>
            }
          />

          {/* Change Orders - Employee */}
          <Route
            path="change-orders"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                <ChangeOrders />
              </RoleBasedRoute>
            }
          />

          {/* Permits & Inspections - Employee */}
          <Route
            path="permits-inspections"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                <PermitsInspections />
              </RoleBasedRoute>
            }
          />

       

          {/* Review - Employee */}
          <Route
            path="reviews"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                <ReviewList />
              </RoleBasedRoute>
            }
          />

          {/* Admin-only routes - Redirect to dashboard (no employee access) */}
   

          {/* Settings - Employee */}
          <Route path="settings">
            <Route
              path="profile"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                  <ProfileSettings />
                </RoleBasedRoute>
              }
            />
            <Route
              path="password"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                  <ChangePassword />
                </RoleBasedRoute>
              }
            />
            <Route
              path="terms"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                  <TermsSettings />
                </RoleBasedRoute>
              }
            />
            <Route
              path="privacy"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.USER]}>
                  <PrivacySettings />
                </RoleBasedRoute>
              }
            />
            <Route
              path="about-us"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.USER]}>
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
