// Role definitions: employee (primary - employee dashboard)
export enum UserRole {
  EMPLOYEE = 'employee',
}

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole]

export interface RoutePermission {
  path: string
  allowedRoles: UserRole[]
  description?: string
}

/**
 * Feature-based access matrix (Employee Dashboard):
 * - employee: Dashboard, Profile, Attendance, Payroll, Projects, Documents, Communication, Safety Reports, Notifications
 */
export const FEATURE_ACCESS: Record<string, UserRole[]> = {
  dashboard: [UserRole.EMPLOYEE],
  profile: [UserRole.EMPLOYEE],
  attendance: [UserRole.EMPLOYEE],
  'payroll-management': [UserRole.EMPLOYEE],
  payroll: [UserRole.EMPLOYEE],
  'recent-projects': [UserRole.EMPLOYEE],
  projects: [UserRole.EMPLOYEE],
  'estimates-approvals': [UserRole.EMPLOYEE],
  invoice: [UserRole.EMPLOYEE],
  'project-scheduling': [UserRole.EMPLOYEE],
  'documents-approvals': [UserRole.EMPLOYEE],
  communication: [UserRole.EMPLOYEE],
  'daily-safety-reports': [UserRole.EMPLOYEE],
  notifications: [UserRole.EMPLOYEE],
  'my-task': [UserRole.EMPLOYEE],
  orders: [],
  'shop-management': [],
  'shop-management-shop': [],
  revenue: [],
  'user-management': [],
  subscribers: [],
  'ad-management': [],
  'push-notification': [],
  controllers: [],
  'company-projects': [],
  'customer-management': [],
  'employee-management': [],
  'vehicle-maintenance': [],
  vehicles: [UserRole.EMPLOYEE],
  'equipment-maintenance': [],
  equipment: [UserRole.EMPLOYEE],
  reviews: [UserRole.EMPLOYEE],
  'manage-materials': [UserRole.EMPLOYEE],
  payment: [UserRole.EMPLOYEE],
  'customer-finance': [],
  'resource-requests-report': [],
  'safety-compliance': [UserRole.EMPLOYEE],
  'change-orders': [UserRole.EMPLOYEE],
  'permits-inspections': [UserRole.EMPLOYEE],
}

export type FeatureKey = keyof typeof FEATURE_ACCESS

export const hasFeatureAccess = (userRole: UserRole, feature: FeatureKey): boolean => {
  const roles = FEATURE_ACCESS[feature]
  return roles ? roles.includes(userRole) : false
}
