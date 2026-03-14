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
import OrderList from './pages/Orders/OrderList'
// import AddCar from './pages/carlist/AddCar'
import ClientManagement from './pages/ClientManagement/ClientManagement'
import AgencyManagement from './pages/agency-management/AgencyManagement'
import Calender from './pages/calender/Calender'
import TransactionsHistory from './pages/transictions-history/TransactionsHistory'
import FAQ from './pages/FAQ/FAQ'
import NotFound from './pages/NotFound/NotFound'
import Customise from './pages/ShopManagement/Customise/Customise'
import ShopCategory from './pages/ShopManagement/Category/ShopCategory'
import ShopList from './pages/ShopManagement/Shop/ShopList'
import ShopProducts from './pages/ShopManagement/Products/ShopProducts'
import SubscriberList from './pages/Subscribers/SubscriberList'
import AdManagement from './pages/AdManagement/AdManagement'
import PushNotificationList from './pages/PushNotification/PushNotificationList'
import ControllerList from './pages/Controllers/ControllerList'
import CompanyProjects from './pages/CompanyProjects/CompanyProjects'
import CustomerManagement from './pages/CustomerManagement/CustomerManagement'
import EmployeeManagement from './pages/EmployeeManagement/EmployeeManagement'
import Vehicles from './pages/Vehicles'
import Equipment from './pages/Equipment'
import ReviewList from './pages/Reviews/ReviewList'
import Communication from './pages/Communication/Communication'
import DocumentsApprovals from './pages/DocumentsApprovals/DocumentsApprovals'
import ProjectScheduling from './pages/ProjectScheduling/ProjectScheduling'
import ManageMaterials from './pages/ManageMaterials/ManageMaterials'
import CustomerFinance from './pages/CustomerFinance/CustomerFinance'
import Attendance from './pages/Attendance/Attendance'
import Payroll from './pages/Payroll'
import SafetyCompliance from './pages/SafetyCompliance/SafetyCompliance'
import ChangeOrders from './pages/ChangeOrders/ChangeOrders'
import DailySafetyReports from './pages/DailySafetyReports/DailySafetyReports'
import RecentProjects from './pages/RecentProjects'
import Notifications from './pages/Notifications/Notifications'
import MyTask from './pages/MyTask'

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
          <Route
            path="recent-projects"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                <RecentProjects />
              </RoleBasedRoute>
            }
          />

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

          {/* Project Scheduling - Employee */}
          <Route
            path="project-scheduling"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                <ProjectScheduling />
              </RoleBasedRoute>
            }
          />

          {/* Documents & Approvals - Employee */}
          <Route
            path="documents-approvals"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                <DocumentsApprovals />
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

          {/* Daily Safety Reports - Employee */}
          <Route
            path="daily-safety-reports"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                <DailySafetyReports />
              </RoleBasedRoute>
            }
          />

          {/* Admin-only routes - Redirect to dashboard (no employee access) */}
          <Route path="users" element={<RoleBasedRoute allowedRoles={[]}><UserList /></RoleBasedRoute>} />
          <Route path="subscribers" element={<RoleBasedRoute allowedRoles={[]}><SubscriberList /></RoleBasedRoute>} />
          <Route path="ad-management" element={<RoleBasedRoute allowedRoles={[]}><AdManagement /></RoleBasedRoute>} />
          <Route path="push-notification" element={<RoleBasedRoute allowedRoles={[]}><PushNotificationList /></RoleBasedRoute>} />
          <Route path="controllers" element={<RoleBasedRoute allowedRoles={[]}><ControllerList /></RoleBasedRoute>} />
          <Route path="agency-management" element={<RoleBasedRoute allowedRoles={[]}><AgencyManagement /></RoleBasedRoute>} />
          <Route path="company-projects" element={<RoleBasedRoute allowedRoles={[]}><CompanyProjects /></RoleBasedRoute>} />
          <Route path="customer-management" element={<RoleBasedRoute allowedRoles={[]}><CustomerManagement /></RoleBasedRoute>} />
          <Route path="employee-management" element={<RoleBasedRoute allowedRoles={[]}><EmployeeManagement /></RoleBasedRoute>} />
          <Route path="vehicles" element={<RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}><Vehicles /></RoleBasedRoute>} />
          <Route path="equipment" element={<RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}><Equipment /></RoleBasedRoute>} />
          <Route path="reviews" element={<RoleBasedRoute allowedRoles={[]}><ReviewList /></RoleBasedRoute>} />
          <Route
            path="manage-materials"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}>
                <ManageMaterials />
              </RoleBasedRoute>
            }
          />
          <Route path="customer-finance" element={<RoleBasedRoute allowedRoles={[]}><CustomerFinance /></RoleBasedRoute>} />
          <Route path="safety-compliance" element={<RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}><SafetyCompliance /></RoleBasedRoute>} />
          <Route path="change-orders" element={<RoleBasedRoute allowedRoles={[]}><ChangeOrders /></RoleBasedRoute>} />
          <Route path="transactions-history" element={<RoleBasedRoute allowedRoles={[]}><TransactionsHistory /></RoleBasedRoute>} />
          <Route path="orders" element={<RoleBasedRoute allowedRoles={[]}><OrderList /></RoleBasedRoute>} />

          {/* Admin-only routes (no employee access) */}
          <Route path="booking-management" element={<RoleBasedRoute allowedRoles={[]}><BookingManagement /></RoleBasedRoute>} />
          <Route path="calender" element={<RoleBasedRoute allowedRoles={[]}><Calender /></RoleBasedRoute>} />
          <Route path="clients" element={<RoleBasedRoute allowedRoles={[]}><ClientManagement /></RoleBasedRoute>} />
          <Route path="products" element={<RoleBasedRoute allowedRoles={[]}><ProductList /></RoleBasedRoute>} />
          <Route path="categories" element={<RoleBasedRoute allowedRoles={[]}><CategoryList /></RoleBasedRoute>} />
          <Route path="shop-management">
            <Route index element={<Navigate to="/shop-management/customise" replace />} />
            <Route path="customise" element={<RoleBasedRoute allowedRoles={[]}><Customise /></RoleBasedRoute>} />
            <Route path="category" element={<RoleBasedRoute allowedRoles={[]}><ShopCategory /></RoleBasedRoute>} />
            <Route path="shop" element={<RoleBasedRoute allowedRoles={[]}><ShopList /></RoleBasedRoute>} />
            <Route path="products" element={<RoleBasedRoute allowedRoles={[]}><ShopProducts /></RoleBasedRoute>} />
          </Route>

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
            <Route path="faq" element={<RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]}><FAQ /></RoleBasedRoute>} />
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
